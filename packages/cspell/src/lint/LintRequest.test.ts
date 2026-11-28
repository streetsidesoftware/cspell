import { existsSync } from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { getReporter } from '../cli-reporter.js';
import { createLintRequest } from './LintRequest.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('LintRequest', () => {
    test.each`
        options                                     | expected
        ${{}}                                       | ${oc({ fileGlobs: [], files: undefined })}
        ${{ files: ['one\ntwo'] }}                  | ${oc({ fileGlobs: [], files: ['one', 'two'] })}
        ${{ file: ['one', 'two'], files: ['two'] }} | ${oc({ fileGlobs: [], files: ['one', 'two'] })}
        ${{ file: ['one', 'two'] }}                 | ${oc({ fileGlobs: [], files: ['one', 'two'] })}
        ${{ files: [' one \r\n two\n'] }}           | ${oc({ fileGlobs: [], files: [' one', ' two'] })}
        ${{ showContext: undefined }}               | ${oc({ showContext: 0 })}
        ${{ showContext: true }}                    | ${oc({ showContext: 20 })}
        ${{ showContext: 3 }}                       | ${oc({ showContext: 3 })}
    `('create LintRequest $options', async ({ options, expected }) => {
        const fileGlobs: string[] = [];
        const request = await createLintRequest(fileGlobs, options, getReporter({ fileGlobs }));
        expect(request).toEqual(expected);
    });

    test('the root is the current directory by default', async () => {
        const request = await createLintRequest([], {}, getReporter({ fileGlobs: [] }));
        expect(request.root).toBe(process.cwd());
        expect(request.stopConfigSearchAt).toBeUndefined();
    });

    test.each`
        root
        ${'missing-root'}
        ${'package.json'}
    `('the root $root is not an existing folder', async ({ root }) => {
        await expect(createLintRequest([], { root }, getReporter({ fileGlobs: [] }))).rejects.toThrow(
            'The --root path must be an existing folder.',
        );
    });

    test('the root is spelled as on disk', async ({ skip }) => {
        skip(!existsSync('SRC'), 'the file system matches letter case');
        const request = await createLintRequest([], { root: 'SRC' }, getReporter({ fileGlobs: [] }));
        expect(request.root).toBe(path.resolve('src'));
    });

    test('the stops are looked up on disk', async () => {
        const options = { root: 'src', stopConfigSearchAt: ['.', 'src/lint'] };
        const request = await createLintRequest([], options, getReporter({ fileGlobs: [] }));
        expect(request.stopConfigSearchAt).toEqual([dirUrl(process.cwd()), dirUrl(path.resolve('src/lint'))]);
    });

    test('a stop that is not an existing folder is an error', async () => {
        const options = { stopConfigSearchAt: ['missing-folder'] };
        await expect(createLintRequest([], options, getReporter({ fileGlobs: [] }))).rejects.toThrow(
            'Each --stop-config-search-at path must be an existing folder.',
        );
    });
});

function dirUrl(folder: string): URL {
    return pathToFileURL(folder + path.sep);
}
