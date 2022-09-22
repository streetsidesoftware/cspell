import * as repMap from './repMap';

describe('ReMap Tests', () => {
    test('empty replace map', () => {
        const mapper = repMap.createMapper([]);
        expect(mapper('hello')).toBe('hello');
    });

    test('punctuation replacement', () => {
        const mapper = repMap.createMapper([['`', "'"]]);
        expect(mapper('hello')).toBe('hello');
        expect(mapper('don`t')).toBe("don't");
    });

    test('multiple replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['b', 'B'],
        ]);
        expect(mapper('apple')).toBe('Apple');
        expect(mapper('banana')).toBe('BAnAnA');
    });

    test('empty replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['b', 'B'],
            ['', ''],
        ]);
        expect(mapper('apple')).toBe('Apple');
        expect(mapper('banana')).toBe('BAnAnA');
    });

    test('regex replacements', () => {
        const mapper = repMap.createMapper([
            ['!|@|#|\\$', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('$apple!!')).toBe('_Apple__');
    });

    test('repeated replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['a', 'X'],
        ]);
        expect(mapper('apples')).toBe('Apples');
    });

    test('nested regex replacements', () => {
        const mapper = repMap.createMapper([
            ['(!)', '_'],
            ['((\\$))', '#'],
            ['a', 'A'],
        ]);
        expect(mapper('$apple!!')).toBe('#Apple__');
    });

    test('bad regex replacements', () => {
        const mapper = repMap.createMapper([
            ['(', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('(apple)')).toBe('_Apple)');
    });

    test('empty regex replacements', () => {
        const mapper = repMap.createMapper([
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
        const mapper = repMap.createMapper(map);
        expect(mapper(word)).toBe(expected);
    });
});
