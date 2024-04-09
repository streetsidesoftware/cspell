import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import typeScriptParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import react from 'eslint-plugin-react';
import globals from 'globals';

import type { Options as RuleOptions } from '../plugin/index.cjs';
import Rule from '../plugin/index.cjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '../..');
const fixturesDir = path.join(root, 'fixtures');

const parsers: Record<string, string | undefined | unknown> = {
    // Note: it is possible for @typescript-eslint/parser to break the path
    '.ts': typeScriptParser,
};

type ValidTestCase = RuleTester.ValidTestCase;
type Options = Partial<RuleOptions>;

const ruleTester = new RuleTester({});

const KnownErrors: TestCaseError[] = [
    ce('Unknown word: "Summmer"', 8),
    ce('Unknown word: "friendz"', 8),
    ce('Forbidden word: "Bluelist"', 8),
    ce('Forbidden word: "bluelist"', 8),
    ce('Forbidden word: "café"', 8),
    ce('Unknown word: "uuug"', 8),
    ce('Unknown word: "Welcomeeeee"', 0),
    ce('Unknown word: "bestbusiness"', 0),
    ce('Unknown word: "muawhahaha"', 0),
    ce('Unknown word: "uuuug"', 0),
    ce('Unknown word: "grrr"', 8),
    ce('Unknown word: "GRRRRRR"', 1),
    ce('Unknown word: "UUUUUG"', 3),
    ce('Unknown word: "grrrrr"', 8),
    ce('Unknown word: "naaame"', 8),
    ce(`Unknown word: "doen't"`, 8),
    ce('Unknown word: "isssues"', 8),
    ce('Unknown word: "playy"', 8),
    ce('Unknown word: "Guuide"', 8),
    ce('Unknown word: "Gallaxy"', 8),
    ce('Unknown word: "BADD"', 8),
    ce('Unknown word: "coool"', 8),
    ce('Unknown word: "functionn"', 8),
    ce('Unknown word: "Todayy"', 8),
    ce('Unknown word: "Montj"', 8),
    ce('Unknown word: "Yaar"', 8),
    ce('Unknown word: "Februarry"', 6),
    ce('Unknown word: "Aprill"', 8),
    ce('Unknown word: "gooo"', 8),
    ce('Unknown word: "weeek"', 8),
];

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
            'Unknown word: "Todayy"',
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
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
        react,
    },
    languageOptions: {
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
        globals: {
            ...globals.browser,
        },
    },
    // ... others are omitted for brevity
});

ruleTesterReact.run('cspell with React', Rule.rules.spellchecker, {
    valid: [readSample('react/sample.jsx'), readSample('react/sample.tsx')],
    invalid: [
        // cspell:ignore Welcomeeeee Summmer
        readInvalid('with-errors/react/sample.jsx', ['Unknown word: "Welcomeeeee"', 'Unknown word: "Summmer"']),
        readInvalid('with-errors/react/sample.tsx', ['Unknown word: "Welcomeeeee"', 'Unknown word: "Summmer"']),
        readInvalid('with-errors/react/sample.tsx', ['Unknown word: "Summmer"'], {
            checkJSXText: false,
        }),
        readInvalid('with-errors/react/sample.jsx', ['Unknown word: "Summmer"'], {
            checkJSXText: false,
        }),
    ],
});

function resolveFix(filename: string): string {
    return path.resolve(fixturesDir, filename);
}

interface ValidTestCaseEsLint9 extends ValidTestCase {
    languageOptions?: {
        parser?: unknown;
    };
}

function readFix(filename: string, options?: Options): ValidTestCase {
    const __filename = resolveFix(filename);
    const code = fs.readFileSync(__filename, 'utf-8');

    const sample: ValidTestCaseEsLint9 = {
        code,
        filename: __filename,
    };
    if (options) {
        sample.options = [options];
    }

    const parser = parsers[path.extname(__filename)];
    if (parser) {
        sample.languageOptions ??= {};
        sample.languageOptions.parser = parser;
    }

    return sample;
}

function readSample(sampleFile: string, options?: Options) {
    return readFix(path.join('samples', sampleFile), options);
}

interface TestCaseError {
    message?: string | RegExp | undefined;
    messageId?: string | undefined;
    type?: string | undefined;
    data?: unknown | undefined;
    line?: number | undefined;
    column?: number | undefined;
    endLine?: number | undefined;
    endColumn?: number | undefined;
    suggestions?: RuleTester.SuggestionOutput[] | undefined | number;
}

type InvalidTestCaseError = RuleTester.TestCaseError | TestCaseError | string;

function readInvalid(filename: string, errors: (TestCaseError | string)[], options?: Options) {
    const sample = readFix(filename, options);
    return {
        ...sample,
        errors: errors.map((err) => csError(err)),
    };
}

function fixtureRelativeToCwd(filename: string) {
    const fixFile = resolveFix(filename);
    return path.relative(process.cwd(), fixFile);
}

function ce(message: string, suggestions?: number): RuleTester.TestCaseError {
    return { message, suggestions } as RuleTester.TestCaseError;
}

function csError(error: InvalidTestCaseError, suggestions?: number): RuleTester.TestCaseError {
    if (error && typeof error === 'object') return error as RuleTester.TestCaseError;
    const found = KnownErrors.find((e) => e.message === error) as RuleTester.TestCaseError | undefined;
    return found || ce(error, suggestions);
}
