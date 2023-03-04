import { describe, expect, test } from 'vitest';

import { run, createDict } from './index.js';

describe('index', () => {
    test('run', () => {
        expect(run('one')).toBe(true);
    });

    test('createDict', () => {
        const dict = createDict('these are some words'.split(' '), 'some words');
        expect(dict.has('these')).toBe(true);
        expect(dict.has('other')).toBe(false);
    });
});
