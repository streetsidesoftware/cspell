import { createReaderWriter } from './createReaderWriter';
import { CSpellConfigFileReaderWriter } from './CSpellConfigFileReaderWriter';
import { defaultDeserializers } from './deserializers';
import { IO } from './IO';

describe('createReaderWriter', () => {
    test('createReaderWriter default', () => {
        expect(createReaderWriter()).toBeInstanceOf(CSpellConfigFileReaderWriter);
    });

    test('createReaderWriter', () => {
        const io: IO = {
            readFile: jest.fn(),
            writeFile: jest.fn(),
        };
        const rw = createReaderWriter([], io);
        expect(rw).toBeInstanceOf(CSpellConfigFileReaderWriter);
        expect(rw.deserializers).toHaveLength(defaultDeserializers.length);
    });
});
