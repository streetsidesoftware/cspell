import { RuleTester } from 'eslint';
import * as rule from './index';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const fixturesDir = path.join(root, 'fixtures');

const parsers: Record<string, string | undefined> = {
    '.ts': resolveFromMonoRepo('node_modules/@typescript-eslint/parser'),
};

type CachedSample = RuleTester.ValidTestCase;

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

ruleTester.run('cspell', rule.rules.spellchecker, {
    valid: [readSample('sample.js'), readSample('sample.ts'), readSample('sampleESM.mjs')],
    invalid: [
        // cspell:ignore Guuide Gallaxy BADD functionn
        readInvalid('with-errors/sampleESM.mjs', [
            'Unknown word: "Guuide"',
            'Unknown word: "Gallaxy"',
            'Unknown word: "BADD"',
            'Unknown word: "functionn"',
        ]),
        // cspell:ignore Montj Todayy Yaar Aprill Februarry gooo weeek
        readInvalid('with-errors/sampleTemplateString.mjs', [
            { message: 'Unknown word: "Todayy"' },
            'Unknown word: "Montj"',
            'Unknown word: "Yaar"',
            'Unknown word: "Februarry"',
            'Unknown word: "Aprill"',
            'Unknown word: "gooo"',
            'Unknown word: "weeek"',
        ]),
    ],
});

function resolveFromMonoRepo(file: string): string {
    return path.resolve(root, file);
}

function readFix(_filename: string): CachedSample {
    const s = sampleFiles.get(_filename);
    if (s) return s;

    const filename = path.resolve(fixturesDir, _filename);
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

function readSample(sampleFile: string) {
    return readFix(path.join('samples', sampleFile));
}

function readInvalid(filename: string, errors: RuleTester.InvalidTestCase['errors']) {
    const sample = readFix(filename);
    return {
        ...sample,
        errors,
    };
}
