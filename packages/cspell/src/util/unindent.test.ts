import { describe, expect, test } from 'vitest';

import { unindent } from './unindent.js';

describe('unindent', () => {
    test('unindent', () => {
        expect(unindent`    Hello`).toBe('Hello');
        expect(unindent`    Hello\n      There`).toBe('Hello\n  There');
        expect(unindent`\n    Hello\n\n      There\n  `).toBe('\nHello\n\n  There\n');
        expect(unindent`    ${'Hello'}\n      ${'There'}`).toBe('Hello\n  There');
        expect(unindent('    Hello')).toBe('Hello');
        expect(unindent('\n    Hello')).toBe('\nHello');
    });
});
