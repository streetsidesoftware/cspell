// cspell:ignore TSESTree
import type { TSESTree } from '@typescript-eslint/types';
import assert from 'assert';
import type { Rule } from 'eslint';
// eslint-disable-next-line node/no-missing-import
import type { Comment, Identifier, Literal, Node, TemplateElement } from 'estree';
import { format } from 'util';
import { createTextDocument, DocumentValidator, ValidationIssue, CSpellSettings } from 'cspell-lib';

interface PluginRules {
    ['spellchecker']: Rule.RuleModule;
}

const meta: Rule.RuleMetaData = {
    docs: {
        description: 'CSpell',
    },
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

const isDebugMode = false;

const log: typeof console.log = isDebugMode ? console.log : () => undefined;

function create(context: Rule.RuleContext): Rule.RuleListener {
    const doc = createTextDocument({ uri: context.getFilename(), content: context.getSourceCode().getText() });
    const validator = new DocumentValidator(doc, {}, defaultSettings);
    validator.prepareSync();

    log('Source code: \n ************************ \n\n');
    log(doc.text);
    log(`

id: ${context.id}
cwd: ${context.getCwd()}
filename: ${context.getFilename()}
physicalFilename: ${context.getPhysicalFilename()}
scope: ${context.getScope().type}
`);

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
        checkNodeText(node, node.value);
        const val = format('%o', node);
        log(`Comment: ${val}`);
    }

    function checkNodeText(node: ASTNode, text: string) {
        if (!node.range) return;

        const adj = node.type === 'Literal' ? 1 : 0;
        const range = [node.range[0] + adj, node.range[1] - adj] as const;

        const scope = inheritance(node);
        const result = validator.checkText(range, text, scope);
        if (result.length) {
            log('%o', result);
        }
        result.forEach((issue) => reportIssue(issue));
    }

    function reportIssue(issue: ValidationIssue) {
        // const messageId = issue.isFlagged ? 'cspell-forbidden-word' : 'cspell-unknown-word';
        const messageType = issue.isFlagged ? 'Forbidden' : 'Unknown';
        const message = `${messageType} word: "${issue.text}"`;
        const code = context.getSourceCode();
        const start = code.getLocFromIndex(issue.offset);
        const end = code.getLocFromIndex(issue.offset + (issue.length || issue.text.length));
        const loc = { start, end };

        const des: Rule.ReportDescriptor = {
            message,
            loc,
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
