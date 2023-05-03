import { describe, expect, it } from 'vitest';

import * as Conv from './converter';

describe('Test Converter', () => {
    it('tests empty conversion', () => {
        const conv = new Conv.Converter([]);
        expect(conv.convert('hello')).toBe('hello');
        expect(conv.convert('')).toBe('');
    });

    it('tests basic conversion', () => {
        const conv = new Conv.Converter([{ from: 'hello', to: 'good-bye' }]);
        expect(conv.convert('hello')).toBe('good-bye');
        expect(conv.convert('')).toBe('');
        expect(conv.convert('Please say hello.')).toBe('Please say good-bye.');
    });

    it('tests multiple conversions', () => {
        const conv = new Conv.Converter([
            { from: 'hello', to: 'good-bye' },
            { from: 'good-bye', to: 'hello' },
        ]);
        expect(conv.convert('hello hello hello Hello!')).toBe('good-bye good-bye good-bye Hello!');
        expect(conv.convert('hello good-bye hello')).toBe('good-bye hello good-bye');
    });

    it('tests multiple conversions (with matching replacement)', () => {
        const conv = new Conv.Converter([{ from: 'hello', to: 'say hello' }]);
        expect(conv.convert('hello hello hello')).toBe('say hello say hello say hello');
    });

    it('tests unicode characters', () => {
        const conv = new Conv.Converter([
            { from: 'hello', to: 'good-bye' },
            { from: 'good-bye', to: 'hello' },
            { from: 'áá', to: 'aa' },
            { from: 'éé', to: 'ee' },
            { from: 'íé', to: 'ie' },
            { from: 'óó', to: 'oo' },
            { from: 'úú', to: 'uu' },
            { from: 'óé', to: 'oe' },
            { from: '’', to: "'" },
            { from: 'ij', to: '"ĳ' },
            { from: 'IJ', to: '"Ĳ' },
            { from: 'ĳ', to: 'ij' },
            { from: 'Ĳ', to: 'IJ' },
        ]);
        expect(conv.convert('')).toBe('');
        expect(conv.convert('ĳ')).toBe('ij');
        expect(conv.convert('áá')).toBe('aa');
        expect(conv.convert('’hello’')).toBe("'good-bye'");
    });

    it('tests with regex characters in the "from" (regex is not supported as a pattern)', () => {
        const conv = new Conv.Converter([
            { from: '^h', to: 'g' },
            { from: '^g', to: 'f' },
            { from: 'f$', to: 'g' },
            { from: 'g$', to: 'h' },
            { from: '|', to: '!' },
        ]);
        expect(conv.convert('helping')).toBe('helping');
        expect(conv.convert('f$n')).toBe('gn');
        expect(conv.convert('f|n')).toBe('f!n');
    });
});
