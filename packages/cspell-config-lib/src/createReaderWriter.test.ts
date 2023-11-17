import { describe, expect, test, vi } from 'vitest';

import { createReaderWriter } from './createReaderWriter.js';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter.js';
import type { IO } from './IO.js';
import { defaultDeserializers } from './serializers/index.js';

describe('createReaderWriter', () => {
    test('createReaderWriter default', () => {
        expect(createReaderWriter()).toBeInstanceOf(CSpellConfigFileReaderWriterImpl);
    });

    test('createReaderWriter', () => {
        const io: IO = {
            readFile: vi.fn(),
            writeFile: vi.fn(),
        };
        const rw = createReaderWriter(undefined, undefined, io);
        expect(rw).toBeInstanceOf(CSpellConfigFileReaderWriterImpl);
        expect(rw.middleware).toHaveLength(defaultDeserializers.length);
    });
});
