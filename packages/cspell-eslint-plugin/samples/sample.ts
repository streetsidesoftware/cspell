import type { Rule } from 'eslint';
import { join, relative as rel } from 'path';
import type { Literal, TemplateElement, Identifier, Node, Comment } from 'estree';
import { format } from 'util';
import path from 'path/posix';

interface PluginRules {
    ['cspell']: Rule.RuleModule;
}

const meta: Rule.RuleMetaData = {
    docs: {
        description: 'CSpell',
    },
};

/**
 * This is my Sample class.
 */
export class MyClass {
    constructor(readonly name: string) {}

    get length() {
        return this.name.length;
    }
}
