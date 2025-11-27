import { describe, expect, test } from 'vitest';

import { indent, keepIndent, padLength, unindent } from './unindent.js';

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

describe('indent', () => {
    test('should indent multi-line string with default padding', () => {
        const str = 'line1\nline2\nline3';
        expect(indent(str, '')).toBe('line1\nline2\nline3');
    });

    test('should indent multi-line string with custom padding', () => {
        const str = 'line1\nline2\nline3';
        expect(indent(str, '  ')).toBe('line1\n  line2\n  line3');
    });

    test('should indent with different first line padding', () => {
        const str = 'line1\nline2\nline3';
        expect(indent(str, '  ', '>')).toBe('>line1\n  line2\n  line3');
    });

    test('should handle empty string', () => {
        expect(indent('', '  ')).toBe('');
    });

    test('should handle single line', () => {
        expect(indent('single', '  ')).toBe('single');
    });
});

describe('padLength', () => {
    test('should return 0 for string with no padding', () => {
        expect(padLength('hello')).toBe(0);
    });

    test('should return correct padding length', () => {
        expect(padLength('  hello')).toBe(2);
        expect(padLength('    hello')).toBe(4);
    });

    test('should handle empty string', () => {
        expect(padLength('')).toBe(0);
    });

    test('should handle string with only spaces', () => {
        expect(padLength('   ')).toBe(3);
    });
});

describe('unindent', () => {
    test('should remove common indentation', () => {
        const str = '  line1\n  line2\n  line3';
        expect(unindent(str)).toBe('line1\nline2\nline3');
    });

    test('should handle different indentation levels', () => {
        const str = '    line1\n  line2\n    line3';
        expect(unindent(str)).toBe('  line1\nline2\n  line3');
    });

    test('should ignore empty lines', () => {
        const str = '  line1\n\n  line2';
        expect(unindent(str)).toBe('line1\n\nline2');
    });

    test('should handle no indentation', () => {
        const str = 'line1\nline2';
        expect(unindent(str)).toBe('line1\nline2');
    });
    test('should inject values into template', () => {
        const result = unindent`Hello ${'World'}!`;
        expect(result).toBe('Hello World!');
    });

    test('should preserve indentation for multi-line values', () => {
        const value = 'line1\nline2\nline3';
        const result = unindent`Start:
    ${value}
End`;
        expect(result).toBe(`\
Start:
    line1
    line2
    line3
End`);
    });

    test('should handle multiple injections', () => {
        const result = unindent`First: ${'A'}, Second: ${'B'}`;
        expect(result).toBe('First: A, Second: B');
    });

    test('should unindent result', () => {
        const value = [1, 2, 3].join('\n');
        const result = unindent`
            Line values:
              ${value}
            Line 2
        `;
        expect(result).toBe('\nLine values:\n  1\n  2\n  3\nLine 2\n');
    });

    test('should unindent result', () => {
        const value = [1, 2, 3].join('\n');
        const result = unindent`
            Line values: ${value}
            Line 2
        `;
        expect(result).toBe('\nLine values: 1\n2\n3\nLine 2\n');
    });
});

describe('inject', () => {
    test('should inject values into template', () => {
        const result = keepIndent`Hello ${'World'}!`;
        expect(result).toBe('Hello World!');
    });

    test('should preserve indentation for multi-line values', () => {
        const value = 'line1\nline2\nline3';
        const result = keepIndent`Start:
    ${value}
End`;
        expect(result).toBe('Start:\n    line1\n    line2\n    line3\nEnd');
    });

    test('should handle multiple injections', () => {
        const result = keepIndent`First: ${'A'}, Second: ${'B'}`;
        expect(result).toBe('First: A, Second: B');
    });

    test('should not unindent the result', () => {
        const result = keepIndent`
            Line 1
            Line 2
        `;
        expect(result).toBe(`
            Line 1
            Line 2
        `);
    });
});
