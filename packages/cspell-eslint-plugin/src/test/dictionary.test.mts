import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import typeScriptParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import { RuleTester } from 'eslint';

import type { Options as RuleOptions } from '../plugin/index.cjs';
import { defineCSpellConfig, defineCSpellPluginOptions } from '../plugin/index.cjs';
import Rule from '../plugin/index.cjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '../..');
const fixturesDir = path.join(root, 'fixtures');

const parsers: Record<string, Linter.Parser | undefined> = {
    // Note: it is possible for @typescript-eslint/parser to break the path
    '.ts': typeScriptParser,
};

type ValidTestCase = RuleTester.ValidTestCase;
type Options = Partial<RuleOptions>;

const ruleTester = new RuleTester({});

ruleTester.run('cspell', Rule.rules.spellchecker, {
    valid: [
        readFix('supportNonStrictSearches: true', 'dictionaries/sample.js', {
            cspell: defineCSpellConfig({
                dictionaryDefinitions: [
                    {
                        name: 'custom-dict',
                        supportNonStrictSearches: true,
                        // cspell: words Codeco
                        words: ['IPv4', 'IPv6', 'Codeco'],
                        suggestWords: ['codeco->Codeco'],
                    },
                ],
                dictionaries: ['custom-dict'],
            }),
        }),
    ],
    invalid: [
        // cspell:ignore readstring resetmemorycategory retargeting rrotate rshift
        readInvalid(
            'supportNonStrictSearches: false',
            'dictionaries/sample.js',
            [misspelledWord('codeco', 'Codeco', 8)],
            {
                cspell: defineCSpellConfig({
                    dictionaryDefinitions: [
                        {
                            name: 'custom-dict',
                            supportNonStrictSearches: false,
                            // cspell: words Codeco
                            words: ['IPv4', 'IPv6', 'Codeco'],
                            suggestWords: ['codeco->Codeco'],
                        },
                    ],
                    dictionaries: ['custom-dict'],
                }),
            },
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
        name,
        code,
        filename: __filename,
    };
    if (options) {
        sample.options = [defineCSpellPluginOptions(options)];
    }

    const parser = parsers[path.extname(__filename)];
    if (parser) {
        sample.languageOptions ??= {};
        sample.languageOptions.parser = parser;
    }

    return sample;
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

type InvalidTestCaseError = RuleTester.TestCaseError | TestCaseError;

function readInvalid(name: string, filename: string, errors: TestCaseError[], options?: Options) {
    const sample = readFix(name, filename, options);
    return {
        ...sample,
        errors: errors.map((err) => csError(err)),
    };
}

function misspelledWord(word: string, fix: string, suggestions?: number): InvalidTestCaseError {
    return ce(`Misspelled word: "${word}" (${fix})`, suggestions);
}

// function unknownWord(word: string, suggestions?: number): InvalidTestCaseError {
//     return ce(`Unknown word: "${word}"`, suggestions);
// }

function ce(message: string, suggestions?: number): RuleTester.TestCaseError {
    return { message, suggestions } as RuleTester.TestCaseError;
}

function csError(error: InvalidTestCaseError, suggestions?: number): RuleTester.TestCaseError {
    if (error && typeof error === 'object') return error as RuleTester.TestCaseError;
    return ce(error, suggestions);
}
