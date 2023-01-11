import assert from 'assert';
import { readFile } from 'fs-extra';
import { decode } from 'iconv-lite';

import { Aff } from './aff';
import type { AffInfo, Fx, Rep, SubstitutionSet } from './affDef';
import { cleanObject, isDefined } from './util';

const fixRegex = {
    SFX: { m: /$/, r: '$' },
    PFX: { m: /^/, r: '^' },
};

const yesRegex = /[yY]/;
const spaceRegex = /\s+/;
const commentRegex = /(?:^\s*#.*)|(?:\s+#.*)/;
const affixLine = /^\s*([^\s]+)\s+(.*)?$/;

const UTF8 = 'UTF-8';

interface Collector<T> {
    addLine(line: AffLine): void;
    getValue(): T | undefined;
}

export interface ConvEntry {
    from: string;
    to: string;
}

function convEntry(): Collector<ConvEntry[]> {
    let fieldValue: ConvEntry[] | undefined;

    return {
        addLine: (line: AffLine) => {
            if (fieldValue === undefined) {
                fieldValue = [];
                return;
            }
            const args = (line.value || '').split(spaceRegex);
            fieldValue.push({ from: args[0], to: args[1] });
        },
        getValue: () => fieldValue,
    };
}

function afEntry() {
    let fieldValue: string[] | undefined;

    return {
        addLine: (line: AffLine) => {
            if (fieldValue === undefined) {
                // Add empty entry because rules start at 1
                fieldValue = [''];
                return;
            }
            if (line.value) {
                fieldValue.push(line.value);
            }
        },
        getValue: () => fieldValue,
    };
}

function simpleTable<T>(map: (values: string[][]) => T) {
    let data:
        | {
              count: string;
              extra: string[] | undefined;
              values: string[][];
          }
        | undefined;

    function getValue() {
        if (data?.values) return map(data.values);
        return undefined;
    }

    function addLine(line: AffLine): void {
        const args = (line.value || '').split(spaceRegex);
        if (data === undefined) {
            const [count, ...extraValues] = args;
            const extra = extraValues.length ? extraValues : undefined;
            const values: string[][] = [];
            data = { count, extra, values };
            return;
        }

        data.values.push(args);
    }

    return { addLine, getValue };
}

function tablePfxOrSfx(fieldValue: Afx | undefined, line: AffLine): Afx {
    /*
    Fields of an affix rules:
    (0) Option name
    (1) Flag
    (2) stripping characters from beginning (at prefix rules) or end (at suffix rules) of the word
    (3) affix (optionally with flags of continuation classes, separated by a slash)
    (4) condition.
        Zero stripping or affix are indicated by zero. Zero condition is indicated by dot.
        Condition is a simplified, regular expression-like pattern, which must be met before the affix can be applied.
        (Dot signs an arbitrary character. Characters in braces sign an arbitrary character from the character subset.
        Dash hasn't got special meaning, but circumflex (^) next the first brace sets the complimenter character set.)
    (5) Optional morphological fields separated by spaces or tabulators.
     */
    if (fieldValue === undefined) {
        fieldValue = new Map<string, Fx>();
    }
    const [subField] = (line.value || '').split(spaceRegex);
    if (!fieldValue.has(subField)) {
        const fx = parseAffixCreation(line);
        fieldValue.set(fx.id, fx);
        return fieldValue;
    }
    const rule = parseAffixRule(line);
    if (!rule) {
        console.log(`Affix rule missing values: ${line.option} ${line.value}`);
        return fieldValue;
    }

    const fixRuleSet = fieldValue.get(subField);
    assert(fixRuleSet);
    const substitutionSets = fixRuleSet.substitutionSets;
    const ruleAsString = rule.condition.source;
    if (!substitutionSets.has(ruleAsString)) {
        substitutionSets.set(ruleAsString, {
            match: rule.condition,
            substitutions: [],
        });
    }
    const substitutionSet = substitutionSets.get(ruleAsString);
    assert(substitutionSet);
    const [attachText, attachRules] = rule.affix.split('/', 2);
    substitutionSet.substitutions.push({
        remove: rule.stripping,
        replace: rule.replace,
        attach: attachText,
        attachRules,
        extra: rule.extra,
    });

    return fieldValue;
}

/**
 * Parse Affix creation line:
 * `PFX|SFX flag cross_product number`
 */
function parseAffixCreation(line: AffLine): Fx {
    const [flag, combinable, count, ...extra] = (line.value || '').split(spaceRegex);
    const fx: Fx = {
        id: flag,
        type: line.option,
        combinable: !!combinable.match(yesRegex),
        count,
        extra,
        substitutionSets: new Map<string, SubstitutionSet>(),
    };
    return fx;
}

interface AffixRule {
    type: 'PFX' | 'SFX';
    flag: string;
    stripping: string;
    replace: RegExp;
    affix: string;
    condition: RegExp;
    extra?: string;
}

const affixRuleRegEx = /^(\S+)\s+(\S+)\s+(\S+)\s*(.*)/;
const affixRuleConditionRegEx = /^((?:\[.*\]|\S+)+)\s*(.*)/;

/**
 * `PFX|SFX flag stripping prefix [condition [morphological_fields...]]`
 */
function parseAffixRule(line: AffLine): AffixRule | undefined {
    const [, flag, strip, affix, optional = ''] = (line.value || '').match(affixRuleRegEx) || [];
    if (!flag || !strip || !affix) {
        return undefined;
    }
    const [, rawCondition = '.', extra] = optional.match(affixRuleConditionRegEx) || [];

    const type = line.option === 'SFX' ? 'SFX' : 'PFX';
    const condition = fixMatch(type, rawCondition);

    const affixRule: AffixRule = {
        type,
        flag,
        stripping: strip,
        replace: fixMatch(type, strip),
        affix: cleanAffixAttach(affix),
        condition,
        extra,
    };
    return affixRule;
}

function cleanAffixAttach(affix: string): string {
    const [fix, rules] = affix.split('/', 2);

    const attach = fix === '0' ? '' : fix;
    return attach + (rules ? '/' + rules : '');
}

function fixMatch(type: AffixRule['type'], match: string): RegExp {
    const exp = affixMatchToRegExpString(match);
    const fix = fixRegex[type];
    return new RegExp(exp.replace(fix.m, fix.r));
}

function affixMatchToRegExpString(match: string): string {
    if (match === '0') return '';
    return match.replace(/([\\\-?*])/g, '\\$1');
}

function collectFx(): Collector<Afx> {
    let value: Afx | undefined;
    function addLine(line: AffLine) {
        value = tablePfxOrSfx(value, line);
    }
    return {
        addLine,
        getValue: () => value,
    };
}

const asPfx = collectFx;
const asSfx = collectFx;

const asString = () => collectPrimitive<string>((v) => v, '');
const asBoolean = () => collectPrimitive<boolean>((v) => !!parseInt(v), '1');
const asNumber = () => collectPrimitive<number>(parseInt, '0');

function collectPrimitive<T>(map: (line: string) => T, defaultValue = ''): Collector<T> {
    let primitive: T | undefined;

    function getValue() {
        return primitive;
    }

    function addLine(line: AffLine) {
        const { value = defaultValue } = line;
        primitive = map(value);
    }

    return { addLine, getValue };
}

function toRep(values: string[][]): Rep[] {
    return values.map((v) => ({ match: v[0], replaceWith: v[1] }));
}

function toSingleStrings(values: string[][]): string[] {
    return values.map((v) => v[0]).filter(isDefined);
}

function toAffMap(values: string[][]): Exclude<AffInfo['MAP'], undefined> {
    return toSingleStrings(values);
}

function toCompoundRule(values: string[][]): Exclude<AffInfo['COMPOUNDRULE'], undefined> {
    return toSingleStrings(values);
}

function toCheckCompoundPattern(values: string[][]): Exclude<AffInfo['CHECKCOMPOUNDPATTERN'], undefined> {
    return values;
}

type FieldCollector<T> = Collector<T>;

type AffFieldCollectorTable = {
    [key in keyof AffInfo]-?: FieldCollector<Exclude<AffInfo[key], undefined>>;
};

/*
cspell:ignore COMPOUNDBEGIN COMPOUNDEND COMPOUNDMIDDLE COMPOUNDMIN COMPOUNDPERMITFLAG COMPOUNDRULE COMPOUNDFORBIDFLAG COMPOUNDFLAG
cspell:ignore FORBIDDENWORD KEEPCASE
cspell:ignore MAXDIFF NEEDAFFIX WORDCHARS
*/

// prettier-ignore
const createAffFieldTable: () => AffFieldCollectorTable = () => ({
    AF                  : afEntry(),
    BREAK               : simpleTable(toSingleStrings),
    CHECKCOMPOUNDCASE   : asBoolean(),
    CHECKCOMPOUNDDUP    : asBoolean(),
    CHECKCOMPOUNDPATTERN: simpleTable(toCheckCompoundPattern),
    CHECKCOMPOUNDREP    : asBoolean(),
    COMPOUNDBEGIN       : asString(),
    COMPOUNDEND         : asString(),
    COMPOUNDMIDDLE      : asString(),
    COMPOUNDMIN         : asNumber(),
    COMPOUNDFLAG        : asString(),
    COMPOUNDPERMITFLAG  : asString(),
    COMPOUNDFORBIDFLAG  : asString(),
    COMPOUNDRULE        : simpleTable(toCompoundRule),
    FLAG                : asString(), // 'long' | 'num'
    FORBIDDENWORD       : asString(),
    FORCEUCASE          : asString(),
    ICONV               : convEntry(),
    KEEPCASE            : asString(),
    KEY                 : asString(),
    MAP                 : simpleTable(toAffMap),
    MAXCPDSUGS          : asNumber(),
    MAXDIFF             : asNumber(),
    NEEDAFFIX           : asString(),
    NOSPLITSUGS         : asBoolean(),
    NOSUGGEST           : asString(),
    OCONV               : convEntry(),
    ONLYINCOMPOUND      : asString(),
    ONLYMAXDIFF         : asBoolean(),
    PFX                 : asPfx(),
    REP                 : simpleTable(toRep),
    SET                 : asString(),
    SFX                 : asSfx(),
    TRY                 : asString(),
    WARN                : asString(),
    WORDCHARS           : asString(),
});

function collectionToAffInfo(affFieldCollectionTable: AffFieldCollectorTable, encoding: string): AffInfo {
    type AffInfoKeys = keyof AffInfo;
    type ParseResult = {
        [key in AffInfoKeys]: AffInfo[key];
    };

    // prettier-ignore
    const result: ParseResult = {
        AF                  : affFieldCollectionTable.AF.getValue(),
        BREAK               : affFieldCollectionTable.BREAK.getValue(),
        CHECKCOMPOUNDCASE   : affFieldCollectionTable.CHECKCOMPOUNDCASE.getValue(),
        CHECKCOMPOUNDDUP    : affFieldCollectionTable.CHECKCOMPOUNDDUP.getValue(),
        CHECKCOMPOUNDPATTERN: affFieldCollectionTable.CHECKCOMPOUNDPATTERN.getValue(),
        CHECKCOMPOUNDREP    : affFieldCollectionTable.CHECKCOMPOUNDREP.getValue(),
        COMPOUNDBEGIN       : affFieldCollectionTable.COMPOUNDBEGIN.getValue(),
        COMPOUNDEND         : affFieldCollectionTable.COMPOUNDEND.getValue(),
        COMPOUNDMIDDLE      : affFieldCollectionTable.COMPOUNDMIDDLE.getValue(),
        COMPOUNDMIN         : affFieldCollectionTable.COMPOUNDMIN.getValue(),
        COMPOUNDFLAG        : affFieldCollectionTable.COMPOUNDFLAG.getValue(),
        COMPOUNDPERMITFLAG  : affFieldCollectionTable.COMPOUNDPERMITFLAG.getValue(),
        COMPOUNDFORBIDFLAG  : affFieldCollectionTable.COMPOUNDFORBIDFLAG.getValue(),
        COMPOUNDRULE        : affFieldCollectionTable.COMPOUNDRULE.getValue(),
        FLAG                : affFieldCollectionTable.FLAG.getValue(),
        FORBIDDENWORD       : affFieldCollectionTable.FORBIDDENWORD.getValue(),
        FORCEUCASE          : affFieldCollectionTable.FORCEUCASE.getValue(),
        ICONV               : affFieldCollectionTable.ICONV.getValue(),
        KEEPCASE            : affFieldCollectionTable.KEEPCASE.getValue(),
        KEY                 : affFieldCollectionTable.KEY.getValue(),
        MAP                 : affFieldCollectionTable.MAP.getValue(),
        MAXCPDSUGS          : affFieldCollectionTable.MAXCPDSUGS.getValue(),
        MAXDIFF             : affFieldCollectionTable.MAXDIFF.getValue(),
        NEEDAFFIX           : affFieldCollectionTable.NEEDAFFIX.getValue(),
        NOSPLITSUGS         : affFieldCollectionTable.NOSPLITSUGS.getValue(),
        NOSUGGEST           : affFieldCollectionTable.NOSUGGEST.getValue(),
        OCONV               : affFieldCollectionTable.OCONV.getValue(),
        ONLYINCOMPOUND      : affFieldCollectionTable.ONLYINCOMPOUND.getValue(),
        ONLYMAXDIFF         : affFieldCollectionTable.ONLYMAXDIFF.getValue(),
        PFX                 : affFieldCollectionTable.PFX.getValue(),
        REP                 : affFieldCollectionTable.REP.getValue(),
        SET                 : affFieldCollectionTable.SET.getValue() || encoding,
        SFX                 : affFieldCollectionTable.SFX.getValue(),
        TRY                 : affFieldCollectionTable.TRY.getValue(),
        WARN                : affFieldCollectionTable.WARN.getValue(),
        WORDCHARS           : affFieldCollectionTable.WORDCHARS.getValue(),
    };
    return cleanObject(result);
}

export async function parseAffFile(filename: string, encoding: string = UTF8) {
    const buffer = await readFile(filename);
    const file = decode(buffer, encoding);
    const affInfo = parseAff(file, encoding);
    if (affInfo.SET && affInfo.SET.toLowerCase() !== encoding.toLowerCase()) {
        return parseAff(decode(buffer, affInfo.SET.toLowerCase()), affInfo.SET);
    }
    return affInfo;
}

export function parseAff(affFileContent: string, encoding: string = UTF8): AffInfo {
    const lines = affFileContent.split(/\r?\n/g);
    const affFieldCollectionTable = createAffFieldTable();
    affFieldCollectionTable.SET.addLine({ option: 'SET', value: encoding });
    lines
        .map((line) => line.trimStart())
        .map((line) => line.replace(commentRegex, ''))
        .filter((line) => line.trim() !== '')
        .map(parseLine)
        .forEach((line: AffLine) => {
            const field = line.option as keyof AffInfo;
            affFieldCollectionTable[field]?.addLine(line);
        });
    return collectionToAffInfo(affFieldCollectionTable, encoding);
}

export function parseAffFileToAff(filename: string, encoding?: string) {
    return parseAffFile(filename, encoding).then((affInfo) => new Aff(affInfo));
}

function parseLine(line: string): AffLine {
    const result = line.match(affixLine) || ['', ''];
    const [, option, value] = result;
    return { option, value: value || undefined };
}

export interface AffLine {
    option: string;
    value: string | undefined;
}

type Afx = Map<string, Fx>;

export const testing = {
    parseAffixRule,
    tablePfxOrSfx,
    parseLine,
};
