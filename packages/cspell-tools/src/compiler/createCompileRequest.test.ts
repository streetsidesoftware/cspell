import { describe, expect, test } from 'vitest';

import type { CompileCommonAppOptions } from '../AppOptions.ts';
import { createCompileRequest } from './createCompileRequest.ts';

describe('createCompileRequest', () => {
    test.each`
        source                                     | options
        ${[]}                                      | ${comp()}
        ${['src/words.txt']}                       | ${comp()}
        ${['src/words.txt', 'src/cities.txt']}     | ${comp({ output: 'out' })}
        ${['src/words.txt', 'src/cities.txt']}     | ${comp({ output: 'out', merge: 'combo' })}
        ${[]}                                      | ${comp({ listFile: ['python-sources.txt'] })}
        ${[]}                                      | ${comp({ listFile: ['python-sources.txt'], output: 'python' })}
        ${[]}                                      | ${comp({ listFile: ['python-sources.txt'], merge: 'python' })}
        ${['src\\c-words.txt']}                    | ${comp({ merge: 'company-words' })}
        ${[{ listFile: 'src\\source-files.txt' }]} | ${comp({ merge: 'python' })}
        ${[{ filename: 'src\\python.txt' }]}       | ${comp({ merge: 'python' })}
    `('createCompileRequest', ({ source, options }) => {
        const req = createCompileRequest(source, options);
        // Make sure the test passes on Windows.
        const reqClean = JSON.parse(JSON.stringify(req, null, 2) /* .replace(/\\\\/g, '/') */);
        expect(reqClean).toMatchSnapshot();
    });

    test.each`
        source                                          | options                                              | expected
        ${['src/words.txt']}                            | ${comp({ maxDepth: '2', split: true })}              | ${[{ filename: 'src/words.txt', maxDepth: 2, split: true }]}
        ${['src/words.txt']}                            | ${comp({ max_depth: '0', useLegacySplitter: true })} | ${[{ filename: 'src/words.txt', maxDepth: 0, split: 'legacy' }]}
        ${[]}                                           | ${comp({ listFile: ['sources.txt'], split: false })} | ${[{ listFile: 'sources.txt', split: false }]}
        ${[{ filename: 'src/words.txt', split: true }]} | ${comp({ split: false })}                            | ${[{ filename: 'src/words.txt', split: true }]}
        ${['src/words.txt']}                            | ${comp()}                                            | ${['src/words.txt']}
    `('source options are set on each source $options', ({ source, options, expected }) => {
        const req = createCompileRequest(source, options);
        expect(req.targets.flatMap((target) => target.sources)).toEqual(expected);
        expect(Object.keys(req)).toEqual(['targets']);
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
