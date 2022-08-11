import { isUrlLike, toURL, urlBasename, urlDirname } from './util';
import * as path from 'path';

const root = path.join(__dirname, '../..');
const oc = expect.objectContaining;
// const sc = expect.stringContaining;
const sm = expect.stringMatching;

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

    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${'cities.txt'}
        ${'samples/cities.txt.gz'}                                                                          | ${'cities.txt.gz'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${'cities.txt'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${'cities.txt.gz'}
        ${'data:text/plain;charset=utf8,Hello%2C%20World!'}                                                 | ${'text.plain'}
        ${'data:text/plain;charset=utf8;filename=cities.txt,New%20York'}                                    | ${'cities.txt'}
        ${'data:'}                                                                                          | ${''}
        ${'data:application/gzip;base64,H'}                                                                 | ${'application.gzip'}
        ${toURL('data:application/gzip;base64,H')}                                                          | ${'application.gzip'}
        ${'data:application/vnd.cspell.dictionary+trie,H'}                                                  | ${'application.vnd.cspell.dictionary.trie'}
    `('urlBasename $file', async ({ file, expected }) => {
        const filename = isUrlLike(file) ? file : path.resolve(root, file);
        expect(urlBasename(filename)).toEqual(expected);
    });

    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${sm(/file:.*\/samples\/$/)}
        ${'samples/cities.txt.gz'}                                                                          | ${sm(/file:.*\/samples\/$/)}
        ${'samples/code/'}                                                                                  | ${sm(/file:.*\/samples\/$/)}
        ${'file://samples/code/'}                                                                           | ${sm(/file:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${sm(/https:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${sm(/https:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/code/'}         | ${sm(/https:.*\/samples\/$/)}
        ${'data:text/plain;charset=utf8,Hello%2C%20World!'}                                                 | ${'data:'}
        ${'data:text/plain;charset=utf8;filename=cities.txt,New%20York'}                                    | ${'data:'}
        ${'data:application/gzip;base64,H'}                                                                 | ${'data:'}
        ${toURL('data:application/gzip;base64,H')}                                                          | ${'data:'}
        ${'data:application/vnd.cspell.dictionary+trie,H'}                                                  | ${'data:'}
    `('urlDirname $file', async ({ file, expected }) => {
        const filename = isUrlLike(file) ? file : path.resolve(root, file);
        expect(urlDirname(filename).toString()).toEqual(expected);
    });
});
