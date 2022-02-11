// cspell:ignore TSESTree
import type { TSESTree } from '@typescript-eslint/types';
import type { Rule } from 'eslint';
// eslint-disable-next-line node/no-missing-import
import type { Comment, Identifier, Literal, Node, TemplateElement } from 'estree';
import { format } from 'util';

interface PluginRules {
    ['cspell']: Rule.RuleModule;
}

const meta: Rule.RuleMetaData = {
    docs: {
        description: 'CSpell',
    },
};

function create(context: Rule.RuleContext): Rule.RuleListener {
    console.log('Source code: \n ************************ \n\n');
    console.log(context.getSourceCode().getText());
    console.log(`

id: ${context.id}
cwd: ${context.getCwd()}
filename: ${context.getFilename()}
physicalFilename: ${context.getPhysicalFilename()}
scope: ${context.getScope().type}
`);

    function checkLiteral(node: Literal & Rule.NodeParentExtension) {
        const val = format('%o', node.value);
        console.log(`${inheritance(node)}: ${val}`);
    }

    function checkTemplateElement(node: TemplateElement & Rule.NodeParentExtension) {
        const val = format('%o', node.value);
        console.log(`${inheritance(node)}: ${val}`);
    }

    function checkIdentifier(node: Identifier & Rule.NodeParentExtension) {
        const val = format('%o', node.name);
        console.log(`${inheritance(node)}: ${val}`);
    }

    function checkComment(node: Comment) {
        const val = format('%o', node);
        console.log(`Comment: ${val}`);
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
            return [node.type, extra].join('.');
        }
        return node.type;
    }

    function inheritance(node: Node) {
        const a = [...context.getAncestors(), node];
        return a.map(mapNode).join('.');
    }
}

export const rules: PluginRules = {
    cspell: {
        meta,
        create,
    },
};
