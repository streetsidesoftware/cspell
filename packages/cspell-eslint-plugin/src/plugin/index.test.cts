import { RuleTester } from 'eslint';
import * as fs from 'fs';
import * as path from 'path';

import * as Rule from './index.cjs';

const root = path.resolve(__dirname, '../..');
const fixturesDir = path.join(root, 'fixtures');

const parsers: Record<string, string | undefined> = {
    // Note: it is possible for @typescript-eslint/parser to break the path
    '.ts': resolveFromMonoRepo('@typescript-eslint/parser'),
};

type ValidTestCase = RuleTester.ValidTestCase;
type Options = Partial<Rule.Options>;

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
        readFix('with-errors/sampleESM.mjs', {
            cspell: {
                words: ['Guuide', 'Gallaxy', 'BADD', 'functionn', 'coool'],
                ignoreWords: [],
                flagWords: [],
            },
        }),
        readFix('with-errors/sampleESM.mjs', {
            cspell: {
                ignoreWords: ['Guuide', 'Gallaxy', 'BADD', 'functionn', 'coool'],
            },
        }),
        readFix('issue-4870/sample.js', {
            cspell: {
                dictionaries: ['business-terms'],
                dictionaryDefinitions: [
                    {
                        name: 'business-terms',
                        path: fixtureRelativeToCwd('issue-4870/dictionaries/business-terminology.txt'),
                    },
                ],
            },
        }),
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
            { checkIdentifiers: false },
        ),
        readInvalid(
            'with-errors/sampleESM.mjs',
            ['Unknown word: "Guuide"', 'Unknown word: "Gallaxy"', 'Unknown word: "BADD"', 'Unknown word: "coool"'],
            { checkComments: false },
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
            { ignoreImports: false },
        ),
        readInvalid(
            'with-errors/imports.ts',
            ['Unknown word: "grrrrr"', 'Unknown word: "muawhahaha"', 'Unknown word: "uuuug"'],
            { ignoreImportProperties: false },
        ),
        // cspell:ignore uuug grrr
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
            { ignoreImports: false },
        ),
        // cspell:ignore GRRRRRR UUUUUG
        readInvalid(
            'with-errors/creepyData.ts',
            ['Unknown word: "uuug"', 'Unknown word: "grrr"', 'Unknown word: "GRRRRRR"', 'Unknown word: "UUUUUG"'],
            { ignoreImports: false, customWordListFile: resolveFix('with-errors/creepyData.dict.txt') },
        ),
        readInvalid(
            'with-errors/auto-fix.ts',
            [
                'Forbidden word: "bluelist"',
                'Forbidden word: "café"',
                'Forbidden word: "Bluelist"',
                'Forbidden word: "bluelist"',
                'Forbidden word: "bluelist"',
                'Forbidden word: "bluelist"',
            ],
            { ignoreImports: false, customWordListFile: resolveFix('with-errors/creepyData.dict.txt') },
        ),
        // cspell:ignore bestbusiness friendz
        readInvalid('issue-4870/sample.js', ['Unknown word: "bestbusiness"', 'Unknown word: "friendz"'], {}),
        readInvalid('issue-4870/sample.js', ['Unknown word: "friendz"'], {
            cspell: { allowCompoundWords: true },
        }),
    ],
});

const ruleTesterReact = new RuleTester({
    env: {
        es6: true,
    },

    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    overrides: [
        {
            files: '**/*.tsx',
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript', 'plugin:react/recommended'],
            parser: '@typescript-eslint/parser',
        },
        {
            files: '**/*.jsx',
            extends: ['eslint:recommended', 'plugin:react/recommended'],
        },
    ],
});

ruleTesterReact.run('cspell with React', Rule.rules.spellchecker, {
    valid: [readSample('react/sample.jsx'), readSample('react/sample.tsx')],
    invalid: [
        // cspell:ignore Welcomeeeee Summmer
        readInvalid('with-errors/react/sample.jsx', ['Unknown word: "Welcomeeeee"', 'Unknown word: "Summmer"']),
        readInvalid('with-errors/react/sample.tsx', ['Unknown word: "Welcomeeeee"', 'Unknown word: "Summmer"']),
        readInvalid('with-errors/react/sample.tsx', ['Unknown word: "Summmer"'], { checkJSXText: false }),
        readInvalid('with-errors/react/sample.jsx', ['Unknown word: "Summmer"'], { checkJSXText: false }),
    ],
});

function resolveFromMonoRepo(file: string): string {
    const packagePath = require.resolve(file, {
        paths: [root],
    });
    // console.error('resolveFromMonoRepo %o', packagePath);
    return packagePath;
}

function resolveFix(filename: string): string {
    return path.resolve(fixturesDir, filename);
}

function readFix(filename: string, options?: Options): ValidTestCase {
    const __filename = resolveFix(filename);
    const code = fs.readFileSync(__filename, 'utf-8');

    const sample: ValidTestCase = {
        code,
        filename: __filename,
    };
    if (options) {
        sample.options = [options];
    }

    const parser = parsers[path.extname(__filename)];
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

function fixtureRelativeToCwd(filename: string) {
    const fixFile = resolveFix(filename);
    return path.relative(process.cwd(), fixFile);
}
