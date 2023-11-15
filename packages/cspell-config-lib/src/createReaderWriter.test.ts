import { describe, expect, test, vi } from 'vitest';

import { createReaderWriter } from './createReaderWriter.js';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter.js';
import { defaultDeserializers } from './deserializers/index.js';
import type { IO } from './IO.js';

describe('createReaderWriter', () => {
    test('createReaderWriter default', () => {
        expect(createReaderWriter()).toBeInstanceOf(CSpellConfigFileReaderWriterImpl);
    });

    test('createReaderWriter', () => {
        const io: IO = {
            readFile: vi.fn(),
            writeFile: vi.fn(),
        };
        const rw = createReaderWriter([], io);
        expect(rw).toBeInstanceOf(CSpellConfigFileReaderWriterImpl);
        expect(rw.deserializers).toHaveLength(defaultDeserializers.length);
    });
});
