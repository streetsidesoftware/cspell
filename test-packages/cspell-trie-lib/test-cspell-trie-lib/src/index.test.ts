import { describe, expect, test } from 'vitest';

import { createDictionary, run } from './index.js';

describe('index', () => {
    test('run', () => {
        expect(typeof run).toBe('function');
        expect(run()).toBe(true);
    });

    test('createDictionary', () => {
        const dict = createDictionary();
        expect(dict.has('one')).toBe(true);
    });
});
