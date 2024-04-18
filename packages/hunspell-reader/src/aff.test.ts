import assert from 'node:assert';
import { readdirSync } from 'node:fs';
import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

import type { AffixWord } from './aff.js';
import { Aff, AffixFlags } from './aff.js';
import { flagToLongStringMap } from './affConstants.js';
import { parseAff, parseAffFile } from './affReader.js';

const DICTIONARY_LOCATIONS = path.join(__dirname, '..', 'dictionaries');
const nlAff = path.join(DICTIONARY_LOCATIONS, 'nl.aff');
const enAff = path.join(DICTIONARY_LOCATIONS, 'en_US.aff');
// const enGbAff = path.join(DICTIONARY_LOCATIONS, 'en_GB.aff');
const esAff = path.join(DICTIONARY_LOCATIONS, 'es_ANY.aff');
const frAff = path.join(DICTIONARY_LOCATIONS, 'fr-moderne.aff');
const huAff = path.join(DICTIONARY_LOCATIONS, 'hu/hu.aff');
const huHuAff = path.join(DICTIONARY_LOCATIONS, 'hu_hu/hu_HU.aff');
const basqueAff = path.join(DICTIONARY_LOCATIONS, 'eu/eu.aff');

describe('Basic Aff Validation', () => {
    const pAff = parseAff(getSimpleAff());
    it('Reads Simple Aff', () => {
        const aff = pAff;
        expect(aff.SET).toBe('UTF-8');
        expect(aff.PFX).toBeInstanceOf(Map);
        expect(aff.SFX).toBeInstanceOf(Map);
    });
    it('Checks the PFX values', () => {
        const aff = pAff;
        assert(aff.PFX);
        expect(aff.PFX).toBeInstanceOf(Map);
        expect(aff.PFX.has('X')).toBe(true);
        const fx = aff.PFX.get('X');
        expect(fx).toBeDefined();
    });
    it('Checks the SFX values', () => {
        const aff = pAff;
        assert(aff.SFX);
        expect(aff.SFX).toBeInstanceOf(Map);
        expect(aff.SFX.has('J')).toBe(true);
        const fxJ = aff.SFX.get('J');
        expect(fxJ).toBeDefined();
    });

    it('Checks ICONV OCONV', () => {
        const aff = new Aff(parseAff(getSampleAffIconvOconv()), 'sampleAff');
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
    });

    it('tests applying rules for fr `avoir/180`', async () => {
        const aff = await parseAffFileToAff(frAff);
        const r = aff.applyRulesToDicEntry('avoir/180');
        const w = r.map((affWord) => affWord.word);
        expect(w).toEqual(expect.arrayContaining(['avoir']));
        expect(w).toEqual(expect.arrayContaining(['n’avoir'])); // cspell:ignore n’avoir
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

    it('test getting rules for nl', async () => {
        const aff = await parseAffFileToAff(nlAff);
        // console.log(aff.getMatchingRules('ZbCcChC1'));
        expect(
            aff
                .getMatchingRules('ZbCcChC1')
                .filter((a) => !!a)
                .map(({ id }) => id),
        ).toEqual(['Zb', 'Cc', 'Ch']);
        expect(
            aff
                .getMatchingRules('ZbCcChC199')
                .filter((a) => !!a)
                .map(({ id }) => id),
        ).toEqual(['Zb', 'Cc', 'Ch']);
        expect(
            aff
                .getMatchingRules('AaAbAcAdAeAi')
                .filter((a) => !!a)
                .map(({ id }) => id),
        ).toEqual(['Aa', 'Ab', 'Ac', 'Ad', 'Ae', 'Ai']);
        expect(
            aff
                .getMatchingRules('AaAbAcAdAeAi')
                .filter((a) => !!a)
                .map(({ type }) => type),
        ).toEqual(['S', 'S', 'S', 'S', 'S', 'S']);
        expect(
            aff
                .getMatchingRules('PaPbPc')
                .filter((a) => !!a)
                .map(({ type }) => type),
        ).toEqual(['P', 'P', 'P']);
    });

    it('tests applying rules for nl huis', async () => {
        const aff = await parseAffFileToAff(nlAff, true);
        const line = 'huis/CACcYbCQZhC0';
        const appliedRules = aff.applyRulesToDicEntry(line).map((affWord) => formatAffWordForSnapshot(aff, affWord));
        expect(appliedRules).toMatchSnapshot();
    });

    it('tests applying rules for nl', async () => {
        const aff = await parseAffFileToAff(nlAff, true);
        aff.setTraceMode(true);
        const lines = ['dc/ClCwKc', 'aak/Zf', 'huis/CACcYbCQZhC0', 'pannenkoek/ZbCACcC0'];
        const appliedRules = lines.map((line) =>
            aff.applyRulesToDicEntry(line).map((affWord) => formatAffWordForSnapshot(aff, affWord)),
        );
        expect(appliedRules).toMatchSnapshot();
    });

    it('tests applying rules for es', async () => {
        const aff = await parseAffFileToAff(esAff, true);
        const lines = ['ababillar/RED'];
        const appliedRules = lines.map((line) =>
            aff.applyRulesToDicEntry(line).map((affWord) => formatAffWordForSnapshot(aff, affWord)),
        );
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
});

describe('Validated loading all dictionaries in the `dictionaries` directory.', () => {
    function getDictionaries() {
        return readdirSync(DICTIONARY_LOCATIONS)
            .filter((dic) => !!/\.aff$/.test(dic))
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
            const affInfo = await parseAffFile(dicAff);
            expect(affInfo.PFX).toBeInstanceOf(Map);
            expect(affInfo.SFX).toBeInstanceOf(Map);
            const aff = new Aff(affInfo, dicAff);
            expect(aff).toBeDefined();
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

describe('Hungarian Performance', async () => {
    const aff = await parseAffFileToAff(huHuAff);

    it('applyRulesToDicEntry', async () => {
        /* cspell:disable-next-line */
        const r = aff.applyRulesToDicEntry('öntőműhely/VËŻj×LÓnňéyČŔŕTtYcź', 1);
        const w = r.map((affWord) => affWord.word);
        // console.log('applyRulesToDicEntry %o', w);
        expect(w).toBeDefined();
    });
});

describe('Basque Performance', async () => {
    const aff = await parseAffFileToAff(basqueAff);

    it('applyRulesToDicEntry', async () => {
        /* cspell:disable-next-line */
        const r = aff.applyRulesToDicEntry('farsiera/11,1', 3);
        const w = r.map((affWord) => affWord.word);
        // console.log('applyRulesToDicEntry %o', w);
        expect(w).toBeDefined();
    });
});

function formatAffWordForSnapshot(aff: Aff, affWord: AffixWord): string {
    const { word, flags } = affWord;
    const f = flagsToString(flags);
    const appliedRules = aff.getFlagsValuesForAffixWord(affWord);
    const extra = appliedRules?.length ? ` Rules: ${appliedRules} line: ${affWord.dict.line}` : '';
    return `'${word}${f ? '/' + f : ''}'${extra}`;
}

function flagsToString(flags: AffixFlags): string {
    const parts: string[] = [];
    if (flags & AffixFlags.canBeCompoundBegin) parts.push(AffixFlags[AffixFlags.canBeCompoundBegin]);
    if (flags & AffixFlags.canBeCompoundEnd) parts.push(AffixFlags[AffixFlags.canBeCompoundEnd]);
    if (flags & AffixFlags.canBeCompoundMiddle) parts.push(AffixFlags[AffixFlags.canBeCompoundMiddle]);
    if (flags & AffixFlags.isCompoundForbidden) parts.push(AffixFlags[AffixFlags.isCompoundForbidden]);
    if (flags & AffixFlags.isCompoundPermitted) parts.push(AffixFlags[AffixFlags.isCompoundPermitted]);
    if (flags & AffixFlags.isForbiddenWord) parts.push(AffixFlags[AffixFlags.isForbiddenWord]);
    if (flags & AffixFlags.isForceUCase) parts.push(AffixFlags[AffixFlags.isForceUCase]);
    if (flags & AffixFlags.isKeepCase) parts.push(AffixFlags[AffixFlags.isKeepCase]);
    if (flags & AffixFlags.isNeedAffix) parts.push(AffixFlags[AffixFlags.isNeedAffix]);
    if (flags & AffixFlags.isNoSuggest) parts.push(AffixFlags[AffixFlags.isNoSuggest]);
    if (flags & AffixFlags.isOnlyAllowedInCompound) parts.push(AffixFlags[AffixFlags.isOnlyAllowedInCompound]);
    if (flags & AffixFlags.isWarning) parts.push(AffixFlags[AffixFlags.isWarning]);
    return parts.map((f) => flagToLongStringMap[f] || f).join(':');
}

async function parseAffFileToAff(affFile: string, trace = false) {
    const affInfo = await parseAffFile(affFile);
    const aff = new Aff(affInfo, affFile);
    aff.setTraceMode(trace);
    return aff;
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
