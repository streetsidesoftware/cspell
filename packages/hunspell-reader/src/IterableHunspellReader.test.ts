import { IterableHunspellReader } from './IterableHunspellReader';
import * as Aff from './aff';
import * as AffReader from './affReader';
import { genSequence } from 'gensequence';
import * as fs from 'fs-extra';
import * as path from 'path';

const DICTIONARY_LOCATIONS = path.join(__dirname, '..', 'dictionaries');

basicReadTests();

describe('Basic Validation of the Reader', () => {
    const pSimpleAff = getSimpleAff();

    it('Validate the dictionary', async () => {
        const aff = await pSimpleAff;
        const src = { aff, dic: textToArray(simpleWords) };
        const reader = new IterableHunspellReader(src);
        expect(reader.dic).toEqual(textToArray(simpleWords));
    });

    it('Validate Simple Words List', async () => {
        const aff = await pSimpleAff;
        const src = { aff, dic: textToArray(simpleWords) };
        const reader = new IterableHunspellReader(src);
        expect([...reader.iterateRootWords()]).toEqual(['happy', 'ring']);
        const tapped: string[] = [];
        const words = [...reader.seqAffWords((w) => tapped.push(w)).map((a) => a.word)];
        const someExpectedWords = ['happy', 'unhappy', 'happily', 'unhappily'];
        expect(words).toEqual(expect.arrayContaining(someExpectedWords));
        expect(tapped).toEqual(['happy/UY', 'ring/AUJ']);
    });

    it('Validate Simple Words List', async () => {
        const aff = await pSimpleAff;
        const src = { aff, dic: ['place/AJ'] };
        const reader = new IterableHunspellReader(src);
        // cspell:ignore replacings
        expect([...reader]).toEqual(['place', 'placing', 'placings', 'replace', 'replacing', 'replacings']);
        expect(reader.size).toBe(1);
    });

    it('Validates prefix/suffix/base', async () => {
        const aff = await pSimpleAff;
        const src = { aff, dic: textToArray(simpleWords) };
        const reader = new IterableHunspellReader(src);
        const results = [...reader.seqAffWords().map((a) => a.prefix + '<' + a.base + '>' + a.suffix)];
        const someExpectedWords = ['<happy>', 'un<happy>', '<happ>ily', 'un<happ>ily']; // cspell:ignore happ
        expect(results).toEqual(expect.arrayContaining(someExpectedWords));
    });

    it('sets the max depth', async () => {
        const aff = await pSimpleAff;
        const src = { aff, dic: textToArray(simpleWords) };
        const reader = new IterableHunspellReader(src);
        const depth = reader.maxDepth;
        reader.maxDepth = 0;
        const results = [...reader.seqAffWords().map((a) => a.prefix + '<' + a.base + '>' + a.suffix)].sort();
        const expectedWords = ['<happy>', '<ring>'].sort(); // cspell:ignore happ
        reader.maxDepth = depth;
        expect(results).toEqual(expectedWords);
    });

    it('Iterates a few words', async () => {
        const aff = await pSimpleAff;
        const src = { aff, dic: textToArray(simpleWords) };
        const reader = new IterableHunspellReader(src);
        const words = [...reader.iterateWords()];
        expect(words).toEqual(expect.arrayContaining(['happy', 'unhappy', 'happily', 'unhappily', 'ring']));
    });
});

describe('HunspellReader En', function () {
    // We are reading big files, so we need to give it some time.
    jest.setTimeout(10000);
    const aff = __dirname + '/../dictionaries/en_US.aff';
    const dic = __dirname + '/../dictionaries/en_US.dic';
    const pReader = IterableHunspellReader.createFromFiles(aff, dic);

    it('reads dict entries', async () => {
        const reader = await pReader;
        const values = reader.dicWordsSeq().skip(10000).take(10).toArray();
        expect(values.length).toBe(10);
    });

    it('reads words with info', async () => {
        const reader = await pReader;
        const values = reader.seqWords().skip(10000).take(10).toArray();
        expect(values.length).toBe(10);
    });

    it('reads words', async () => {
        const reader = await pReader;
        const values = genSequence(reader).skip(10000).take(10).toArray();
        expect(values.length).toBe(10);
    });

    it('tests iterating through dictionary entry transformations', async () => {
        const reader = await pReader;
        const dicEntries: { word: string; index: number }[] = [];

        function recordEntries(word: string, index: number) {
            dicEntries.push({ word, index });
        }

        const values = reader.seqTransformDictionaryEntries(recordEntries, 2).skip(100).take(10).toArray();
        // Note the current implementation of Sequence will pre-fetch the next iteration
        // causing 1 more than expected to be recorded.
        expect(dicEntries).toHaveLength(111);
        expect(values[1][0].dic).toBe(dicEntries[101].word);
    });
});

function basicReadTests() {
    const readerTests = ['da_DK', 'nl', 'Portuguese (Brazilian)', 'en_US'];

    readerTests.forEach((hunDic: string) => {
        describe(`HunspellReader ${hunDic}`, function () {
            // We are reading big files, so we need to give it some time.
            jest.setTimeout(10000);
            const aff = __dirname + `/../dictionaries/${hunDic}.aff`;
            const dic = __dirname + `/../dictionaries/${hunDic}.dic`;

            const pReader = IterableHunspellReader.createFromFiles(aff, dic);

            it('reads words with info', async () => {
                const reader = await pReader;
                const values = reader.seqWords().skip(200).take(200).toArray();
                expect(values.length).toBe(200);
            });
        });
    });
}

describe('Validated loading all dictionaries in the `dictionaries` directory.', () => {
    const dictionaries = fs
        .readdirSync(DICTIONARY_LOCATIONS)
        .filter((dic) => !!dic.match(/\.aff$/))
        .map((base) => path.join(DICTIONARY_LOCATIONS, base));
    it('Make sure we found some sample dictionaries', () => {
        expect(dictionaries.length).toBeGreaterThan(4);
    });

    dictionaries.forEach((dicAff) => {
        const dicDic = dicAff.replace(/\.aff$/, '.dic');
        it(`Ensure we can load aff ${path.basename(dicAff)}`, async () => {
            const aff = await AffReader.parseAffFile(dicAff);
            expect(aff.PFX).toBeInstanceOf(Map);
            expect(aff.SFX).toBeInstanceOf(Map);
        });

        it(`Ensure we can load the dictionary ${path.basename(dicDic)}`, async () => {
            const reader = await IterableHunspellReader.createFromFiles(dicAff, dicDic);
            const sample = reader.seqWords().take(100).toArray();
            expect(sample).toHaveLength(100);
        });
    });
});

function textToArray(text: string) {
    return text
        .split('\n')
        .filter((a) => !!a)
        .slice(1);
}

function getSimpleAff() {
    // cspell:ignore esianrtolcdugmphbyfvkwzESIANRTOLCDUGMPHBYFVKWZ
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

SFX Y Y 2
SFX Y   0     ly         [^y]
SFX Y   y     ily        [y]

SFX G Y 2
SFX G   e     ing        e
SFX G   0     ing        [^e]

SFX J Y 2
SFX J   e     ing/S      e
SFX J   0     ing/S      [^e]

SFX S Y 4
SFX S   y     ies        [^aeiou]y
SFX S   0     s          [aeiou]y
SFX S   0     es         [sxzh]
SFX S   0     s          [^sxzhy]

`;

    return new Aff.Aff(AffReader.parseAff(sampleAff));
}

const simpleWords = `
2
happy/UY
ring/AUJ
`;

// cspell:ignore moderne avoir huis pannenkoek ababillar CDSG ings AUGJ aeiou sxzh sxzhy
// cspell:words COMPOUNDMIN ONLYINCOMPOUND COMPOUNDRULE WORDCHARS
