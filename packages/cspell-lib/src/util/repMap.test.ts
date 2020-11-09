import * as repMap from './repMap';

describe('ReMap Tests', () => {
    test('basic replace', () => {
        const mapper = repMap.createMapper([]);
        expect(mapper('hello')).toEqual('hello');
    });

    test('basic replace quotes', () => {
        const mapper = repMap.createMapper([['`', "'"]]);
        expect(mapper('hello')).toEqual('hello');
        expect(mapper('don`t')).toEqual("don't");
    });

    test('multiple replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['b', 'B'],
        ]);
        expect(mapper('apple')).toEqual('Apple');
        expect(mapper('banana')).toEqual('BAnAnA');
    });

    test('empty replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['b', 'B'],
            ['', ''],
        ]);
        expect(mapper('apple')).toEqual('Apple');
        expect(mapper('banana')).toEqual('BAnAnA');
    });

    test('regex replacements', () => {
        const mapper = repMap.createMapper([
            ['!|@|#|\\$', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('$apple!!')).toEqual('_Apple__');
    });

    test('repeated replacements', () => {
        const mapper = repMap.createMapper([
            ['a', 'A'],
            ['a', 'X'],
        ]);
        expect(mapper('apples')).toEqual('Apples');
    });

    test('nested regex replacements', () => {
        const mapper = repMap.createMapper([
            ['(!)', '_'],
            ['((\\$))', '#'],
            ['a', 'A'],
        ]);
        expect(mapper('$apple!!')).toEqual('#Apple__');
    });

    test('bad regex replacements', () => {
        const mapper = repMap.createMapper([
            ['(', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('(apple)')).toEqual('_Apple)');
    });

    test('empty regex replacements', () => {
        const mapper = repMap.createMapper([
            ['', '_'],
            ['a', 'A'],
        ]);
        expect(mapper('(apple)')).toEqual('(Apple)');
    });
});
