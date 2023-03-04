import { describe, expect, test } from 'vitest';

import { __testing__, createMapper } from './repMap.js';

const { createMapperRegExp, charsetToRepMap, createTrie, calcAllEdits, applyEdits } = __testing__;

describe('ReMap Tests', () => {
    test('empty replace map', () => {
        const mapper = createMapper([]);
        expect(mapper('hello')).toBe('hello');
    });

    test('punctuation replacement', () => {
        const mapper = createMapper([['`', "'"]]);
        expect(mapper('hello')).toBe('hello');
        expect(mapper('don`t')).toBe("don't");
    });

    test('multiple replacements', () => {
        const mapper = createMapper([
            ['a', 'A'],
            ['b', 'B'],
        ]);
        expect(mapper('apple')).toBe('Apple');
        expect(mapper('banana')).toBe('BAnAnA');
    });

    test('empty replacements', () => {
        const mapper = createMapper([
            ['a', 'A'],
            ['b', 'B'],
            ['', ''],
        ]);
        expect(mapper('apple')).toBe('Apple');
        expect(mapper('banana')).toBe('BAnAnA');
    });

    test('regex replacements', () => {
        const mapper = createMapper([
            ['!|@|#|\\$', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('$apple!!')).toBe('_Apple__');
    });

    test('repeated replacements', () => {
        const mapper = createMapper([
            ['a', 'A'],
            ['a', 'X'],
        ]);
        expect(mapper('apples')).toBe('Apples');
    });

    test('nested regex replacements', () => {
        const mapper = createMapper([
            ['(!)', '_'],
            ['((\\$))', '#'],
            ['a', 'A'],
        ]);
        expect(mapper('$apple!!')).toBe('#Apple__');
    });

    test('bad regex replacements', () => {
        const mapper = createMapper([
            ['(', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('(apple)')).toBe('_Apple)');
    });

    test('empty regex replacements', () => {
        const mapper = createMapper([
            ['', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('(apple)')).toBe('(Apple)');
    });

    // cspell:ignore strasse straße

    test.each`
        map                             | word         | expected
        ${[]}                           | ${'word'}    | ${'word'}
        ${[['ae', 'ä'], ['ss', 'ß']]}   | ${'strasse'} | ${'straße'}
        ${[['ae', 'ä'], ['s{2}', 'ß']]} | ${'strasse'} | ${'straße'}
        ${[['ae', 'ä'], ['ss', 'ß']]}   | ${'STRASSE'} | ${'STRASSE'}
    `('map with word $map / $word', ({ map, word, expected }) => {
        const mapper = createMapper(map);
        expect(mapper(word)).toBe(expected);
    });

    test.each`
        map                             | expected
        ${[]}                           | ${/$^/}
        ${[['ae', 'ä'], ['s{2}', 'ß']]} | ${/(ae)|(s{2})/g}
        ${[['ae', 'ä'], ['ss', 'ß']]}   | ${/(ae)|(ss)/g}
    `('createMapperRegExp $map', ({ map, expected }) => {
        const reg = createMapperRegExp(map);
        expect(reg).toEqual(expected);
    });

    test.each`
        charset              | expected
        ${undefined}         | ${undefined}
        ${''}                | ${undefined}
        ${'a-z'}             | ${[['[a-z]', '']]}
        ${'0x300-0x308'}     | ${[['[0x300-0x308]', '']]}
        ${'0x300-0x308|a-z'} | ${[['[0x300-0x308]', ''], ['[a-z]', '']]}
    `('charsetToRepMap $charset', ({ charset, expected }) => {
        const reg = charsetToRepMap(charset);
        expect(reg).toEqual(expected);
    });
});

describe('RepMapper', () => {
    test.each`
        repMap                        | ignoreChars  | expected
        ${undefined}                  | ${undefined} | ${{}}
        ${[['a', 'b']]}               | ${undefined} | ${{ children: { a: { rep: ['b'] } } }}
        ${[['a', 'b'], ['a', 'b']]}   | ${undefined} | ${{ children: { a: { rep: ['b'] } } }}
        ${[['a', 'b'], ['a', 'c']]}   | ${undefined} | ${{ children: { a: { rep: ['b', 'c'] } } }}
        ${[['a', 'b'], ['a', 'c']]}   | ${'a'}       | ${{ children: { a: { rep: ['b', 'c', ''] } } }}
        ${[['a', 'b'], ['a', 'c']]}   | ${'i'}       | ${{ children: { a: { rep: ['b', 'c'] }, i: { rep: [''] } } }}
        ${[['a', 'b'], ['a', 'c']]}   | ${'i'}       | ${{ children: { a: { rep: ['b', 'c'] }, i: { rep: [''] } } }}
        ${[['a|i', 'b'], ['a', 'c']]} | ${'i'}       | ${{ children: { a: { rep: ['b', 'c'] }, i: { rep: ['b', ''] } } }}
    `('createTrie', ({ repMap, ignoreChars, expected }) => {
        expect(createTrie(repMap, ignoreChars)).toEqual(expected);
    });

    test.each`
        repMap                         | ignoreChars  | word       | expected
        ${undefined}                   | ${undefined} | ${'hello'} | ${[]}
        ${[['e', 'é']]}                | ${undefined} | ${'hello'} | ${[{ b: 1, e: 2, r: 'é' }]}
        ${[['e', 'é'], ['o', 'ó']]}    | ${undefined} | ${'hello'} | ${[{ b: 1, e: 2, r: 'é' }, { b: 4, e: 5, r: 'ó' }]}
        ${[['ll', 'y'], ['ll', 'el']]} | ${undefined} | ${'hello'} | ${[{ b: 2, e: 4, r: 'y' }, { b: 2, e: 4, r: 'el' }]}
        ${[['f', 'ph'], ['ph', 'f']]}  | ${undefined} | ${'phone'} | ${[{ b: 0, e: 2, r: 'f' }]}
    `('calcAllEdits', ({ repMap, ignoreChars, word, expected }) => {
        const root = createTrie(repMap, ignoreChars);
        expect(calcAllEdits(root, word)).toEqual(expected);
    });

    // cspell:ignore héllo helló hélló heyo heelo fone phoné phöne
    test.each`
        repMap                         | ignoreChars        | word          | expected
        ${undefined}                   | ${undefined}       | ${'hello'}    | ${['hello']}
        ${[['e', 'é']]}                | ${undefined}       | ${'hello'}    | ${['hello', 'héllo']}
        ${[['e', 'é'], ['o', 'ó']]}    | ${undefined}       | ${'hello'}    | ${['hello', 'helló', 'héllo', 'hélló']}
        ${[['ll', 'y'], ['ll', 'el']]} | ${undefined}       | ${'hello'}    | ${['hello', 'heyo', 'heelo']}
        ${[['f', 'ph'], ['ph', 'f']]}  | ${undefined}       | ${'phone'}    | ${['phone', 'fone']}
        ${[]}                          | ${'\u0300-\u0308'} | ${N('phoné')} | ${[N('phoné'), 'phone']}
        ${[]}                          | ${'\u0300-\u0308'} | ${N('phöne')} | ${[N('phöne'), 'phone']}
    `('applyEdits', ({ repMap, ignoreChars, word, expected }) => {
        const root = createTrie(repMap, ignoreChars);
        const edits = calcAllEdits(root, word);
        expect(applyEdits(word, edits)).toEqual(expected);
    });
});

function N(s: string, mode: 'NFD' | 'NFC' = 'NFD') {
    return s.normalize(mode);
}
