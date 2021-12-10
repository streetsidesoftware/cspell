import { AffInfo, Aff, Fx, SubstitutionSet } from './aff';
import { readFile } from 'fs-extra';
import { decode } from 'iconv-lite';

const fixRegex = {
    SFX: { m: /$/, r: '$' },
    PFX: { m: /^/, r: '^' },
};

const yesRegex = /[yY]/;
const spaceRegex = /\s+/;
const commentRegex = /(?:^\s*#.*)|(?:\s+#.*)/;
const affixLine = /^\s*([^\s]+)\s+(.*)?$/;

const UTF8 = 'UTF-8';

export interface ConvEntry {
    from: string;
    to: string;
}
function convEntry(fieldValue: ConvEntry[] | undefined, line: AffLine) {
    if (fieldValue === undefined) {
        return [];
    }

    const args = (line.value || '').split(spaceRegex);
    fieldValue.push({ from: args[0], to: args[1] });
    return fieldValue;
}

function afEntry(fieldValue: string[] | undefined, line: AffLine) {
    if (fieldValue === undefined) {
        return [''];
    }
    if (line.value) {
        fieldValue.push(line.value);
    }
    return fieldValue;
}

function simpleTable(fieldValue, line: AffLine) {
    const args = (line.value || '').split(spaceRegex);
    if (fieldValue === undefined) {
        const [count, ...extraValues] = args;
        const extra = extraValues.length ? extraValues : undefined;
        return { count, extra, values: [] };
    }

    fieldValue.values.push(args);
    return fieldValue;
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

    const fixRuleSet = fieldValue.get(subField)!;
    const substitutionSets = fixRuleSet.substitutionSets;
    const ruleAsString = rule.condition.source;
    if (!substitutionSets.has(ruleAsString)) {
        substitutionSets.set(ruleAsString, {
            match: rule.condition,
            substitutions: [],
        });
    }
    const substitutionSet = substitutionSets.get(ruleAsString)!;
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

function asPfx(fieldValue: Afx | undefined, line: AffLine): Afx {
    return tablePfxOrSfx(fieldValue, line);
}

function asSfx(fieldValue: Afx | undefined, line: AffLine): Afx {
    return tablePfxOrSfx(fieldValue, line);
}

function asString(_fieldValue, line: AffLine) {
    return line.value || '';
}

function asBoolean(_fieldValue, line: AffLine) {
    const { value = '1' } = line;
    const iValue = parseInt(value);
    return !!iValue;
}

function asNumber(_fieldValue, line: AffLine) {
    const { value = '0' } = line;
    return parseInt(value);
}

type FieldFunction<T> = (value: T | undefined, line: AffLine) => T;
type FieldFunctions =
    | FieldFunction<string>
    | FieldFunction<boolean>
    | FieldFunction<number>
    | FieldFunction<Afx>
    | FieldFunction<string[]>
    | FieldFunction<ConvEntry[]>;

interface AffFieldFunctionTable {
    [key: string]: FieldFunctions;
}

/*
cspell:ignore COMPOUNDBEGIN COMPOUNDEND COMPOUNDMIDDLE COMPOUNDMIN COMPOUNDPERMITFLAG COMPOUNDRULE COMPOUNDFORBIDFLAG COMPOUNDFLAG
cspell:ignore FORBIDDENWORD KEEPCASE
cspell:ignore MAXDIFF NEEDAFFIX WORDCHARS
*/

// prettier-ignore
const affTableField: AffFieldFunctionTable = {
    AF                  : afEntry,
    BREAK               : asNumber,
    CHECKCOMPOUNDCASE   : asBoolean,
    CHECKCOMPOUNDDUP    : asBoolean,
    CHECKCOMPOUNDPATTERN: simpleTable,
    CHECKCOMPOUNDREP    : asBoolean,
    COMPOUNDBEGIN       : asString,
    COMPOUNDEND         : asString,
    COMPOUNDMIDDLE      : asString,
    COMPOUNDMIN         : asNumber,
    COMPOUNDFLAG        : asString,
    COMPOUNDPERMITFLAG  : asString,
    COMPOUNDFORBIDFLAG  : asString,
    COMPOUNDRULE        : simpleTable,
    FLAG                : asString, // 'long' | 'num'
    FORBIDDENWORD       : asString,
    FORCEUCASE          : asString,
    ICONV               : convEntry,
    KEEPCASE            : asString,
    KEY                 : asString,
    MAP                 : simpleTable,
    MAXCPDSUGS          : asNumber,
    MAXDIFF             : asNumber,
    NEEDAFFIX           : asString,
    NOSPLITSUGS         : asBoolean,
    NOSUGGEST           : asString,
    OCONV               : convEntry,
    ONLYINCOMPOUND      : asString,
    ONLYMAXDIFF         : asBoolean,
    PFX                 : asPfx,
    REP                 : simpleTable,
    SET                 : asString,
    SFX                 : asSfx,
    TRY                 : asString,
    WARN                : asString,
    WORDCHARS           : asString,
};

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
    return lines
        .map((line) => line.trimLeft())
        .map((line) => line.replace(commentRegex, ''))
        .filter((line) => line.trim() !== '')
        .map(parseLine)
        .reduce(
            (aff: AffInfo, line: AffLine) => {
                const field = line.option;
                const fn = affTableField[field];
                if (fn) {
                    aff[field] = fn(aff[field], line);
                } else {
                    aff[field] = line.value;
                }
                return aff;
            },
            { SET: encoding } as AffInfo
        );
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
