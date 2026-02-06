import { describe, expect, test } from 'vitest';

import { inject, unindent } from './unindent.js';

describe('unindent', () => {
    test('should remove common leading whitespace', () => {
        const input = `
            line 1
            line 2
            line 3
        `;
        const expected = '\nline 1\nline 2\nline 3\n';
        expect(unindent(input)).toBe(expected);
    });

    test('should handle empty string', () => {
        expect(unindent('')).toBe('');
    });

    test('should handle string with no indentation', () => {
        const input = 'line 1\nline 2\nline 3';
        expect(unindent(input)).toBe(input);
    });

    test('should preserve relative indentation', () => {
        const input = `
            line 1
                line 2 (indented more)
            line 3
        `;
        const expected = '\nline 1\n    line 2 (indented more)\nline 3\n';
        expect(unindent(input)).toBe(expected);
    });

    test('should handle mixed indentation levels', () => {
        const input = `
                deeply indented
            less indented
                deeply again
        `;
        const expected = '\n    deeply indented\nless indented\n    deeply again\n';
        expect(unindent(input)).toBe(expected);
    });

    test('should ignore empty lines when calculating common indent', () => {
        const input = `
            line 1

            line 3
        `;
        const expected = '\nline 1\n\nline 3\n';
        expect(unindent(input)).toBe(expected);
    });

    test('should handle single line', () => {
        const input = '    single line';
        const expected = 'single line';
        expect(unindent(input)).toBe(expected);
    });

    test('should handle tabs', () => {
        const input = '\t\tline 1\n\t\tline 2';
        const expected = 'line 1\nline 2';
        expect(unindent(input)).toBe(expected);
    });

    test('should work as template tag', () => {
        const value = 'world';
        const result = unindent`
            Hello ${value}!
            This is indented.
        `;
        const expected = '\nHello world!\nThis is indented.\n';
        expect(result).toBe(expected);
    });

    test('should handle lines with only whitespace', () => {
        const input = '    line 1\n    \n    line 3';
        const expected = 'line 1\n\nline 3';
        expect(unindent(input)).toBe(expected);
    });
});

describe('inject', () => {
    test('should inject single value', () => {
        const result = inject`\
            Hello ${'world'}!`;
        expect(result).toBe('Hello world!');
    });

    test.only('should inject multiple values', () => {
        const result = inject`
            ${'a'} and ${'b\nbb\nbbb\n'} and ${'c'}
        `;
        expect(result).toBe('\na and b\nbb\nbbb\n and c\n');
    });

    test('should handle empty string', () => {
        const result = inject``;
        expect(result).toBe('');
    });

    test('should handle no substitutions', () => {
        const result = inject`just a string`;
        expect(result).toBe('just a string');
    });

    test('should handle numbers', () => {
        const result = inject`The answer is ${42}`;
        expect(result).toBe('The answer is 42');
    });

    test('should handle multiline strings', () => {
        const values = 'line 2a\nline 2b';
        const result = inject`\
            line 1
            line 2
              ${values}
            line 3`;
        expect(result).toBe('line 1\nline 2\n  line 2a\n  line 2b\nline 3');
    });

    test('should handle multiline strings 2', () => {
        const values = 'line 2a\nline 2b';
        const result = inject`
            line 1
            line 2 ${values}
            line 3`;
        expect(result).toBe('\nline 1\nline 2 line 2a\nline 2b\nline 3');
    });

    test('should handle values at start and end', () => {
        const result = inject`${'start'} middle ${'end'}`;
        expect(result).toBe('start middle end');
    });

    test('should handle consecutive substitutions', () => {
        const result = inject`${'a'}${'b'}${'c'}`;
        expect(result).toBe('abc');
    });
});
