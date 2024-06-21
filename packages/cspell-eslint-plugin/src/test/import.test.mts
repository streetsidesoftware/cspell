import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import typeScriptParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';

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

ruleTester.run('cspell', Rule.rules.spellchecker, {
    valid: [
        readFix('import-support/sample.ts', {
            cspell: {
                import: ['@internal/fixture-test-dictionary'],
            },
        }),
        readFix('import-support/sample.ts', {
            configFile: '@internal/fixture-test-dictionary',
            cspell: {
                language: 'en-US',
            },
        }),
    ],
    invalid: [
        // cspell:ignore readstring resetmemorycategory retargeting rrotate rshift
        readInvalid('import-support/sample.ts', [
            unknownWord('readstring', 8),
            unknownWord('resetmemorycategory'),
            unknownWord('retargeting', 8),
            unknownWord('rrotate', 8),
            unknownWord('rshift', 8),
        ]),
        readInvalid(
            'import-support/sample.ts',
            [
                ce(
                    'Configuration Error: \n' +
                        '  Failed to resolve configuration file: "bad-import" referenced from ' +
                        `"./eslint-configuration-file"`,
                ),
            ],
            {
                cspell: {
                    import: ['@internal/fixture-test-dictionary', 'bad-import'],
                },
            },
        ),
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
    const code = fs.readFileSync(__filename, 'utf8');

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

function readInvalid(filename: string, errors: TestCaseError[], options?: Options) {
    const sample = readFix(filename, options);
    return {
        ...sample,
        errors: errors.map((err) => csError(err)),
    };
}

function unknownWord(word: string, suggestions?: number): InvalidTestCaseError {
    return ce(`Unknown word: "${word}"`, suggestions);
}

function ce(message: string, suggestions?: number): RuleTester.TestCaseError {
    return { message, suggestions } as RuleTester.TestCaseError;
}

function csError(error: InvalidTestCaseError, suggestions?: number): RuleTester.TestCaseError {
    if (error && typeof error === 'object') return error as RuleTester.TestCaseError;
    return ce(error, suggestions);
}
