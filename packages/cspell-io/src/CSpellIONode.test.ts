import { CSpellIONode } from './CSpellIONode';
import { makePathToFile, pathToSample as ps, pathToTemp } from './test/helper';
import { promises as fs } from 'fs';

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

    test.each`
        url                                                                                 | expected
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ eTag: sc('W/') })}
        ${__filename}                                                                       | ${oc({ mtimeMs: expect.any(Number) })}
    `('getStat $url', async ({ url, expected }) => {
        const cspellIo = new CSpellIONode();
        const r = await cspellIo.getStat(url);
        expect(r).toEqual(expected);
    });

    test.each`
        url                                                                              | expected
        ${'https://raw.gitubusrcotent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ code: 'ENOTFOUND' })}
        ${ps(__dirname, 'not-found.nf')}                                                 | ${oc({ code: 'ENOENT' })}
    `('getStat with error $url', async ({ url, expected }) => {
        const cspellIo = new CSpellIONode();
        const r = cspellIo.getStat(url);
        await expect(r).rejects.toEqual(expected);
    });

    test.each`
        url           | expected
        ${__filename} | ${oc({ mtimeMs: expect.any(Number) })}
    `('getStatSync $url', ({ url, expected }) => {
        const cspellIo = new CSpellIONode();
        const r = cspellIo.getStatSync(url);
        expect(r).toEqual(expected);
    });

    test.each`
        url                                                                                 | expected
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${'The URL must be of scheme file'}
        ${ps(__dirname, 'not-found.nf')}                                                    | ${oc({ code: 'ENOENT' })}
    `('getStatSync with error $url', async ({ url, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(() => cspellIo.getStatSync(url)).toThrow(expected);
    });

    test.each`
        filename
        ${pathToTemp('cities.txt')}
        ${pathToTemp('cities.txt.gz')}
    `('writeFile $filename', async ({ filename }) => {
        const content = await fs.readFile(ps('cities.txt'), 'utf-8');
        const cspellIo = new CSpellIONode();
        await makePathToFile(filename);
        await cspellIo.writeFile(filename, content);
        expect(await cspellIo.readFile(filename)).toEqual(content);
    });
});

// '/Users/jason/projects/cspell6/packages/cspell-io/temp/src/CSpellIONode.test.ts/test_._test/cities.txt'
// '/Users/jason/projects/cspell6/packages/cspell-io/temp/src/CSpellIONode.test.ts/test_._test/cities.txt'
