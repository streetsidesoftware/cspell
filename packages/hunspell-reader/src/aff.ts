
import { lineReader } from './fileReader';

export interface Fx {
    type: string;
    id: string;
    combinable: boolean;
    substitutions: Substitutions[];
}

export interface Substitutions {
    match: RegExp;
    remove: string;
    replacement: string;
    pos?: string;
}


export interface Aff {
    encoding: string;
    trySet: string;
    keyboard: string;
    lang: string;

    // # do not offer split words (to prevent splitting up words)
    // NOSPLITSUGS
    noSplitSuggest: boolean;

    // # maximum number of compound suggestions
    // # limit to 1 to prevent nonsense suggestions
    // MAXCPDSUGS
    maxCompoundSuggestions: number;

    // # max difference to be applied for all words (compounds and n-gram suggestions)
    // ONLYMAXDIFF
    isOnlyMaxDiff: boolean;

    // # max difference in chars for n-gram suggestions
    // # 3 limits wild suggestions a lot, but also drops suggestions for words with multiple errors
    // MAXDIFF 3
    maxDiff: number;

    // # avoid wrong spelling of letter words in full uppercase (DVD should be dvd)
    // KEEPCASE Kc
    keepCase: string;

    // # set the flag for warning with confusing words
    // WARN Wn
    warn: string;

    // # force uppercase for some word ends
    // FORCEUCASE Fu
    forceUpperCase: string;

    // # BREAK 0 causes the - to be seen as part of the word,
    // # which is necessary to support the optional - in compounded words
    // BREAK 0
    break: string;

    // # use double chars as flags, for more choice and readability
    // # For readability reasons, use of flags is (mostly) restricted tu Upper-Lowercase combinations
    // FLAG long
    flag: string; // null, long, num

    // # explicitly forbid words
    // FORBIDDENWORD Fw
    forbiddenWord: string;

    // # don't suggest words with extra accents
    // NOSUGGEST NS
    noSuggest: string;
}

function simpleTable(fieldValue, field: string, args: string[]) {
    if (fieldValue === undefined) {
        const [ count, extra ] = args;
        return { count, extra, values: [] };
    } else {
        fieldValue.values.push(args);
    }
    return fieldValue;
}

function tablePfxOrSfx(fieldValue, field: string, args: string[]) {
    if (fieldValue === undefined) {
        fieldValue = { };
    }
    const [ subField, ...subValues ] = args;
    if (fieldValue[subField] === undefined) {
        const [ combinable, count, ...extra ] = subValues;
        fieldValue[subField] = { combinable, count, extra, values: [] };
        return fieldValue;
    }
    const [remove, attach, rule, ...extra] = subValues;
    fieldValue[subField].values.push({ remove, attach, rule, extra });

    return fieldValue;
}



const affTableField = {
    MAP: simpleTable,
    ICONV: simpleTable,
    OCONV: simpleTable,
    REP: simpleTable,
    COMPOUNDRULE: simpleTable,
    CHECKCOMPOUNDPATTERN: simpleTable,
    SFX: tablePfxOrSfx,
    PFX: tablePfxOrSfx,
};


export function parseAffFile(filename: string, encoding: string = 'UTF-8') {
    return parseAff(lineReader(filename, encoding), encoding);
}

export function parseAff(lines: Rx.Observable<string>, encoding: string = 'UTF-8') {
    return lines
        .map(line => line.replace(/^\s*#.*/, ''))
        .filter(line => line.trim() !== '')
        .map(line => line.split(/\s+/))
        .reduce((aff, line) => {
            const [ field, ...args ] = line;
            const fn = affTableField[field];
            if (fn) {
                aff[field] = fn(aff[field], field, args);
            } else {
                aff[field] = args;
            }
            return aff;
        }, {});
}
