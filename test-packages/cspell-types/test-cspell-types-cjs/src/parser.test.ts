import { describe, expect, test } from 'vitest';

import { parserName } from './parser';

describe('parser', () => {
    test('parserName', () => {
        expect(parserName).toBe('MyParser');
    });
});
