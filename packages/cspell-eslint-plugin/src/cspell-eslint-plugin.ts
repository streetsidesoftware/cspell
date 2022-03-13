// cspell:ignore TSESTree
import type { TSESTree } from '@typescript-eslint/types';
import assert from 'assert';
import { createTextDocument, CSpellSettings, DocumentValidator, ValidationIssue } from 'cspell-lib';
import type { Rule } from 'eslint';
// eslint-disable-next-line node/no-missing-import
import type { Comment, Identifier, Literal, Node, TemplateElement, ImportSpecifier } from 'estree';
import { format } from 'util';
import { normalizeOptions } from './options';
import optionsSchema from './_auto_generated_/options.schema.json';

const schema = optionsSchema as unknown as Rule.RuleMetaData['schema'];

interface PluginRules {
    ['spellchecker']: Rule.RuleModule;
}

const messages = {
    wordUnknown: 'Unknown word: "{{word}}"',
    wordForbidden: 'Forbidden word: "{{word}}"',
    suggestWord: '{{word}}',
} as const;

type Messages = typeof messages;
type MessageIds = keyof Messages;

const meta: Rule.RuleMetaData = {
    docs: {
        description: 'CSpell spellchecker',
        category: 'Possible Errors',
        recommended: false,
    },
    messages,
    hasSuggestions: true,
    schema: [schema],
};

type ASTNode = (Node | Comment) & Partial<Rule.NodeParentExtension>;

const defaultSettings: CSpellSettings = {
    patterns: [
        // @todo: be able to use cooked / transformed strings.
        // {
        //     // Do not block unicode escape sequences.
        //     name: 'js-unicode-escape',
        //     pattern: /$^/g,
        // },
    ],
};

let isDebugMode = false;
function log(...args: Parameters<typeof console.log>) {
    if (!isDebugMode) return;
    console.log(...args);
}

function create(context: Rule.RuleContext): Rule.RuleListener {
    const options = normalizeOptions(context.options[0]);
    const toIgnore = new Set<string>();
    const importedIdentifiers = new Set<string>();
    isDebugMode = options.debugMode || false;
    isDebugMode && logContext(context);
    const doc = createTextDocument({ uri: context.getFilename(), content: context.getSourceCode().getText() });
    const validator = new DocumentValidator(doc, options, defaultSettings);
    validator.prepareSync();

    function checkLiteral(node: Literal & Rule.NodeParentExtension) {
        if (!options.checkStrings) return;
        if (typeof node.value === 'string') {
            debugNode(node, node.value);
            if (options.ignoreImports && isImportOrRequired(node)) return;
            if (options.ignoreImportProperties && isImportedProperty(node)) return;
            checkNodeText(node, node.value);
        }
    }

    function checkTemplateElement(node: TemplateElement & Rule.NodeParentExtension) {
        if (!options.checkStringTemplates) return;
        debugNode(node, node.value);
        // console.log('Template: %o', node.value);
        checkNodeText(node, node.value.cooked || node.value.raw);
    }

    function checkIdentifier(node: Identifier & Rule.NodeParentExtension) {
        debugNode(node, node.name);
        if (options.ignoreImports) {
            if (isRawImportIdentifier(node)) {
                toIgnore.add(node.name);
                return;
            }
            if (isImportIdentifier(node)) {
                importedIdentifiers.add(node.name);
                if (isLocalImportIdentifierUnique(node)) {
                    checkNodeText(node, node.name);
                }
                return;
            } else if (options.ignoreImportProperties && isImportedProperty(node)) {
                return;
            }
        }
        if (!options.checkIdentifiers) return;
        if (toIgnore.has(node.name) && !isObjectProperty(node)) return;
        if (skipCheckForRawImportIdentifiers(node)) return;
        checkNodeText(node, node.name);
    }

    function checkComment(node: Comment) {
        if (!options.checkComments) return;
        debugNode(node, node.value);
        checkNodeText(node, node.value);
    }

    function checkNodeText(node: ASTNode, text: string) {
        if (!node.range) return;

        const adj = node.type === 'Literal' ? 1 : 0;
        const range = [node.range[0] + adj, node.range[1] - adj] as const;

        const scope: string[] = calcScope(node);
        const result = validator.checkText(range, text, scope);
        result.forEach((issue) => reportIssue(issue));
    }

    function calcScope(_node: ASTNode): string[] {
        // inheritance(node);
        return [];
    }

    function isImportIdentifier(node: ASTNode): boolean {
        const parent = node.parent;
        if (node.type !== 'Identifier' || !parent) return false;
        return (
            (parent.type === 'ImportSpecifier' ||
                parent.type === 'ImportNamespaceSpecifier' ||
                parent.type === 'ImportDefaultSpecifier') &&
            parent.local === node
        );
    }

    function isRawImportIdentifier(node: ASTNode): boolean {
        const parent = node.parent;
        if (node.type !== 'Identifier' || !parent) return false;
        return (
            (parent.type === 'ImportSpecifier' && parent.imported === node) ||
            (parent.type === 'ExportSpecifier' && parent.local === node)
        );
    }

    function isLocalImportIdentifierUnique(node: ASTNode): boolean {
        const parent = getImportParent(node);
        if (!parent) return true;
        const { imported, local } = parent;
        if (imported.name !== local.name) return true;
        return imported.range?.[0] !== local.range?.[0] && imported.range?.[1] !== local.range?.[1];
    }

    function getImportParent(node: ASTNode): ImportSpecifier | undefined {
        const parent = node.parent;
        return parent?.type === 'ImportSpecifier' ? parent : undefined;
    }

    function skipCheckForRawImportIdentifiers(node: ASTNode): boolean {
        if (options.ignoreImports) return false;
        const parent = getImportParent(node);
        return !!parent && parent.imported === node && !isLocalImportIdentifierUnique(node);
    }

    function isImportedProperty(node: ASTNode): boolean {
        const obj = findOriginObject(node);
        return !!obj && obj.type === 'Identifier' && importedIdentifiers.has(obj.name);
    }

    function isObjectProperty(node: ASTNode): boolean {
        return node.parent?.type === 'MemberExpression';
    }

    function reportIssue(issue: ValidationIssue) {
        const messageId: MessageIds = issue.isFlagged ? 'wordForbidden' : 'wordUnknown';
        const data = {
            word: issue.text,
        };
        const code = context.getSourceCode();
        const start = issue.offset;
        const end = issue.offset + (issue.length || issue.text.length);
        const startPos = code.getLocFromIndex(start);
        const endPos = code.getLocFromIndex(end);
        const loc = { start: startPos, end: endPos };

        function fixFactory(word: string): Rule.ReportFixer {
            return (fixer) => fixer.replaceTextRange([start, end], word);
        }

        function createSug(word: string): Rule.SuggestionReportDescriptor {
            const data = { word };
            const messageId: MessageIds = 'suggestWord';

            return {
                messageId,
                data,
                fix: fixFactory(word),
            };
        }

        log('Suggestions: %o', issue.suggestions);
        const suggest: Rule.ReportDescriptorOptions['suggest'] = issue.suggestions?.map(createSug);

        const des: Rule.ReportDescriptor = {
            messageId,
            data,
            loc,
            suggest,
        };
        context.report(des);
    }

    context
        .getSourceCode()
        .getAllComments()
        .forEach(function (commentNode) {
            checkComment(commentNode);
        });

    return {
        Literal: checkLiteral,
        TemplateElement: checkTemplateElement,
        Identifier: checkIdentifier,
    };

    function mapNode(node: ASTNode | TSESTree.Node, index: number, nodes: ASTNode[]): string {
        const child = nodes[index + 1];
        if (node.type === 'ImportSpecifier') {
            const extra = node.imported === child ? '.imported' : node.local === child ? '.local' : '';
            return node.type + extra;
        }
        if (node.type === 'ImportDeclaration') {
            const extra = node.source === child ? '.source' : '';
            return node.type + extra;
        }
        if (node.type === 'ExportSpecifier') {
            const extra = node.exported === child ? '.exported' : node.local === child ? '.local' : '';
            return node.type + extra;
        }
        if (node.type === 'ExportNamedDeclaration') {
            const extra = node.source === child ? '.source' : '';
            return node.type + extra;
        }
        if (node.type === 'Property') {
            const extra = node.key === child ? 'key' : node.value === child ? 'value' : '';
            return [node.type, node.kind, extra].join('.');
        }
        if (node.type === 'MemberExpression') {
            const extra = node.property === child ? 'property' : node.object === child ? 'object' : '';
            return node.type + '.' + extra;
        }
        if (node.type === 'ArrowFunctionExpression') {
            const extra = node.body === child ? 'body' : 'param';
            return node.type + '.' + extra;
        }
        if (node.type === 'FunctionDeclaration') {
            const extra = node.id === child ? 'id' : node.body === child ? 'body' : 'params';
            return node.type + '.' + extra;
        }
        if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
            const extra = node.id === child ? 'id' : node.body === child ? 'body' : 'superClass';
            return node.type + '.' + extra;
        }
        if (node.type === 'CallExpression') {
            const extra = node.callee === child ? 'callee' : 'arguments';
            return node.type + '.' + extra;
        }
        if (node.type === 'Literal') {
            return tagLiteral(node);
        }
        if (node.type === 'Block') {
            return node.value[0] === '*' ? 'Comment.docBlock' : 'Comment.block';
        }
        if (node.type === 'Line') {
            return 'Comment.line';
        }
        return node.type;
    }

    function inheritance(node: ASTNode) {
        const a = [...context.getAncestors(), node];
        return a.map(mapNode);
    }

    function inheritanceSummary(node: ASTNode) {
        return inheritance(node).join(' ');
    }

    /**
     * find the origin of a member expression
     */
    function findOriginObject(node: ASTNode): ASTNode | undefined {
        const parent = node.parent;
        if (parent?.type !== 'MemberExpression' || parent.property !== node) return undefined;
        let obj = parent.object;
        while (obj.type === 'MemberExpression') {
            obj = obj.object;
        }
        return obj;
    }

    function isFunctionCall(node: ASTNode | undefined, name: string): boolean {
        return node?.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === name;
    }

    function isRequireCall(node: ASTNode | undefined) {
        return isFunctionCall(node, 'require');
    }

    function isImportOrRequired(node: ASTNode) {
        return isRequireCall(node.parent) || (node.parent?.type === 'ImportDeclaration' && node.parent.source === node);
    }

    function debugNode(node: ASTNode, value: unknown) {
        if (!isDebugMode) return;
        const val = format('%o', value);
        log(`${inheritanceSummary(node)}: ${val}`);
    }
}

function tagLiteral(node: ASTNode | TSESTree.Node): string {
    assert(node.type === 'Literal');
    const kind = typeof node.value;
    const extra =
        kind === 'string'
            ? node.raw?.[0] === '"'
                ? 'string.double'
                : 'string.single'
            : node.value === null
            ? 'null'
            : kind;
    return node.type + '.' + extra;
}

export const rules: PluginRules = {
    spellchecker: {
        meta,
        create,
    },
};

function logContext(context: Rule.RuleContext) {
    log('\n\n************************');
    // log(context.getSourceCode().text);
    log(`

id: ${context.id}
cwd: ${context.getCwd()}
filename: ${context.getFilename()}
physicalFilename: ${context.getPhysicalFilename()}
scope: ${context.getScope().type}
`);
}

export const configs = {
    recommended: {
        plugins: ['@cspell'],
        rules: {
            '@cspell/spellchecker': ['warn', {}],
        },
    },
    debug: {
        plugins: ['@cspell'],
        rules: {
            '@cspell/spellchecker': ['warn', { debugMode: true }],
        },
    },
};
