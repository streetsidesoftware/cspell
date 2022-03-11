// cspell:ignore TSESTree
import type { TSESTree } from '@typescript-eslint/types';
import assert from 'assert';
import { createTextDocument, CSpellSettings, DocumentValidator, ValidationIssue } from 'cspell-lib';
import type { Rule } from 'eslint';
// eslint-disable-next-line node/no-missing-import
import type { Comment, Identifier, Literal, Node, TemplateElement } from 'estree';
import { format } from 'util';
import { defaultOptions, type Options } from './options';
import optionsSchema from './options.schema.json';

const schema = optionsSchema as unknown as Rule.RuleMetaData['schema'];

interface PluginRules {
    ['spellchecker']: Rule.RuleModule;
}

const messages = {
    wordUnknown: 'Unknown word: {{word}}',
    wordForbidden: 'Forbidden word: {{word}}',
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

type ASTNode = Node | Comment;

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
    const options: Options = context.options[0] || defaultOptions;
    isDebugMode = options.debugMode;
    isDebugMode && logContext(context);
    const doc = createTextDocument({ uri: context.getFilename(), content: context.getSourceCode().getText() });
    const validator = new DocumentValidator(doc, options, defaultSettings);
    validator.prepareSync();

    function checkLiteral(node: Literal & Rule.NodeParentExtension) {
        debugNode(node, node.value);
        if (typeof node.value === 'string') {
            checkNodeText(node, node.value);
        }
    }

    function checkTemplateElement(node: TemplateElement & Rule.NodeParentExtension) {
        debugNode(node, node.value);
        // console.log('Template: %o', node.value);
        checkNodeText(node, node.value.cooked || node.value.raw);
    }

    function checkIdentifier(node: Identifier & Rule.NodeParentExtension) {
        debugNode(node, node.name);
        checkNodeText(node, node.name);
    }

    function checkComment(node: Comment) {
        debugNode(node, node.value);
        checkNodeText(node, node.value);
    }

    function checkNodeText(node: ASTNode, text: string) {
        if (!node.range) return;

        const adj = node.type === 'Literal' ? 1 : 0;
        const range = [node.range[0] + adj, node.range[1] - adj] as const;

        const scope = inheritance(node);
        const result = validator.checkText(range, text, scope);
        result.forEach((issue) => reportIssue(issue));
    }

    function reportIssue(issue: ValidationIssue) {
        // const messageId = issue.isFlagged ? 'cspell-forbidden-word' : 'cspell-unknown-word';
        const messageId: MessageIds = issue.isFlagged ? 'wordForbidden' : 'wordUnknown';
        const data = {
            word: issue.text,
        };
        const code = context.getSourceCode();
        const a = issue.offset;
        const b = issue.offset + (issue.length || issue.text.length);
        const start = code.getLocFromIndex(a);
        const end = code.getLocFromIndex(b);
        const loc = { start, end };

        function fixFactory(word: string): Rule.ReportFixer {
            return (fixer) => fixer.replaceTextRange([a, b], word);
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
    log('Source code: \n ************************ \n\n');
    log(context.getSourceCode().text);
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
