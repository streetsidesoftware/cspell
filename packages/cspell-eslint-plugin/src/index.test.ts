import { RuleTester } from 'eslint';
import * as Rule from './index';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const fixturesDir = path.join(root, 'fixtures');

const parsers: Record<string, string | undefined> = {
    '.ts': resolveFromMonoRepo('node_modules/@typescript-eslint/parser'),
};

type CachedSample = RuleTester.ValidTestCase;
type Options = Partial<Rule.Options>;

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

ruleTester.run('cspell', Rule.rules.spellchecker, {
    valid: [
        readSample('sample.js'),
        readSample('sample.ts'),
        readSample('sampleESM.mjs'),
        readFix('with-errors/strings.ts', { checkStrings: false, checkStringTemplates: false }),
        readFix('with-errors/imports.ts'),
    ],
    invalid: [
        // cspell:ignore Guuide Gallaxy BADD functionn coool
        readInvalid('with-errors/sampleESM.mjs', [
            'Unknown word: "Guuide"',
            'Unknown word: "Gallaxy"',
            'Unknown word: "BADD"',
            'Unknown word: "functionn"',
            'Unknown word: "coool"',
            'Unknown word: "coool"',
        ]),
        readInvalid(
            'with-errors/sampleESM.mjs',
            ['Unknown word: "Guuide"', 'Unknown word: "Gallaxy"', 'Unknown word: "functionn"', 'Unknown word: "coool"'],
            { checkIdentifiers: false }
        ),
        readInvalid(
            'with-errors/sampleESM.mjs',
            ['Unknown word: "Guuide"', 'Unknown word: "Gallaxy"', 'Unknown word: "BADD"', 'Unknown word: "coool"'],
            { checkComments: false }
        ),
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
        // cspell:ignore naaame doen't isssues playy
        readInvalid('with-errors/strings.ts', [
            'Unknown word: "naaame"',
            'Unknown word: "doen\'t"',
            'Unknown word: "isssues"',
            'Unknown word: "playy"',
        ]),
        readInvalid('with-errors/strings.ts', ['Unknown word: "isssues"', 'Unknown word: "playy"'], {
            checkStrings: false,
        }),
        readInvalid('with-errors/strings.ts', ['Unknown word: "naaame"', 'Unknown word: "doen\'t"'], {
            checkStringTemplates: false,
        }),
        // cspell:ignore muawhahaha grrrrr uuuug
        readInvalid(
            'with-errors/imports.ts',
            [
                'Unknown word: "muawhahaha"',
                'Unknown word: "grrrrr"',
                'Unknown word: "muawhahaha"',
                'Unknown word: "muawhahaha"',
                'Unknown word: "uuuug"',
            ],
            { ignoreImports: false }
        ),
        readInvalid(
            'with-errors/imports.ts',
            ['Unknown word: "grrrrr"', 'Unknown word: "muawhahaha"', 'Unknown word: "uuuug"'],
            { ignoreImportProperties: false }
        ),
        // cspell:ignore uuug
        readInvalid('with-errors/importAlias.ts', ['Unknown word: "uuug"']),
        readInvalid('with-errors/importAlias.ts', ['Unknown word: "uuug"'], { ignoreImportProperties: false }),
        readInvalid(
            'with-errors/importAlias.ts',
            [
                'Unknown word: "uuug"',
                'Unknown word: "uuug"',
                'Unknown word: "muawhahaha"',
                'Unknown word: "grrr"',
                'Unknown word: "uuug"',
                'Unknown word: "grrr"',
            ],
            { ignoreImports: false }
        ),
    ],
});

function resolveFromMonoRepo(file: string): string {
    return path.resolve(root, file);
}

function readFix(_filename: string, options?: Options): CachedSample {
    const s = sampleFiles.get(_filename);
    if (s) return s;

    const filename = path.resolve(fixturesDir, _filename);
    const code = fs.readFileSync(filename, 'utf-8');

    const sample: CachedSample = {
        code,
        filename,
    };
    if (options) {
        sample.options = [options];
    }

    const parser = parsers[path.extname(filename)];
    if (parser) {
        sample.parser = parser;
    }

    return sample;
}

function readSample(sampleFile: string, options?: Options) {
    return readFix(path.join('samples', sampleFile), options);
}

function readInvalid(filename: string, errors: RuleTester.InvalidTestCase['errors'], options?: Options) {
    const sample = readFix(filename, options);
    return {
        ...sample,
        errors,
    };
}
