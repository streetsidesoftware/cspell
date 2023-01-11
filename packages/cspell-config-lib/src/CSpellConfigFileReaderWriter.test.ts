import type { CSpellConfigFile } from './CSpellConfigFile';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter';
import { defaultDeserializers } from './deserializers';
import type { IO } from './IO';
import { json } from './test-helpers/util';

const oc = expect.objectContaining;

describe('CSpellConfigFileReaderWriter', () => {
    test.each`
        uri                      | content                   | expected
        ${'file://package.json'} | ${json({ name: 'name' })} | ${oc({ uri: 'file://package.json', settings: {} })}
    `('readConfig', async ({ uri, content, expected }) => {
        const io: IO = {
            readFile: jest.fn(() => content),
            writeFile: jest.fn(),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers);
        expect(await rw.readConfig(uri)).toEqual(expected);
    });

    test.each`
        uri                   | content | expected
        ${'file://cspell.js'} | ${''}   | ${new Error('Unable to parse config file: "file://cspell.js"')}
    `('fail readConfig', async ({ uri, content, expected }) => {
        const io: IO = {
            readFile: jest.fn(() => content),
            writeFile: jest.fn(),
        };
        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers);
        await expect(rw.readConfig(uri)).rejects.toEqual(expected);
    });

    test.each`
        uri                   | content
        ${'file://cspell.js'} | ${'content'}
    `('writeConfig', async ({ uri, content }) => {
        const io: IO = {
            readFile: jest.fn(() => content),
            writeFile: jest.fn(() => Promise.resolve()),
        };

        const rw = new CSpellConfigFileReaderWriterImpl(io, defaultDeserializers);
        const cf: CSpellConfigFile = {
            uri,
            settings: {},
            serialize: jest.fn(() => content),
            addWords: jest.fn(),
        };
        await expect(rw.writeConfig(cf)).resolves.toBeUndefined();
        expect(io.writeFile).toHaveBeenCalledWith(uri, content);
        expect(cf.serialize).toHaveBeenCalledTimes(1);
    });
});
