import { __testing__, createMapper } from './repMap';

const { createMapperRegExp, charsetToRepMap } = __testing__;

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
