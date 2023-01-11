import { createReaderWriter } from './createReaderWriter';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter';
import { defaultDeserializers } from './deserializers';
import type { IO } from './IO';

describe('createReaderWriter', () => {
    test('createReaderWriter default', () => {
        expect(createReaderWriter()).toBeInstanceOf(CSpellConfigFileReaderWriterImpl);
    });

    test('createReaderWriter', () => {
        const io: IO = {
            readFile: jest.fn(),
            writeFile: jest.fn(),
        };
        const rw = createReaderWriter([], io);
        expect(rw).toBeInstanceOf(CSpellConfigFileReaderWriterImpl);
        expect(rw.deserializers).toHaveLength(defaultDeserializers.length);
    });
});
