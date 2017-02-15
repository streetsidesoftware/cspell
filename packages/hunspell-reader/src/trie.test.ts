import {expect} from 'chai';
import * as Trie from './trie';
import {HunspellReader} from './HunspellReader';
import * as Aff from './aff';
import * as Rx from 'rxjs/Rx';
import * as AffReader from './affReader';

describe('Experiment with Tries', function() {
    const pSimpleAff = getSimpleAff();

    it('Adds words to a Trie and takes them back out.', () => {
        return pSimpleAff.then(aff => {
            const src = { aff, dic: Rx.Observable.from(words)};
            const reader = new HunspellReader(src);
            return reader.readWords()
                .toArray()
                // Sort them.
                .map(a => a.sort())
                // Make them unique
                .map(a => [...(new Set(a))])
                .toPromise()
                .then(words => {
                    const trie = words
                        .reduce((t, w) => {
                            return Trie.insert(w, t);
                        }, {} as Trie.TrieNode);
                    expect(trie.c).to.not.be.undefined;
                    const extractedWords = [...Trie.iteratorTrieWords(trie)];
                    expect(extractedWords).to.be.deep.equal(words);
                });
        });


    });

    it('Adds words to a Trie sorts the trie and takes them back out.', () => {
        return pSimpleAff.then(aff => {
            const src = { aff, dic: Rx.Observable.from(words)};
            const reader = new HunspellReader(src);
            return reader.readWords()
                .toArray()
                // Make them unique
                .map(a => [...(new Set(a))])
                .toPromise()
                .then(words => {
                    const trie = words
                        .reduce((t, w) => {
                            return Trie.insert(w, t);
                        }, {} as Trie.TrieNode);
                    expect(trie.c).to.not.be.undefined;
                    Trie.orderTrie(trie);
                    const extractedWords = [...Trie.iteratorTrieWords(trie)];
                    // console.log(extractedWords);
                    expect(extractedWords).to.be.deep.equal(words.sort());
                });
        });
    });

    it('buildReferenceTree', () => {
        return pSimpleAff.then(aff => {
            const src = { aff, dic: Rx.Observable.from(words)};
            const reader = new HunspellReader(src);
            return reader.readWords()
                .toArray()
                // Make them unique
                .map(a => [...(new Set(a))])
                .toPromise()
                .then(words => {
                    const trie = words
                        .reduce((t, w) => {
                            return Trie.insert(w, t);
                        }, {} as Trie.TrieNode);
                    const asString = [...Trie.exportTrie(trie, 10)].join('');
                    return Trie.importTrieRx(Rx.Observable.from(asString.split('\n')))
                        .toArray()
                        .toPromise()
                        .then(tries => {
                            const trie = words
                                .reduce((t, w) => {
                                    return Trie.insert(w, t);
                                }, {} as Trie.TrieNode);
                            const trie2 = tries[0];
                            const extractedWords1 = [...Trie.iteratorTrieWords(trie)];
                            const extractedWords2 = [...Trie.iteratorTrieWords(trie2)];
                            expect(extractedWords2.sort()).to.be.deep.equal(extractedWords1.sort());
                        });

                });
        });
    });
});


const words = [
    '99',
    'journal/MS',
    'journalese/M',
    'journalism/M',
    'journalist/SM',
    'journalistic',
    'journey/ZGMDRS',
    'journeyer/M',
    'journeyman/M',
    'journeymen',
    'journo/S',
    'joust/SZGMDR',
    'jouster/M',
    'jousting/M',
    'jovial/Y',
    'joviality/M',
    'jowl/MS',
    'jowly/TR',
    'joy/SGMD',
    'joyful/YP',
    'joyfuller',
    'joyfullest',
    'joyfulness/M',
    'joyless/PY',
    'joylessness/M',
    'joyous/YP',
    'joyousness/M',
    'joyridden',
    'joyride/RSMZG',
    'joyrider/M',
    'joyriding/M',
    'joyrode',
    'joystick/SM',
];



function getSimpleAff() {
    const englishAff = `
SET UTF-8
TRY esianrtolcdugmphbyfvkwzESIANRTOLCDUGMPHBYFVKWZ'
ICONV 1
ICONV ’ '
NOSUGGEST !

# ordinal numbers
COMPOUNDMIN 1
# only in compounds: 1th, 2th, 3th
ONLYINCOMPOUND c
# compound rules:
# 1. [0-9]*1[0-9]th (10th, 11th, 12th, 56714th, etc.)
# 2. [0-9]*[02-9](1st|2nd|3rd|[4-9]th) (21st, 22nd, 123rd, 1234th, etc.)
COMPOUNDRULE 2
COMPOUNDRULE n*1t
COMPOUNDRULE n*mp
WORDCHARS 0123456789

PFX A Y 1
PFX A   0     re         .

PFX I Y 1
PFX I   0     in         .

PFX U Y 1
PFX U   0     un         .

PFX C Y 1
PFX C   0     de          .

PFX E Y 1
PFX E   0     dis         .

PFX F Y 1
PFX F   0     con         .

PFX K Y 1
PFX K   0     pro         .

SFX V N 2
SFX V   e     ive        e
SFX V   0     ive        [^e]

SFX N Y 3
SFX N   e     ion        e
SFX N   y     ication    y
SFX N   0     en         [^ey]

SFX X Y 3
SFX X   e     ions       e
SFX X   y     ications   y
SFX X   0     ens        [^ey]

SFX H N 2
SFX H   y     ieth       y
SFX H   0     th         [^y]

SFX Y Y 1
SFX Y   0     ly         .

SFX G Y 2
SFX G   e     ing        e
SFX G   0     ing        [^e]

SFX J Y 2
SFX J   e     ings       e
SFX J   0     ings       [^e]

SFX D Y 4
SFX D   0     d          e
SFX D   y     ied        [^aeiou]y
SFX D   0     ed         [^ey]
SFX D   0     ed         [aeiou]y

SFX T N 4
SFX T   0     st         e
SFX T   y     iest       [^aeiou]y
SFX T   0     est        [aeiou]y
SFX T   0     est        [^ey]

SFX R Y 4
SFX R   0     r          e
SFX R   y     ier        [^aeiou]y
SFX R   0     er         [aeiou]y
SFX R   0     er         [^ey]

SFX Z Y 4
SFX Z   0     rs         e
SFX Z   y     iers       [^aeiou]y
SFX Z   0     ers        [aeiou]y
SFX Z   0     ers        [^ey]

SFX S Y 4
SFX S   y     ies        [^aeiou]y
SFX S   0     s          [aeiou]y
SFX S   0     es         [sxzh]
SFX S   0     s          [^sxzhy]

SFX P Y 3
SFX P   y     iness      [^aeiou]y
SFX P   0     ness       [aeiou]y
SFX P   0     ness       [^y]

SFX M Y 1
SFX M   0     's         .

SFX B Y 3
SFX B   0     able       [^aeiou]
SFX B   0     able       ee
SFX B   e     able       [^aeiou]e

SFX L Y 1
SFX L   0     ment       .
`;

    return AffReader.parseAff(Rx.Observable.from(englishAff.split('\n')))
        .then(affInfo => new Aff.Aff(affInfo));
}

/*
cspell:ignore ZGMDRS SZGMDR SGMD RSMZG COMPOUNDMIN COMPOUNDRULE WORDCHARS ication ications ieth ings iest iers sxzh sxzhy iness ment aeiou
*/
