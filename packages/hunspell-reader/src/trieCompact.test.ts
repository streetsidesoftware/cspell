import {expect} from 'chai';
import * as Rx from 'rx';
import {
    trieCompactSortedWordList,
    calcBackSpaceEmit,
    backSpaceEmitSequenceToLength,
    multiDeleteChar,
    singleDeleteChar,
    trieCompactExtract,
} from './trieCompact';

const words = [
    'create',
    'created',
    'creates',
    'creating',
    'creation',
    'creation\'s',
    'creationism',
    'creationism\'s',
    'creationisms',
    'creationist',
    'creationist\'s',
    'creationists',
    'creations',
    'creative',
    'creative\'s',
    'creatively',
    'creativeness',
    'creativeness\'s',
    'creatives',
];

describe('validate trieCompact functions', () => {

    it('tests backSpaceEmitSequenceToLength', () => {
        expect(backSpaceEmitSequenceToLength('\b\b\bHello').length).to.be.equal(3);
        expect(backSpaceEmitSequenceToLength('\b\b\bHello').offset).to.be.equal(3);
        expect(backSpaceEmitSequenceToLength(singleDeleteChar + singleDeleteChar).length).to.be.equal(2);
        expect(backSpaceEmitSequenceToLength(multiDeleteChar + '3Hello').length).to.be.equal(3);
        expect(backSpaceEmitSequenceToLength(multiDeleteChar + '3Hello').offset).to.be.equal(2);
    });

    it('tests calcBackSpaceEmit', () => {
        expect(calcBackSpaceEmit(1)).to.be.equal('\b');
        expect(calcBackSpaceEmit(2)).to.be.equal(multiDeleteChar + '2');
        expect(calcBackSpaceEmit(5)).to.be.equal(multiDeleteChar + '5');
        expect(calcBackSpaceEmit(129)).to.be.equal(multiDeleteChar + 'p' + multiDeleteChar + 'p\b');
    });

    it('tests trieCompactSortedWordList', () => {
        return trieCompactSortedWordList(Rx.Observable.fromArray(words))
            .toArray()
            .toPromise().then( values => {
                const str = values.join('');
                const expected = 'create\nd\bs\r2ing\r';
                const allWords = words.join('\n');
                // const json = JSON.stringify(str);
                expect(str.slice(0, expected.length)).to.be.equal(expected);
                expect(str.length).to.be.lessThan(allWords.length);
            });
    });

    it('makes sure a compacted trie can be extracted', () => {
        const stream = trieCompactSortedWordList(Rx.Observable.fromArray(words));
        return trieCompactExtract(stream)
            .toArray()
            .toPromise().then( values => {
                expect(values).to.be.deep.equal(words);
            });

    });
});
