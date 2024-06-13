import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import typeScriptParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import parserYml from 'yaml-eslint-parser';

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

const ruleTester = new RuleTester({
    files: ['**/*.{yml,yaml}'],
    languageOptions: {
        parser: parserYml,
    },
    // ... others are omitted for brevity
});

ruleTester.run('cspell', Rule.rules.spellchecker, {
    valid: [readFix('yaml-support/sample.yaml')],
    invalid: [],
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
