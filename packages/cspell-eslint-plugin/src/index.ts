import type { Rule } from 'eslint';
// eslint-disable-next-line node/no-missing-import
import type { Literal, TemplateElement, Identifier, Node, Comment } from 'estree';
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
    console.log(context.getSourceCode().getText());

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
}

type AstNode = Node & Rule.NodeParentExtension;

function inheritance(node: AstNode) {
    const parts: string[] = [];

    for (let n: AstNode | undefined = node; n; n = n.parent) {
        parts.push(n.type);
    }

    return parts.reverse().join('.');
}

export const rules: PluginRules = {
    cspell: {
        meta,
        create,
    },
};
