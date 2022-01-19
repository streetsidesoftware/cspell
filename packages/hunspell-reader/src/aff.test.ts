import assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Aff, affWordToColoredString, asAffWord, compareAff, filterAff, flagsToString } from './aff';
import type { AffWord } from './affDef';
import * as AffReader from './affReader';
import { parseAffFileToAff } from './affReader';

const isLoggerOn = false;
const DICTIONARY_LOCATIONS = path.join(__dirname, '..', 'dictionaries');
const nlAff = path.join(DICTIONARY_LOCATIONS, 'nl.aff');
const enAff = path.join(DICTIONARY_LOCATIONS, 'en_US.aff');
// const enGbAff = path.join(DICTIONARY_LOCATIONS, 'en_GB.aff');
const esAff = path.join(DICTIONARY_LOCATIONS, 'es_ANY.aff');
const frAff = path.join(DICTIONARY_LOCATIONS, 'fr-moderne.aff');
const huAff = path.join(DICTIONARY_LOCATIONS, 'hu', 'hu.aff');

describe('Basic Aff Validation', () => {
    const pAff = AffReader.parseAff(getSimpleAff());
    it('Reads Simple Aff', async () => {
        const aff = await pAff;
        expect(aff.SET).toBe('UTF-8');
        expect(aff.PFX).toBeInstanceOf(Map);
        expect(aff.SFX).toBeInstanceOf(Map);
    });
    it('Checks the PFX values', async () => {
        const aff = await pAff;
        assert(aff.PFX);
        expect(aff.PFX).toBeInstanceOf(Map);
        expect(aff.PFX.has('X')).toBe(true);
        const fx = aff.PFX.get('X');
        expect(fx).toBeDefined();
    });
    it('Checks the SFX values', async () => {
        const aff = await pAff;
        assert(aff.SFX);
        expect(aff.SFX).toBeInstanceOf(Map);
        expect(aff.SFX.has('J')).toBe(true);
        const fxJ = aff.SFX.get('J');
        expect(fxJ).toBeDefined();
    });

    it('Checks ICONV OCONV', () => {
        const aff = new Aff(AffReader.parseAff(getSampleAffIconvOconv()));
        expect(aff.iConv.convert('abc')).toBe('abc');
        expect(aff.iConv.convert('ABC')).toBe('abc');
        expect(aff.iConv.convert('á Á')).toBe('á á');

        expect(aff.oConv.convert('abc')).toBe('ABC');
        expect(aff.oConv.convert('ABC')).toBe('ABC');
        expect(aff.oConv.convert('á Á')).toBe('Á Á');
    });
});

describe('Test Aff', () => {
    it('tests applying rules for fr `badger/10`', async () => {
        const aff = await parseAffFileToAff(frAff);
        const r = aff.applyRulesToDicEntry('badger/10');
        const w = r.map((affWord) => affWord.word);
        expect(w).toEqual(expect.arrayContaining(['badger']));
        expect(w).toEqual(expect.arrayContaining(['badgeant']));
        logApplyRulesResults(r);
    });

    it('tests applying rules for fr `avoir/180`', async () => {
        const aff = await parseAffFileToAff(frAff);
        const r = aff.applyRulesToDicEntry('avoir/180');
        const w = r.map((affWord) => affWord.word);
        expect(w).toEqual(expect.arrayContaining(['avoir']));
        expect(w).toEqual(expect.arrayContaining(['n’avoir'])); // cspell:ignore n’avoir
        expect(r.map((affW) => affW.word)).toEqual(
            r.map((affW) => aff.oConv.convert(affW.prefix + affW.base + affW.suffix))
        );
        logApplyRulesResults(r);
    });

    it('tests applying rules for fr with maxDepth', async () => {
        const aff = await parseAffFileToAff(frAff);
        aff.maxSuffixDepth = 1;
        const r0 = aff.applyRulesToDicEntry('avoir/180').map((affWord) => affWord.word);
        expect(r0).toEqual(expect.arrayContaining(['avoir']));
        expect(r0).toEqual(expect.not.arrayContaining(['n’avoir'])); // cspell:ignore n’avoir
        aff.maxSuffixDepth = 2;
        const r1 = aff.applyRulesToDicEntry('avoir/180').map((affWord) => affWord.word);
        expect(r1).toEqual(expect.arrayContaining(['avoir']));
        expect(r1).toEqual(expect.arrayContaining(['n’avoir'])); // cspell:ignore n’avoir
        expect(r1).not.toEqual(r0);
        const r2 = aff.applyRulesToDicEntry('avoir/180', 1).map((affWord) => affWord.word);
        expect(r2).toEqual(r0);
    });

    it('test breaking up rules for nl', async () => {
        const aff = await parseAffFileToAff(nlAff);
        expect(aff.separateRules('ZbCcChC1')).toEqual(['Zb', 'Cc', 'Ch', 'C1']);
        expect(aff.separateRules('ZbCcChC199')).toEqual(['Zb', 'Cc', 'Ch', 'C1', '99']);
    });

    it('test breaking up rules for en', async () => {
        const aff = await parseAffFileToAff(enAff);
        expect(aff.separateRules('ZbCcChC1')).not.toEqual(['Zb', 'Cc', 'Ch', 'C1']);
        expect(aff.separateRules('ZbCcChC1')).toEqual('ZbCch1'.split(''));
    });

    it('test getting rules for nl', async () => {
        const aff = await parseAffFileToAff(nlAff);
        // console.log(aff.getMatchingRules('ZbCcChC1'));
        expect(
            aff
                .getMatchingRules('ZbCcChC1')
                .filter((a) => !!a)
                .map(({ id }) => id)
        ).toEqual(['Zb', 'Cc', 'Ch']);
        expect(
            aff
                .getMatchingRules('ZbCcChC199')
                .filter((a) => !!a)
                .map(({ id }) => id)
        ).toEqual(['Zb', 'Cc', 'Ch']);
        expect(
            aff
                .getMatchingRules('AaAbAcAdAeAi')
                .filter((a) => !!a)
                .map(({ id }) => id)
        ).toEqual(['Aa', 'Ab', 'Ac', 'Ad', 'Ae', 'Ai']);
        expect(
            aff
                .getMatchingRules('AaAbAcAdAeAi')
                .filter((a) => !!a)
                .map(({ type }) => type)
        ).toEqual(['sfx', 'sfx', 'sfx', 'sfx', 'sfx', 'sfx']);
        expect(
            aff
                .getMatchingRules('PaPbPc')
                .filter((a) => !!a)
                .map(({ type }) => type)
        ).toEqual(['pfx', 'pfx', 'pfx']);
    });

    it('tests applying rules for nl', async () => {
        const aff = await parseAffFileToAff(nlAff);
        const lines = ['dc/ClCwKc', 'aak/Zf', 'huis/CACcYbCQZhC0', 'pannenkoek/ZbCACcC0'];
        const appliedRules = lines.map((line) => aff.applyRulesToDicEntry(line).map(formatAffWordForSnapshot));
        expect(appliedRules).toMatchSnapshot();
    });

    it('tests applying rules for es', async () => {
        const aff = await parseAffFileToAff(esAff);
        const lines = ['ababillar/RED'];
        const appliedRules = lines.map((line) => aff.applyRulesToDicEntry(line).map(formatAffWordForSnapshot));
        expect(appliedRules).toMatchSnapshot();
    });

    it('tests applying rules for en', async () => {
        const aff = await parseAffFileToAff(enAff);
        const r = aff.applyRulesToDicEntry('motivate/CDSG');
        const w = r.map((affWord) => affWord.word);
        expect(w.sort()).toEqual([
            'demotivate',
            'demotivated',
            'demotivates',
            'demotivating',
            'motivate',
            'motivated',
            'motivates',
            'motivating',
        ]);
    });

    it('tests compareAff', () => {
        expect(compareAff(asAffWord('word'), asAffWord('word'))).toBe(0);
        expect(compareAff(asAffWord('a word'), asAffWord('b word'))).toBe(-1);
        expect(compareAff(asAffWord('b word'), asAffWord('a word'))).toBe(1);
        const affA = asAffWord('word');
        const affB = asAffWord('word');
        affA.flags.isCompoundPermitted = true;
        expect(compareAff(affA, affB)).toBe(1);
        affB.flags.isCompoundPermitted = true;
        expect(compareAff(affA, affB)).toBe(0);
        affB.flags.canBeCompoundBegin = true;
        expect(compareAff(affA, affB)).toBe(1);
    });

    it('test filterAff', () => {
        const fn = filterAff();
        expect(fn(asAffWord('Hello'))).toBe(true);
        expect(fn(asAffWord('Hello'))).toBe(false);
        expect(fn(asAffWord('Hello', '', { canBeCompoundBegin: true }))).toBe(true);
        expect(fn(asAffWord('Hello', '', { canBeCompoundBegin: true }))).toBe(false);
        expect(fn(asAffWord('Hello'))).toBe(true);
        expect(fn(asAffWord('Hello'))).toBe(false);
        expect(fn(asAffWord('There'))).toBe(true);
        expect(fn(asAffWord('There'))).toBe(false);
    });
});

describe('Validated loading all dictionaries in the `dictionaries` directory.', () => {
    function getDictionaries() {
        return fs
            .readdirSync(DICTIONARY_LOCATIONS)
            .filter((dic) => !!dic.match(/\.aff$/))
            .map((base) => path.join(DICTIONARY_LOCATIONS, base));
    }
    const dictionaries = getDictionaries();
    it('Make sure we found some sample dictionaries', () => {
        expect(dictionaries.length).toBeGreaterThan(4);
    });

    dictionaries.forEach((dicAff) => {
        // const dicDic = dicAff.replace(/\.aff$/, '.dic');
        // const dicContent = fs.readFile(dicDic)
        it(`Ensure we can load ${path.basename(dicAff)}`, async () => {
            const aff = await AffReader.parseAffFile(dicAff);
            expect(aff.PFX).toBeInstanceOf(Map);
            expect(aff.SFX).toBeInstanceOf(Map);
        });
    });
});

describe('Validate loading Hungarian', () => {
    const affP = parseAffFileToAff(huAff);

    it('tests applying rules for hu Depth 0', async () => {
        const aff = await affP;
        aff.maxSuffixDepth = 0;
        const r = aff.applyRulesToDicEntry('kemping/17');
        const w = r.map((affWord) => affWord.word);
        expect(w).toEqual(expect.arrayContaining(['kemping']));
        expect(w.length).toBe(1);
    });

    it('tests applying rules for hu Depth 1', async () => {
        const aff = await affP;
        aff.maxSuffixDepth = 1;
        const r = aff.applyRulesToDicEntry('kemping/17');
        const w = r.map((affWord) => affWord.word);
        expect(w).toEqual(expect.arrayContaining(['kemping']));
        expect(w.length).toBeGreaterThan(1);
    });
});

function formatAffWordForSnapshot(affWord: AffWord): string {
    const { dic, base, rulesApplied, word, suffix, prefix, flags } = affWord;
    const f = flagsToString(flags);
    return `${dic} -> ${base} (${rulesApplied.trim()}) [${prefix}|${suffix}] --> '${word}${f ? '/' + f : ''}'`;
}

function logApplyRulesResults(affWords: AffWord[]) {
    affWords.forEach(logApplyRulesResult);
}

function logApplyRulesResult(affWord: AffWord) {
    if (isLoggerOn) console.log(affWordToColoredString(affWord));
}

function getSimpleAff() {
    // cspell:ignore esianrtolcdugmphbyfvkwzESIANRTOLCDUGMPHBYFVKWZ
    return `
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
    SFX J   e     ings       e
    SFX J   0     ings       [^e]
    `;
}

function getSampleAffIconvOconv() {
    return `
# input output conversion
SET UTF-8

OCONV 7
OCONV a A
OCONV á Á
OCONV b B
OCONV c C
OCONV d D
OCONV e E
OCONV é É

ICONV 7
ICONV A a
ICONV Á á
ICONV B b
ICONV C c
ICONV D d
ICONV E e
ICONV É é

    `;
}

// cspell:ignore moderne avoir huis pannenkoek ababillar CDSG ings
// cspell:enableCompoundWords
