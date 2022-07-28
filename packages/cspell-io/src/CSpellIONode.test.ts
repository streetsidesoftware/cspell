import { CSpellIONode } from './CSpellIONode';
import { pathToSample as ps } from './test/helper';

const sc = expect.stringContaining;
const oc = expect.objectContaining;

describe('CSpellIONode', () => {
    test('constructor', () => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo).toBeDefined();
    });

    test.each`
        filename                                                                                                       | expected
        ${__filename}                                                                                                  | ${sc('This bit of text')}
        ${ps('cities.txt')}                                                                                            | ${sc('San Francisco\n')}
        ${ps('cities.txt.gz')}                                                                                         | ${sc('San Francisco\n')}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt'}    | ${sc('San Francisco\n')}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt.gz'} | ${sc('San Francisco\n')}
    `('readFile $filename', async ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        await expect(cspellIo.readFile(filename)).resolves.toEqual(expected);
    });

    test.each`
        filename                                                                                                              | expected
        ${ps('cities.not_found.txt')}                                                                                         | ${oc({ code: 'ENOENT' })}
        ${ps('cities.not_found.txt.gz')}                                                                                      | ${oc({ code: 'ENOENT' })}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.not_found.txt'} | ${oc({ code: 'ENOENT' })}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/not_found/cities.txt.gz'}      | ${oc({ code: 'ENOENT' })}
    `('readFile not found $filename', async ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        await expect(cspellIo.readFile(filename)).rejects.toEqual(expected);
    });

    test.each`
        filename               | expected
        ${__filename}          | ${sc('This bit of text')}
        ${ps('cities.txt')}    | ${sc('San Francisco\n')}
        ${ps('cities.txt.gz')} | ${sc('San Francisco\n')}
    `('readFileSync $filename', ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo.readFileSync(filename)).toEqual(expected);
    });

    const stats = {
        urlA: { eTag: 'W/"10c5e3c7c73159515d4334813d6ba0255230270d92ebfdbd37151db7a0db5918"', mtimeMs: 0, size: -1 },
        urlB: { eTag: 'W/"10c5e3c7c73159515d4334813d6ba0255230270d92ebfdbd37151db7a0dbffff"', mtimeMs: 0, size: -1 },
        file1: { mtimeMs: 1658757408444.0342, size: 1886 },
        file2: { mtimeMs: 1658757408444.0342, size: 2886 },
        file3: { mtimeMs: 1758757408444.0342, size: 1886 },
    };

    test.each`
        left           | right          | expected
        ${stats.urlA}  | ${stats.urlA}  | ${0}
        ${stats.urlA}  | ${stats.file1} | ${1}
        ${stats.file1} | ${stats.file3} | ${-1}
        ${stats.file2} | ${stats.file3} | ${1}
    `('getStat $left <> $right', async ({ left, right, expected }) => {
        const cspellIo = new CSpellIONode();
        const r = cspellIo.compareStats(left, right);
        expect(r).toEqual(expected);
    });

    // writeFile(_uriOrFilename: string, _content: string): Promise<void> {
    //     throw new ErrorNotImplemented('writeFile');
    // }
    // getStat(_uriOrFilename: string): Promise<Stats> {
    //     throw new ErrorNotImplemented('getStat');
    // }
    // getStatSync(_uriOrFilename: string): Stats {
    //     throw new ErrorNotImplemented('getStatSync');
    // }
});
