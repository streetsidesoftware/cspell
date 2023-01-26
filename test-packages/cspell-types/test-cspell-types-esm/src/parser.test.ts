import { describe, expect, test } from 'vitest';

import { parserName } from './parser.js';

describe('parser', () => {
    test('parserName', () => {
        expect(parserName).toBe('MyParser');
    });
});
