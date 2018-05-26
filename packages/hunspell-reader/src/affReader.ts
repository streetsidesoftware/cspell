
import { lineReader } from './fileReader';
import { AffInfo, Aff, Fx, SubstitutionSet } from './aff';
import { Observable } from 'rxjs';
import { map, filter, reduce } from 'rxjs/operators';

// cSpell:enableCompoundWords

const fixRegex = {
    'SFX': { m: /$/, r: '$'},
    'PFX': { m: /^/, r: '^'},
};

const emptyZeroRegex = /^0$/;
const yesRegex = /[yY]/;
const spaceRegex = /\s+/;
const commentRegex = /(?:^\s*#.*)|(?:\s+#.*)/;


export interface ConvEntry { from: string; to: string; }
function convEntry(fieldValue: ConvEntry[], _: string, args: string[]) {
    if (fieldValue === undefined) {
        return [];
    }

    fieldValue.push({ from: args[0], to: args[1] });
    return fieldValue;
}

function afEntry(fieldValue: string[], _: string, args: string[]) {
    if (fieldValue === undefined) {
        return [''];
    }

    fieldValue.push(args[0]);
    return fieldValue;
}


function simpleTable(fieldValue, _: string, args: string[]) {
    if (fieldValue === undefined) {
        const [ count, ...extraValues ] = args;
        const extra = extraValues.length ? extraValues : undefined;
        return { count, extra, values: [] };
    }

    fieldValue.values.push(args);
    return fieldValue;
}

const regExpStartsWithPlus = /^\+/;

function tablePfxOrSfx(fieldValue: Map<string, Fx>, _: string, args: string[], type: string) {
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
        Dash hasn't got special meaning, but circumflex (^) next the first brace sets the complementer character set.)
    (5) Optional morphological fields separated by spaces or tabulators.
     */
    const posCondition = 2;

    if (fieldValue === undefined) {
        fieldValue = new Map<string, Fx>();
    }
    const [ subField, ...subValues ] = args;
    if (! fieldValue.has(subField)) {
        const id = subField;
        const [ combinable, count, ...extra ] = subValues;
        fieldValue.set(subField, {
            id,
            type,
            combinable: !!combinable.match(yesRegex),
            count,
            extra,
            substitutionSets: new Map<string, SubstitutionSet>()
        });
        return fieldValue;
    }
    if (subValues.length < 2) {
        console.log(`Affix rule missing values: ${args.join(' ')}`);
        return;
    }
    if (regExpStartsWithPlus.test(subValues[posCondition] || '')) {
        // sometimes the condition is left off, but there are morphological fields
        // so we need to inject a '.'.
        subValues.splice(posCondition, 0, '.');
    }
    const fixRuleSet = fieldValue.get(subField)!;
    const substitutionSets = fixRuleSet.substitutionSets;
    const [removeValue, attach, ruleAsString = '.', ...extraValues] = subValues;
    const [attachText, attachRules] = attach.split('/', 2);
    const extra = extraValues.length ? extraValues : undefined;
    const remove = removeValue.replace(emptyZeroRegex, '');
    const insertText = attachText.replace(emptyZeroRegex, '');
    const fixUp = fixRegex[type];
    const replace = new RegExp(remove.replace(fixUp.m, fixUp.r));
    if (!substitutionSets.has(ruleAsString)) {
        const match = new RegExp(ruleAsString.replace(fixUp.m, fixUp.r));
        substitutionSets.set(ruleAsString, {
            match,
            substitutions: [],
        });
    }
    const substitutionSet = substitutionSets.get(ruleAsString)!;
    substitutionSet.substitutions.push({ remove, replace, attach: insertText, attachRules, extra });

    return fieldValue;
}

function asPfx(fieldValue, field: string, args: string[]) {
    return tablePfxOrSfx(fieldValue, field, args, 'PFX');
}

function asSfx(fieldValue, field: string, args: string[]) {
    return tablePfxOrSfx(fieldValue, field, args, 'SFX');
}

function asString(_fieldValue, _field: string, args: string[]) {
    return args[0];
}

function asBoolean(_fieldValue, _field: string, args: string[]) {
    const [ value = '1' ] = args;
    const iValue = parseInt(value);
    return !!iValue;
}

function asNumber(_fieldValue, _field: string, args: string[]) {
    const [ value = '0' ] = args;
    return parseInt(value);
}

const affTableField = {
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
    COMPOUNDPERMITFLAG  : asString,
    COMPOUNDRULE        : simpleTable,
    FLAG                : asString,  // 'long' | 'num'
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


export function parseAffFile(filename: string, encoding: string = 'UTF-8') {
    return parseAff(lineReader(filename, encoding), encoding)
        .then(affInfo => {
            if (affInfo.SET && affInfo.SET.toLowerCase() !== encoding.toLowerCase()) {
                return parseAff(lineReader(filename, affInfo.SET), affInfo.SET);
            }
            return affInfo;
        });
}

export function parseAff(lines: Observable<string>, _encoding: string = 'UTF-8') {
    return lines.pipe(
        map(line => line.replace(commentRegex, '')),
        filter(line => line.trim() !== ''),
        map(line => line.split(spaceRegex)),
        reduce<string[], AffInfo>((aff, line) => {
            const [ field, ...args ] = line;
            const fn = affTableField[field];
            if (fn) {
                aff[field] = fn(aff[field], field, args);
            } else {
                aff[field] = args;
            }
            return aff;
        }, {})
    ).toPromise();
}

export function parseAffFileToAff(filename: string, encoding?: string) {
    return parseAffFile(filename, encoding)
        .then(affInfo => new Aff(affInfo))
        ;
}

