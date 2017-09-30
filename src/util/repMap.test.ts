import {expect} from 'chai';
import * as repMap from './repMap';

describe('ReMap Tests', () => {
    it('test basic replace', () => {
        const mapper = repMap.createMapper([]);
        expect(mapper('hello')).to.be.equal('hello');
    });

    it('test basic replace', () => {
        const mapper = repMap.createMapper([['`', "'"]]);
        expect(mapper('hello')).to.be.equal('hello');
        expect(mapper('don`t')).to.be.equal("don't");
    });

    it('test multiple replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['b', 'B']]);
        expect(mapper('apple')).to.be.equal('Apple');
        expect(mapper('banana')).to.be.equal('BAnAnA');
    });

    it('test empty replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['b', 'B'], ['', '']]);
        expect(mapper('apple')).to.be.equal('Apple');
        expect(mapper('banana')).to.be.equal('BAnAnA');
    });

    it('test regex replacements', () => {
        const mapper = repMap.createMapper([['!|@|#|\\$', '_'], ['a', 'A']]);
        expect(mapper('$apple!!')).to.be.equal('_Apple__');
    });

    it('test repeated replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['a', 'X']]);
        expect(mapper('apples')).to.be.equal('Apples');
    });

    it('test nested regex replacements', () => {
        const mapper = repMap.createMapper([['(!)', '_'], ['((\\$))', '#'], ['a', 'A']]);
        expect(mapper('$apple!!')).to.be.equal('#Apple__');
    });

    it('test bad regex replacements', () => {
        const mapper = repMap.createMapper([['(', '_'], ['a', 'A']]);
        expect(mapper('(apple)')).to.be.equal('_Apple)');
    });

    it('test empty regex replacements', () => {
        const mapper = repMap.createMapper([['', '_'], ['a', 'A']]);
        expect(mapper('(apple)')).to.be.equal('(Apple)');
    });
});
