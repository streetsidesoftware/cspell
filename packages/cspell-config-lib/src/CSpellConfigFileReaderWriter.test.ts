import { describe, expect, test, vi } from 'vitest';

import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter.js';
import type { IO } from './IO.js';
import { defaultDeserializers } from './serializers/index.js';
import { json } from './test-helpers/util.js';
import { CSpellSettings } from '@cspell/cspell-types';
import { CSpellConfigFile } from './CSpellConfigFile.js';

const oc = expect.objectContaining;

describe('CSpellConfigFileReaderWriter', () => {
    test.each`
        uri                       | content                   | expected
        ${'file:///package.json'} | ${json({ name: 'name' })} | ${oc({ url: new URL('file:///package.json'), settings: {} })}
    `('readConfig', async ({ uri, content, expected }) => {
        const io: IO = {
            readFile: vi.fn(() => content),
            writeFile: vi.fn(),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers);
        expect(await rw.readConfig(uri)).toEqual(expected);
    });

    test.each`
        uri                    | content | expected
        ${'file:///cspell.js'} | ${''}   | ${new Error('Unable to parse config file: "file:///cspell.js"')}
    `('fail readConfig', async ({ uri, content, expected }) => {
        const io: IO = {
            readFile: vi.fn(() => content),
            writeFile: vi.fn(),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers);
        await expect(rw.readConfig(uri)).rejects.toEqual(expected);
    });

    test.each`
        uri                      | content
        ${'file:///cspell.json'} | ${'{}\n'}
    `('writeConfig', async ({ uri, content }) => {
        const io: IO = {
            readFile: vi.fn(() => content),
            writeFile: vi.fn(() => Promise.resolve()),
        };

        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers);
        const cf = await rw.readConfig(uri);
        await expect(rw.writeConfig(cf)).resolves.toBeUndefined();
        expect(io.writeFile).toHaveBeenCalledWith(new URL(uri), content);
    });

    test('Fail to serialize', () => {
        const io: IO = {
            readFile: vi.fn(() => Promise.resolve('')),
            writeFile: vi.fn(() => Promise.resolve()),
        };

        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers);
        const cf = new Cfg(new URL('file:///cspell.js'), {});
        expect(() => rw.writeConfig(cf)).toThrow('Unable to serialize config file: "file:///cspell.js"');
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
