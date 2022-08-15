import * as fReader from './fileReader';
import { promises as fs } from 'fs';
import { isUrlLike, toURL } from './util';
import { pathToRoot } from '../../test/helper';

const oc = expect.objectContaining;

describe('Validate the fileReader', () => {
    jest.setTimeout(10000);

    test('tests reading a file', async () => {
        const expected = await fs.readFile(__filename, 'utf8');
        const result = await fReader.readFile(__filename, 'utf8');
        expect(result).toBe(expected);
    });

    test('missing file', async () => {
        const result = fReader.readFile(__filename + '.missing.file', 'utf8');
        await expect(result).rejects.toEqual(oc({ code: 'ENOENT' }));
    });

    test.each`
        file                       | contains
        ${'samples/cities.txt'}    | ${'San Francisco'}
        ${'samples/cities.txt.gz'} | ${'San Francisco'}
    `('reading sync files $file', ({ file, contains }) => {
        const filename = pathToRoot(file);
        const content = fReader.readFileSync(filename);
        expect(content).toContain(contains);
    });

    test.each`
        file                       | contains
        ${'samples/cities.txt'}    | ${'San Francisco'}
        ${'samples/cities.txt.gz'} | ${'San Francisco'}
    `('reading async files $file', async ({ file, contains }) => {
        const filename = pathToRoot(file);
        const content = await fReader.readFile(filename);
        expect(content).toContain(contains);
    });

    test.each`
        file                                                                                                | contains
        ${'samples/cities.txt'}                                                                             | ${'San Francisco'}
        ${'samples/cities.txt.gz'}                                                                          | ${'San Francisco'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${'San Francisco'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${'San Francisco'}
    `('reading URLs files $file', async ({ file, contains }) => {
        const filename = isUrlLike(file) ? file : pathToRoot(file);
        const url = toURL(filename);
        const content = await fReader.readFile(url);
        expect(content).toContain(contains);
    });

    test.each`
        file                                             | expected
        ${'http://streetsidesoftware.com/not-found.txt'} | ${oc({ code: 'ENOENT' })}
        ${'ftp://www.streetsidesoftware.nl'}             | ${new Error('Unsupported network protocol')}
        ${'https://github.com/Jason3S/checkio'}          | ${oc({ code: 'ENOENT', message: 'URL not found.' })}
    `('error reading URLs $file', async ({ file, expected }) => {
        const url = toURL(file);
        await expect(fReader.readFile(url)).rejects.toEqual(expected);
    });
});
