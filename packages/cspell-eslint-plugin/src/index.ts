// cspell:ignore TSESTree
import type { TSESTree } from '@typescript-eslint/types';
import assert from 'assert';
import type { Rule } from 'eslint';
// eslint-disable-next-line node/no-missing-import
import type { Comment, Identifier, Literal, Node, TemplateElement } from 'estree';
import { format } from 'util';
import { createTextDocument, DocumentValidator, ValidationIssue } from 'cspell-lib';

interface PluginRules {
    ['cspell']: Rule.RuleModule;
}

const meta: Rule.RuleMetaData = {
    docs: {
        description: 'CSpell',
    },
};

const isDebugMode = false;

const log: typeof console.log = isDebugMode ? console.log : () => undefined;

function create(context: Rule.RuleContext): Rule.RuleListener {
    const doc = createTextDocument({ uri: context.getFilename(), content: context.getSourceCode().getText() });
    const validator = new DocumentValidator(doc, {}, {});
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
        if (typeof node.value === 'string') {
            checkNodeText(node, node.value);
        }
        debugNode(node, node.value);
    }

    function checkTemplateElement(node: TemplateElement & Rule.NodeParentExtension) {
        debugNode(node, node.value);
    }

    function checkIdentifier(node: Identifier & Rule.NodeParentExtension) {
        debugNode(node, node.name);
    }

    function checkComment(node: Comment) {
        const val = format('%o', node);
        log(`Comment: ${val}`);
    }

    function checkNodeText(node: Node, text: string) {
        if (!node.range || !node.loc) return;

        const scope = inheritance(node);
        const result = validator.checkText(node.range, text, scope);
        if (result.length) {
            console.error('%o', result);
        }
        result.forEach((issue) => reportIssue(node, issue));
    }

    function reportIssue(node: Node, issue: ValidationIssue) {
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

    function mapNode(node: Node | TSESTree.Node, index: number, nodes: Node[]): string {
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

    function inheritance(node: Node) {
        const a = [...context.getAncestors(), node];
        return a.map(mapNode);
    }

    function inheritanceSummary(node: Node) {
        return inheritance(node).join(' ');
    }

    function debugNode(node: Node, value: unknown) {
        if (!isDebugMode) return;
        const val = format('%o', value);
        log(`${inheritanceSummary(node)}: ${val}`);
    }
}

function tagLiteral(node: Node | TSESTree.Node): string {
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
    cspell: {
        meta,
        create,
    },
};
