import { isUrlLike, toURL } from './util';
import * as path from 'path';

const root = path.join(__dirname, '../..');
const oc = expect.objectContaining;
// const sc = expect.stringContaining;

describe('util', () => {
    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${false}
        ${'samples/cities.txt.gz'}                                                                          | ${false}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${true}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${true}
    `('isUrlLike $file', ({ file, expected }) => {
        expect(isUrlLike(file)).toBe(expected);
    });

    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${oc({ protocol: 'file:' })}
        ${'samples/cities.txt.gz'}                                                                          | ${oc({ protocol: 'file:' })}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${oc({ protocol: 'https:' })}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${oc({ protocol: 'https:' })}
    `('toURL $file', async ({ file, expected }) => {
        const filename = isUrlLike(file) ? file : path.resolve(root, file);
        const url = toURL(filename);
        expect(url).toEqual(expected);
    });
});
