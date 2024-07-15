import { describe, expect, test } from 'vitest';

import { createTrieBlob } from './createTrieBlob.js';

describe('FastTrieBlob', () => {
    const words = [
        'one',
        'two',
        'three',
        'four',
        'walk',
        'walking',
        'walks',
        'walked',
        'wall',
        'walls',
        'walled',
        'talk',
        'talked',
        'talking',
        'talks',
    ];

    test('createTrieBlob', () => {
        const trieBlob = createTrieBlob(words);
        expect([...trieBlob.words()].sort()).toEqual([...words].sort());
    });
});
