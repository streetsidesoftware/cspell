import os from 'node:os';

import { describe, expect, test } from 'vitest';

import { endianness } from './endian.ts';

describe('endian', () => {
    test('endianness', () => {
        expect(endianness()).toBe(os.endianness());
    });
});
