import { RuleTester } from 'eslint';
import * as rule from './index';
import * as fs from 'fs';
import * as path from 'path';

let _sampleTs: string | undefined;
const root = path.resolve(__dirname, '..');

const ruleTester = new RuleTester({
    env: {
        es6: true,
    },

    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true,
        },
    },
    overrides: [
        {
            files: '**/*.ts',
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
            parser: '@typescript-eslint/parser',
        },
    ],
});

ruleTester.run('cspell', rule.rules.cspell, {
    valid: [
        // "import * as jest from 'jest'",
        // "import { jestFn as jestFunc} from 'jest'",
        // 'const mocha = require("mocha");',
        // 'async function* values(iter) { yield* iter; }',
        // 'var foo = true',
        // 'const x = `It is now time to add everything up: \\` ${y} + ${x}`',
        sampleCodeJS(),
        sampleTs(),
    ],
    invalid: [],
});

function sampleCodeJS() {
    return `
"use strict"

import * as fs from 'fs';
const commander = require('commander');

export const help = \`
This is some help.
\`;

/**
 * run code
 */
export function command(cmd) {
  const prompt = "Enter your name:";

  return prompt;
}


command(commander);
`;
}

function resolveFromMonoRepo(file: string): string {
    return path.resolve(root, file);
}

function sampleTs(): RuleTester.ValidTestCase {
    const filename = path.resolve(root, './samples/sample.ts');
    _sampleTs = _sampleTs || fs.readFileSync(filename, 'utf-8');
    const code = _sampleTs;
    return {
        code,
        filename,
        parser: resolveFromMonoRepo('node_modules/@typescript-eslint/parser'),
    };
}
