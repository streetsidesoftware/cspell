import type { Rule } from 'eslint';
import { join, relative as rel } from 'path';
import { promises as fs } from 'fs';
import type { Literal, TemplateElement, Identifier, Node, Comment } from 'estree';
import { format } from 'util';
import path from 'path/posix';

const _utils = {
    path,
    format,
};

let p = _utils.path.join.name;

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

    getName() {
        return this.name;
    }

    asFilename() {
        return createFilename(this.name, '.txt');
    }

    asRelative(toDir: string) {
        return rel(this.asFilename(), toDir);
    }

    async read(): Promise<string> {
        const content = await fs.readFile(this.asFilename(), 'utf-8');
        return content;
    }
}

function createFilename(name: string, ext: string): string {
    return join('./', name + ext);
}
export class AppError extends Error {
    constructor(readonly msg: string) {
        super(msg);
    }
}
