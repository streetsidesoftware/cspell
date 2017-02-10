import {expect} from 'chai';
import {HunspellReader} from './HunspellReader';
import * as Aff from './aff';
import * as Rx from 'rxjs/Rx';
import * as AffReader from './affReader';

describe('Basic Validation of the Reader', () => {
    const pSimpleAff = getSimpleAff();

    it('Validate Simple Words List', () => {
        return pSimpleAff.then(aff => {
            const src = { aff, dic: textToStream(simpleWords)};
            const reader = new HunspellReader(src);
            return reader.readRootWords()
                .toArray()
                .toPromise()
                .then(affWords => {
                    expect(affWords).to.be.deep.equal(['happy', 'ring']);
                });
        });
    });
    it('Validate Simple Words List', () => {
        return pSimpleAff.then(aff => {
            const src = { aff, dic: wordsToStream(['place/AGJ'])};
            const reader = new HunspellReader(src);
            return reader.readWords()
                .toArray()
                .toPromise()
                .then(affWords => {
                    expect(affWords).to.be.deep.equal(['place', 'replace', 'replacing', 'replacings', 'placing', 'placings']);
                });
        });
    });
});


describe('HunspellReader En', function() {
    // We are reading big files, so we need to give it some time.
    this.timeout(10000);
    const aff = __dirname + '/../dictionaries/en_US.aff';
    const dic = __dirname + '/../dictionaries/en_US.dic';
    const pReader = HunspellReader.createFromFiles(aff, dic);

    it('reads dict entries', () => {
        return pReader
            .then(reader => reader.readDicWords()
                .skip(10000)
                .take(10)
                .toArray()
                .toPromise()
                .then(values => {
                    expect(values.length).to.be.equal(10);
                })
            );
    });

    it('reads words with info', () => {
        return pReader
            .then(reader => reader.readWordsRx()
                .skip(10000)
                .take(10)
                .toArray()
                .toPromise()
                .then(values => {
                    expect(values.length).to.be.equal(10);
                })
            );
    });

    it('reads words', () => {
        return pReader
            .then(reader => reader.readWords()
                .skip(10000)
                .take(10)
                .toArray()
                .toPromise()
                .then(values => {
                    expect(values.length).to.be.equal(10);
                })
            );
    });
});

describe('HunspellReader Nl', function() {
    // We are reading big files, so we need to give it some time.
    this.timeout(10000);
    const aff = __dirname + '/../dictionaries/nl.aff';
    const dic = __dirname + '/../dictionaries/nl.dic';
    const pReader = HunspellReader.createFromFiles(aff, dic);

    it('reads words with info', () => {
        return pReader
            .then(reader => reader.readWordsRx()
                .skip(10000)
                .take(10)
                .toArray()
                .toPromise()
                .then(values => {
                    expect(values.length).to.be.equal(10);
                })
            );
    });

});

describe('HunspellReader PT (Brazil)', function() {
    // We are reading big files, so we need to give it some time.
    this.timeout(10000);
    const aff = __dirname + '/../dictionaries/Portuguese (Brazilian).aff';
    const dic = __dirname + '/../dictionaries/Portuguese (Brazilian).dic';
    const pReader = HunspellReader.createFromFiles(aff, dic);

    it('reads words with info', () => {
        return pReader
        .then(reader => reader.readWordsRx()
            .skip(200)
            .take(200)
            // .do(info => { console.log(Aff.affWordToColoredString(info)); })
            .toArray()
            .toPromise()
            .then(values => {
                expect(values.length).to.be.equal(200);
            })
        );
    });
});


function textToStream(text: string) {
    return wordsToStream(text.split('\n'));
}

function wordsToStream(words: string[]) {
    return Rx.Observable.from(words)
        .map(a => a.trim())
        .filter(a => !!a);
}

function getSimpleAff() {
    const sampleAff = `
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

PFX X Y 1
PFX X   0     un         .
PFX X   0     re         .
PFX X   0     in         .
PFX X   0     a          .

SFX G Y 2
SFX G   e     ing        e
SFX G   0     ing        [^e]

SFX J Y 2
SFX J   e     ings       e
SFX J   0     ings       [^e]
`;

    return AffReader.parseAff(Rx.Observable.from(sampleAff.split('\n')))
        .then(affInfo => new Aff.Aff(affInfo));
}


const simpleWords = `
happy
ring/AUGJ
`;

// cspell:ignore moderne avoir huis pannenkoek ababillar CDSG ings AUGJ
// cspell:enableCompoundWords