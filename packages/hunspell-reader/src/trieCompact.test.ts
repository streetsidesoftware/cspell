import {expect} from 'chai';
import * as Rx from 'rxjs/Rx';
import {
    trieCompactSortedWordList,
    calcBackSpaceEmit,
    backSpaceEmitSequenceToLength,
    multiDeleteChar,
    singleDeleteChar,
    trieCompactExtract,
    escapeLetters,
    unescapeLetters,
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
    'do_not',
    'do~not',
    'do=not',
];

describe('validate trieCompact functions', () => {

    it('tests backSpaceEmitSequenceToLength', () => {
        expect(backSpaceEmitSequenceToLength('___Hello').length).to.be.equal(3);
        expect(backSpaceEmitSequenceToLength('___Hello').offset).to.be.equal(3);
        expect(backSpaceEmitSequenceToLength(singleDeleteChar + singleDeleteChar).length).to.be.equal(2);
        expect(backSpaceEmitSequenceToLength(multiDeleteChar + '3Hello').length).to.be.equal(3);
        expect(backSpaceEmitSequenceToLength(multiDeleteChar + '3Hello').offset).to.be.equal(2);
    });

    it('tests calcBackSpaceEmit', () => {
        expect(calcBackSpaceEmit(1)).to.be.equal('_');
        expect(calcBackSpaceEmit(2)).to.be.equal(multiDeleteChar + '2');
        expect(calcBackSpaceEmit(5)).to.be.equal(multiDeleteChar + '5');
        expect(calcBackSpaceEmit(129)).to.be.equal(multiDeleteChar + 'p' + multiDeleteChar + 'p_');
    });

    it('tests trieCompactSortedWordList', () => {
        return trieCompactSortedWordList(Rx.Observable.from(words))
            .toArray()
            .toPromise().then( values => {
                const str = values.join('');
                const expected = 'create\nd_s=2ing=';
                const allWords = words.join('\n');
                // const json = JSON.stringify(str);
                expect(str.slice(0, expected.length)).to.be.equal(expected);
                expect(str.length).to.be.lessThan(allWords.length);
            });
    });

    it('makes sure a compacted trie can be extracted', () => {
        const stream = trieCompactSortedWordList(Rx.Observable.from(words));
        return trieCompactExtract(stream)
            .toArray()
            .toPromise().then( values => {
                expect(values).to.be.deep.equal(words);
            });
    });

    it('tests escaping letters', () => {
        const tests = [
            ['this_is_a~test', 'this~_is~_a~~test'],
            ['this=is_a~test', 'this~=is~_a~~test'],
        ];

        tests.forEach(([before, after]) => {
            const r = escapeLetters(before);
            expect(r).to.be.equal(after);
            const s = unescapeLetters(r);
            expect(s).to.be.equal(before);
        });
    });
});
