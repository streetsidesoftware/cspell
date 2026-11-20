import { existsSync } from 'node:fs';
import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { getReporter } from '../cli-reporter.js';
import { LintRequest } from './LintRequest.js';

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
    `('create LintRequest $options', ({ options, expected }) => {
        const fileGlobs: string[] = [];
        const request = new LintRequest(fileGlobs, options, getReporter({ fileGlobs }));
        expect(request).toEqual(expected);
    });

    test.each`
        root
        ${'missing-root'}
        ${'package.json'}
    `('the root $root is not an existing folder', ({ root }) => {
        expect(() => new LintRequest([], { root }, getReporter({ fileGlobs: [] }))).toThrow(
            'The --root path must be an existing folder.',
        );
    });

    test('the root is spelled as on disk', ({ skip }) => {
        skip(!existsSync('SRC'), 'the file system matches letter case');
        const request = new LintRequest([], { root: 'SRC' }, getReporter({ fileGlobs: [] }));
        expect(request.root).toBe(path.resolve('src'));
    });
});
