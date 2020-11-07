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
});
