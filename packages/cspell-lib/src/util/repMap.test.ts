import * as repMap from './repMap';

describe('ReMap Tests', () => {
    test('test basic replace', () => {
        const mapper = repMap.createMapper([]);
        expect(mapper('hello')).toBe('hello');
    });

    test('test basic replace', () => {
        const mapper = repMap.createMapper([['`', "'"]]);
        expect(mapper('hello')).toBe('hello');
        expect(mapper('don`t')).toBe("don't");
    });

    test('test multiple replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['b', 'B'],
        ]);
        expect(mapper('apple')).toBe('Apple');
        expect(mapper('banana')).toBe('BAnAnA');
    });

    test('test empty replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['b', 'B'],
            ['', ''],
        ]);
        expect(mapper('apple')).toBe('Apple');
        expect(mapper('banana')).toBe('BAnAnA');
    });

    test('test regex replacements', () => {
        const mapper = repMap.createMapper([
            ['!|@|#|\\$', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('$apple!!')).toBe('_Apple__');
    });

    test('test repeated replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['a', 'X'],
        ]);
        expect(mapper('apples')).toBe('Apples');
    });

    test('test nested regex replacements', () => {
        const mapper = repMap.createMapper([
            ['(!)', '_'],
            ['((\\$))', '#'],
            ['a', 'A'],
        ]);
        expect(mapper('$apple!!')).toBe('#Apple__');
    });

    test('test bad regex replacements', () => {
        const mapper = repMap.createMapper([
            ['(', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('(apple)')).toBe('_Apple)');
    });

    test('test empty regex replacements', () => {
        const mapper = repMap.createMapper([
            ['', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('(apple)')).toBe('(Apple)');
    });
});
