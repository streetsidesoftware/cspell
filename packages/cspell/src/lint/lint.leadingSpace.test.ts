import { promises as fsp } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import type { LinterCliOptions } from '../options.js';
import { InMemoryReporter } from '../util/InMemoryReporter.js';
import { runLint } from './lint.js';
import { LintRequest } from './LintRequest.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('lint a folder whose name starts with a space', () => {
    let tmp = '';
    let config = '';

    beforeAll(async () => {
        tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'cspell-lint-leading-space-'));
        await fsp.mkdir(path.join(tmp, ' notes'));
        await fsp.writeFile(path.join(tmp, ' notes/readme.txt'), 'zqxnotes\n');
        await fsp.writeFile(path.join(tmp, 'list.txt'), ' notes/readme.txt\n');
        config = path.join(tmp, 'cspell.json');
        await fsp.writeFile(config, '{"version": "0.2", "ignorePaths": ["list.txt"]}\n');
    });

    afterAll(async () => {
        await fsp.rm(tmp, { recursive: true, force: true });
    });

    async function lint(globs: string[], options: LinterCliOptions) {
        const reporter = new InMemoryReporter();
        const result = await runLint(new LintRequest(globs, { root: tmp, config, ...options }, reporter));
        const words = reporter.issues.map((i) => i.text);
        return { result, words, reporter };
    }

    test.each`
        globs                      | options
        ${['**/readme.txt']}       | ${{}}
        ${['./ notes/readme.txt']} | ${{}}
        ${['[ ]notes/readme.txt']} | ${{}}
        ${[]}                      | ${{ files: [' notes/readme.txt'] }}
    `('lint $globs $options', async ({ globs, options }) => {
        const r = await lint(globs, options);
        expect(r.reporter.errors).toEqual([]);
        expect(r.words).toEqual(['zqxnotes']);
        expect(r.result).toEqual(oc({ errors: 0, files: 1 }));
    });

    test('lint a file list', async () => {
        const r = await lint([], { fileList: [path.join(tmp, 'list.txt')] });
        expect(r.reporter.errors).toEqual([]);
        expect(r.words).toEqual(['zqxnotes']);
        expect(r.result).toEqual(oc({ errors: 0, files: 1 }));
    });
});

// cspell:ignore zqxnotes
