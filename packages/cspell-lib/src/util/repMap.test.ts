import {expect} from 'chai';
import * as repMap from './repMap';

describe('ReMap Tests', () => {
    test('test basic replace', () => {
        const mapper = repMap.createMapper([]);
        expect(mapper('hello')).to.be.equal('hello');
    });

    test('test basic replace', () => {
        const mapper = repMap.createMapper([['`', "'"]]);
        expect(mapper('hello')).to.be.equal('hello');
        expect(mapper('don`t')).to.be.equal("don't");
    });

    test('test multiple replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['b', 'B']]);
        expect(mapper('apple')).to.be.equal('Apple');
        expect(mapper('banana')).to.be.equal('BAnAnA');
    });

    test('test empty replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['b', 'B'], ['', '']]);
        expect(mapper('apple')).to.be.equal('Apple');
        expect(mapper('banana')).to.be.equal('BAnAnA');
    });

    test('test regex replacements', () => {
        const mapper = repMap.createMapper([['!|@|#|\\$', '_'], ['a', 'A']]);
        expect(mapper('$apple!!')).to.be.equal('_Apple__');
    });

    test('test repeated replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['a', 'X']]);
        expect(mapper('apples')).to.be.equal('Apples');
    });

    test('test nested regex replacements', () => {
        const mapper = repMap.createMapper([['(!)', '_'], ['((\\$))', '#'], ['a', 'A']]);
        expect(mapper('$apple!!')).to.be.equal('#Apple__');
    });

    test('test bad regex replacements', () => {
        const mapper = repMap.createMapper([['(', '_'], ['a', 'A']]);
        expect(mapper('(apple)')).to.be.equal('_Apple)');
    });

    test('test empty regex replacements', () => {
        const mapper = repMap.createMapper([['', '_'], ['a', 'A']]);
        expect(mapper('(apple)')).to.be.equal('(Apple)');
    });
});
