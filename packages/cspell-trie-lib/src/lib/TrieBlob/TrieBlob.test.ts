import { describe, expect, test } from 'vitest';

import { TrieBlob } from './TrieBlob.js';

describe('TrieBlob', () => {
    test('Constructor', () => {
        expect(new TrieBlob()).toBeDefined();
    });
});
