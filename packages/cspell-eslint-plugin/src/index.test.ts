import { RuleTester } from 'eslint';
import * as rule from './index';
import * as fs from 'fs';
import * as path from 'path';

let _sampleTs: string | undefined;
const root = path.resolve(__dirname, '..');
const samplesDir = path.join(root, 'samples');

const parsers: Record<string, string | undefined> = {
    '.ts': resolveFromMonoRepo('node_modules/@typescript-eslint/parser'),
};
interface CachedSample {
    code: string;
    filename: string;
    parser?: string;
}

const sampleFiles = new Map<string, CachedSample>();

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
        // readSample('sample.js'),
        readSample('sample.ts'),
        readSample('sampleESM.mjs'),
        // readSample('sample.json'),
    ],
    invalid: [],
});

function resolveFromMonoRepo(file: string): string {
    return path.resolve(root, file);
}

function readSample(_filename: string): CachedSample {
    const s = sampleFiles.get(_filename);
    if (s) return s;

    const filename = path.resolve(samplesDir, _filename);
    const code = fs.readFileSync(filename, 'utf-8');

    const sample: CachedSample = {
        code,
        filename,
    };

    const parser = parsers[path.extname(filename)];
    if (parser) {
        sample.parser = parser;
    }

    return sample;
}
