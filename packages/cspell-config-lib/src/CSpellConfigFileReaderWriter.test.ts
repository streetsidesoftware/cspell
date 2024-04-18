import { pathToFileURL } from 'node:url';

import type { CSpellSettings } from '@cspell/cspell-types';
import { describe, expect, test, vi } from 'vitest';

import { CSpellConfigFile } from './CSpellConfigFile.js';
import { CSpellConfigFileJavaScript } from './CSpellConfigFile/index.js';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter.js';
import type { IO } from './IO.js';
import { defaultLoaders } from './loaders/index.js';
import { defaultDeserializers } from './serializers/index.js';
import { fixtures } from './test-helpers/fixtures.js';
import { json } from './test-helpers/util.js';

const oc = expect.objectContaining;

describe('CSpellConfigFileReaderWriter', () => {
    test.each`
        uri                       | content                   | expected
        ${'file:///package.json'} | ${json({ name: 'name' })} | ${oc({ url: new URL('file:///package.json'), settings: {} })}
    `('readConfig', async ({ uri, content, expected }) => {
        const io: IO = {
            readFile: vi.fn((url) => Promise.resolve({ url, content })),
            writeFile: vi.fn(),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers, defaultLoaders);
        expect(await rw.readConfig(uri)).toEqual(expected);
    });

    test.each`
        uri                    | content | expected
        ${'file:///cspell.js'} | ${''}   | ${new Error('Unable to parse config file: "file:///cspell.js"')}
    `('fail to read .js config without a loader', async ({ uri, content, expected }) => {
        const io: IO = {
            readFile: vi.fn((url) => Promise.resolve({ url, content })),
            writeFile: vi.fn(),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers, []);
        await expect(rw.readConfig(uri)).rejects.toEqual(expected);
    });

    test.each`
        uri                      | content
        ${'file:///cspell.json'} | ${'{}\n'}
    `('writeConfig $uri', async ({ uri, content }) => {
        const io: IO = {
            readFile: vi.fn((url) => Promise.resolve({ url, content })),
            writeFile: vi.fn((ref) => Promise.resolve(ref)),
        };

        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers, defaultLoaders);
        const cf = await rw.readConfig(uri);
        const url = new URL(uri);
        await expect(rw.writeConfig(cf)).resolves.toEqual({ url });
        expect(io.writeFile).toHaveBeenCalledWith({ url, content });
    });

    test.each`
        uri                             | settings
        ${'file:///cspell.config.js'}   | ${{}}
        ${'file:///cspell.config.json'} | ${{ readonly: true }}
    `('writeConfig readonly $uri', async ({ uri, settings }) => {
        const io: IO = {
            readFile: vi.fn((url) => Promise.resolve({ url, content: '' })),
            writeFile: vi.fn((ref) => Promise.resolve(ref)),
        };

        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers, []);
        const url = new URL(uri);
        const cf = url.pathname.endsWith('.js')
            ? new CSpellConfigFileJavaScript(url, settings)
            : new Cfg(url, settings);
        await expect(rw.writeConfig(cf)).rejects.toEqual(new Error(`Config file is readonly: ${uri}`));
    });

    test('Fail to serialize', async () => {
        const io: IO = {
            readFile: vi.fn((url) => Promise.resolve({ url, content: '' })),
            writeFile: vi.fn((ref) => Promise.resolve(ref)),
        };

        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers, []);
        const cf = new Cfg(new URL('file:///cspell.js'), {});
        await expect(rw.writeConfig(cf)).rejects.toThrowError('Unable to serialize config file: "file:///cspell.js"');
    });

    test('clearCachedFiles', async () => {
        const io: IO = {
            readFile: vi.fn((url) => Promise.resolve({ url, content: '' })),
            writeFile: vi.fn((ref) => Promise.resolve(ref)),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers, defaultLoaders);
        const file = 'js/commonjs/cspell.config.mjs';
        const url = pathToFileURL(fixtures(file));
        const cfg0 = await rw.readConfig(url);
        const cfg1 = await rw.readConfig(url);
        expect(cfg1.settings).toBe(cfg0.settings);
        rw.clearCachedFiles();
        const cfg2 = await rw.readConfig(url);
        expect(cfg2.settings).not.toBe(cfg0.settings);
        expect(cfg2.settings).toEqual(cfg0.settings);
    });

    test.each`
        uri                                   | content                   | expected
        ${'file:///package.json'}             | ${json({ name: 'name' })} | ${'Untrusted URL: "file:///package.json"'}
        ${'safe-fs:///path/cspell.config.js'} | ${json({ name: 'name' })} | ${'Untrusted URL: "safe-fs:///path/cspell.config.js"'}
    `('readConfig untrusted', async ({ uri, content, expected }) => {
        const io: IO = {
            readFile: vi.fn((url) => Promise.resolve({ url, content })),
            writeFile: vi.fn(),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers, defaultLoaders);
        rw.setUntrustedExtensions(['.json', '.js']);

        expect(rw.trustedUrls).toEqual([]);
        expect(rw.untrustedExtensions).toEqual(['.json', '.js']);

        await expect(rw.readConfig(uri)).rejects.toThrowError(expected);
    });

    test.each`
        uri                              | content                   | expected
        ${'file:///package.json'}        | ${json({ name: 'name' })} | ${oc({ url: new URL('file:///package.json') })}
        ${'safe-fs:///code/sample.json'} | ${json({ name: 'name' })} | ${oc({ url: new URL('safe-fs:///code/sample.json'), settings: { name: 'name' } })}
    `('readConfig trusted', async ({ uri, content, expected }) => {
        const io: IO = {
            readFile: vi.fn((url) => Promise.resolve({ url, content })),
            writeFile: vi.fn(),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers, defaultLoaders);
        rw.setUntrustedExtensions(['.json', '.js']).setTrustedUrls(['file:///package.json', 'safe-fs:///']);

        expect(rw.trustedUrls.toString()).toEqual('file:///package.json,safe-fs:///');
        expect(rw.untrustedExtensions).toEqual(['.json', '.js']);

        await expect(rw.readConfig(uri)).resolves.toEqual(expected);
    });
});

class Cfg extends CSpellConfigFile {
    constructor(
        public readonly url: URL,
        public readonly settings: CSpellSettings = {},
    ) {
        super(url);
    }

    addWords(_words: string[]): this {
        return this;
    }
}
