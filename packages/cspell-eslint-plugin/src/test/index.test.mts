import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import typeScriptParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import { RuleTester } from 'eslint';

import type { Options as RuleOptions } from '../plugin/index.cjs';
import Rule from '../plugin/index.cjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '../..');
const fixturesDir = path.join(root, 'fixtures');
const setOfKnownTestCases = new Set<string>();

const parsers: Record<string, Linter.Parser | undefined> = {
    // Note: it is possible for @typescript-eslint/parser to break the path
    '.ts': typeScriptParser,
};

// cspell:ignore configg cityssm

type ValidTestCase = RuleTester.ValidTestCase;
type Options = Partial<RuleOptions>;

const ruleTester = new RuleTester({});

const KnownErrors: TestCaseError[] = [
    ce('Unknown word: "friendz"', 8),
    ce('Forbidden word: "Bluelist"', 8),
    ce('Forbidden word: "bluelist"', 8),
    ce('Forbidden word: "café"', 8),
    ce('Unknown word: "uuug"', 8),
    ce('Unknown word: "bestbusiness"', 0),
    ce('Unknown word: "muawhahaha"', 0),
    ce('Unknown word: "uuuug"', 1),
    ce('Unknown word: "configg"', 8),
    ce('Unknown word: "cityssm"', 8),
    ce('Unknown word: "grrr"', 8),
    ce('Unknown word: "GRRRRRR"', 1),
    ce('Unknown word: "UUUUUG"', 5),
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
        readSample('sample.js', 'sample.js'),
        readSample('sample.ts', 'sample.ts'),
        readSample('sampleESM.mjs', 'sampleESM.mjs'),
        readFix('simple/sample.ts', 'simple/sample.ts'),
        readFix('simple/sampleESM.mjs', 'simple/sampleESM.mjs'),
        readFix('with-errors/strings.ts checkString: false, checkStringTemplates: false', 'with-errors/strings.ts', {
            checkStrings: false,
            checkStringTemplates: false,
        }),
        readFix('with-errors/imports.ts', 'with-errors/imports.ts'),
        readFix('with-errors/sampleESM.mjs words', 'with-errors/sampleESM.mjs', {
            cspell: {
                words: ['Guuide', 'Gallaxy', 'BADD', 'functionn', 'coool'],
                ignoreWords: [],
                flagWords: [],
            },
        }),
        readFix('with-errors/sampleESM.mjs ignoreWords', 'with-errors/sampleESM.mjs', {
            cspell: {
                ignoreWords: ['Guuide', 'Gallaxy', 'BADD', 'functionn', 'coool'],
            },
        }),
        readFix('with-errors/auto-fix.ts customWordListFile', 'with-errors/auto-fix.ts', {
            ignoreImports: false,
            customWordListFile: resolveFix('with-errors/creepyData.dict.txt'),
            // Load a configuration to ignore the forbidden words.
            configFile: resolveFix('cspell.test.config.yaml'),
        }),
        readFix('issue-4870/sample.js', 'issue-4870/sample.js', {
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
        readInvalid('with-errors/sampleESM.mjs', 'with-errors/sampleESM.mjs', [
            'Unknown word: "Guuide"',
            'Unknown word: "Gallaxy"',
            'Unknown word: "BADD"',
            'Unknown word: "functionn"',
            'Unknown word: "coool"',
            'Unknown word: "coool"',
        ]),
        readInvalid(
            'with-errors/sampleESM.mjs ignoreRegExpList',
            'with-errors/sampleESM.mjs',
            [
                'Unknown word: "Gallaxy"',
                'Unknown word: "BADD"',
                'Unknown word: "functionn"',
                'Unknown word: "coool"',
                'Unknown word: "coool"',
            ],
            { cspell: { ignoreRegExpList: ['/\\bGuuide\\b/g'] } },
        ),
        readInvalid(
            'with-errors/sampleESM.mjs checkIdentifiers: false',
            'with-errors/sampleESM.mjs',
            ['Unknown word: "Guuide"', 'Unknown word: "Gallaxy"', 'Unknown word: "functionn"', 'Unknown word: "coool"'],
            { checkIdentifiers: false },
        ),
        readInvalid(
            'with-errors/sampleESM.mjs checkComments: false',
            'with-errors/sampleESM.mjs',
            ['Unknown word: "Guuide"', 'Unknown word: "Gallaxy"', 'Unknown word: "BADD"', 'Unknown word: "coool"'],
            { checkComments: false },
        ),
        // cspell:ignore Montj Todayy Yaar Aprill Februarry gooo weeek
        readInvalid('with-errors/sampleTemplateString.mjs', 'with-errors/sampleTemplateString.mjs', [
            'Unknown word: "Todayy"',
            'Unknown word: "Montj"',
            'Unknown word: "Yaar"',
            'Unknown word: "Februarry"',
            'Unknown word: "Aprill"',
            'Unknown word: "gooo"',
            ce('Misspelled word: "weeek" (week)', 8),
        ]),
        // cspell:ignore naaame doen't isssues playy
        readInvalid('with-errors/strings.ts', 'with-errors/strings.ts', [
            'Unknown word: "naaame"',
            'Unknown word: "doen\'t"',
            ce('Misspelled word: "isssues" (issues)', 8),
            'Unknown word: "playy"',
        ]),
        readInvalid(
            'with-errors/strings.ts checkStrings: false',
            'with-errors/strings.ts',
            [ce('Misspelled word: "isssues" (issues)', 8), 'Unknown word: "playy"'],
            {
                checkStrings: false,
            },
        ),
        readInvalid(
            'with-errors/strings.ts checkStringTemplates: false',
            'with-errors/strings.ts',
            ['Unknown word: "naaame"', 'Unknown word: "doen\'t"'],
            {
                checkStringTemplates: false,
            },
        ),
        // cspell:ignore muawhahaha grrrrr uuuug
        readInvalid(
            'with-errors/imports.ts',
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
            'with-errors/imports.ts ignoreImportProperties: false',
            'with-errors/imports.ts',
            ['Unknown word: "grrrrr"', 'Unknown word: "muawhahaha"', 'Unknown word: "uuuug"'],
            { ignoreImportProperties: false },
        ),
        // cspell:ignore uuug grrr
        readInvalid('with-errors/importAlias.ts', 'with-errors/importAlias.ts', ['Unknown word: "uuug"']),
        readInvalid(
            'with-errors/importAlias.ts ignoreImportProperties: false',
            'with-errors/importAlias.ts',
            ['Unknown word: "uuug"'],
            { ignoreImportProperties: false },
        ),
        readInvalid(
            'with-errors/importAlias.ts ignoreImports false',
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
            'with-errors/creepyData.ts custom word list',
            'with-errors/creepyData.ts',
            ['Unknown word: "uuug"', 'Unknown word: "grrr"', 'Unknown word: "GRRRRRR"', 'Unknown word: "UUUUUG"'],
            { ignoreImports: false, customWordListFile: resolveFix('with-errors/creepyData.dict.txt') },
        ),
        readInvalid(
            'Auto fix forbidden words',
            'with-errors/auto-fix.ts',
            [
                ce('Forbidden word: "bluelist" (greenList)', 8),
                ce('Forbidden word: "café" (cafe)', 8),
                ce('Forbidden word: "Bluelist" (GreenList)', 8),
                ce('Forbidden word: "bluelist" (greenList)', 8),
                ce('Forbidden word: "bluelist" (greenList)', 8),
                ce('Forbidden word: "bluelist" (greenList)', 8),
            ],
            { ignoreImports: false, customWordListFile: resolveFix('with-errors/creepyData.dict.txt') },
        ),
        // cspell:ignore bestbusiness friendz flaggedmagicword suggestedmagicword contans issusesesse magicword renaim
        readInvalid(
            'issue-4870',
            'issue-4870/sample.js',
            ['Unknown word: "bestbusiness"', 'Unknown word: "friendz"'],
            {},
        ),
        readInvalid('issue-4870 allowCompoundWords', 'issue-4870/sample.js', ['Unknown word: "friendz"'], {
            cspell: { allowCompoundWords: true },
        }),
        readInvalid(
            'Report all issues',
            'issue-8261/sample.js',
            [
                ce('Forbidden word: "flaggedmagicword" (flagged_magicword)', 1),
                ce('Forbidden word: "flaggedmagicword" (flagged_magicword)', 1),
                ce('Misspelled word: "suggestedmagicword" (suggested_magicword)', 1),
                ce('Misspelled word: "contans" (contains)', 8),
                ce('Unknown word: "issusesesse"', 1),
                ce('Unknown word: "refain"', 8), // cspell:ignore refain
            ],
            {
                report: 'all',
            },
        ),
        readInvalid(
            'Report forbidden only',
            'issue-8261/sample.js',
            [
                ce('Forbidden word: "flaggedmagicword" (flagged_magicword)', 1),
                ce('Forbidden word: "flaggedmagicword" (flagged_magicword)', 1),
            ],
            {
                report: 'flagged',
            },
        ),
        readInvalid(
            'Report typos only',
            'issue-8261/sample.js',
            [
                ce('Forbidden word: "flaggedmagicword" (flagged_magicword)', 1),
                ce('Forbidden word: "flaggedmagicword" (flagged_magicword)', 1),
                ce('Misspelled word: "suggestedmagicword" (suggested_magicword)', 1),
                ce('Misspelled word: "contans" (contains)', 1),
            ],
            {
                report: 'typos',
            },
        ),
        readInvalid(
            'Report simple only',
            'issue-8261/sample.js',
            [
                ce('Forbidden word: "flaggedmagicword" (flagged_magicword)', 1),
                ce('Forbidden word: "flaggedmagicword" (flagged_magicword)', 1),
                ce('Misspelled word: "suggestedmagicword" (suggested_magicword)', 1),
                ce('Misspelled word: "contans" (contains)', 1),
                ce('Unknown word: "refain" (regain, remain, retain, refrain)', 4), // cspell:ignore refain
            ],
            {
                report: 'simple',
            },
        ),
        readInvalid(
            'simple/sample.ts',
            'simple/sample.ts',
            ['Unknown word: "configg"', 'Unknown word: "configg"', 'Unknown word: "cityssm"'],
            { ignoreImports: false },
        ),
    ],
});

function resolveFix(filename: string): string {
    return path.resolve(fixturesDir, filename);
}

type ValidTestCaseEsLint9 = ValidTestCase;

function readFix(name: string, filename: string, options?: Options): ValidTestCase {
    const __filename = resolveFix(filename);
    const code = fs.readFileSync(__filename, 'utf8');

    const sample: ValidTestCaseEsLint9 = {
        code,
        filename: __filename,
    };
    if (options) {
        sample.options = [options];
    }
    if (name) {
        sample.name = name;
    }

    const parser = parsers[path.extname(__filename)];
    if (parser) {
        sample.languageOptions ??= {};
        sample.languageOptions.parser = parser;
    }

    return sample;
}

function readSample(name: string, sampleFile: string, options?: Options) {
    return readFix(name, path.join('samples', sampleFile), options);
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

function readInvalid(name: string, filename: string, errors: (TestCaseError | string)[], options?: Options) {
    assert(!setOfKnownTestCases.has(name), `Duplicate test case name: ${name}`);
    setOfKnownTestCases.add(name);
    const sample = readFix(name, filename, options);
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
