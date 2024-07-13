import { describe, expect, test } from 'vitest';

import { getReporter } from '../cli-reporter.js';
import { LintRequest } from './LintRequest.js';

const oc = <T>(obj: T) => expect.objectContaining(obj);

describe('LintRequest', () => {
    test.each`
        options                                     | expected
        ${{}}                                       | ${oc({ fileGlobs: [], files: undefined })}
        ${{ files: ['one\ntwo'] }}                  | ${oc({ fileGlobs: [], files: ['one', 'two'] })}
        ${{ file: ['one', 'two'], files: ['two'] }} | ${oc({ fileGlobs: [], files: ['one', 'two'] })}
        ${{ file: ['one', 'two'] }}                 | ${oc({ fileGlobs: [], files: ['one', 'two'] })}
        ${{ showContext: undefined }}               | ${oc({ showContext: 0 })}
        ${{ showContext: true }}                    | ${oc({ showContext: 20 })}
        ${{ showContext: 3 }}                       | ${oc({ showContext: 3 })}
    `('create LintRequest $options', ({ options, expected }) => {
        const fileGlobs: string[] = [];
        const request = new LintRequest(fileGlobs, options, getReporter({ fileGlobs }));
        expect(request).toEqual(expected);
    });
});
