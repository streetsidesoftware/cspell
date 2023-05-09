import { describe, expect, test } from 'vitest';

import { createTrieBlob } from './createTrieBlob.js';

describe('TrieBlob', () => {
    test('Constructor', () => {
        const tb = createTrieBlob(['one', 'two']);
        expect(tb).toBeDefined();
    });

    test('has', () => {
        const tb = createTrieBlob(['one', 'two']);
        expect(tb.has('one')).toBe(true);
        expect(tb.has('zero')).toBe(false);
    });
});
