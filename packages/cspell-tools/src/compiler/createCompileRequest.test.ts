import { CompileCommonAppOptions } from '../AppOptions';
import { createCompileRequest } from './createCompileRequest';

describe('createCompileRequest', () => {
    test.each`
        source                                 | options
        ${[]}                                  | ${comp()}
        ${['src/words.txt']}                   | ${comp()}
        ${['src/words.txt', 'src/cities.txt']} | ${comp({ output: 'out' })}
        ${['src/words.txt', 'src/cities.txt']} | ${comp({ output: 'out', merge: 'combo' })}
    `('createCompileRequest', ({ source, options }) => {
        expect(createCompileRequest(source, options)).toMatchSnapshot();
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
