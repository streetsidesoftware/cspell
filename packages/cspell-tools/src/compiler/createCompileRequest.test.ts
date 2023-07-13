import { describe, expect, test } from 'vitest';

import type { CompileCommonAppOptions } from '../AppOptions.js';
import { createCompileRequest } from './createCompileRequest.js';

describe('createCompileRequest', () => {
    test.each`
        source                                 | options
        ${[]}                                  | ${comp()}
        ${['src/words.txt']}                   | ${comp()}
        ${['src/words.txt', 'src/cities.txt']} | ${comp({ output: 'out' })}
        ${['src/words.txt', 'src/cities.txt']} | ${comp({ output: 'out', merge: 'combo' })}
        ${[]}                                  | ${comp({ listFile: ['python-sources.txt'] })}
        ${[]}                                  | ${comp({ listFile: ['python-sources.txt'], output: 'python' })}
        ${[]}                                  | ${comp({ listFile: ['python-sources.txt'], merge: 'python' })}
    `('createCompileRequest', ({ source, options }) => {
        const req = createCompileRequest(source, options);
        // Make sure the test passes on Windows.
        const reqClean = JSON.parse(JSON.stringify(req, null, 2).replace(/\\\\/g, '/'));
        expect(reqClean).toMatchSnapshot();
    });
});

function comp(...parts: Partial<CompileCommonAppOptions>[]): CompileCommonAppOptions {
    const base: CompileCommonAppOptions = { compress: false, experimental: [] };

    const acc = { ...base };

    for (const opt of parts) {
        Object.assign(acc, opt);
    }

    return acc;
}
