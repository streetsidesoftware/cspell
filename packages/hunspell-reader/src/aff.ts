
import { lineReader } from './fileReader';

export interface Fx {
    type: string;
    id: string;
    combinable: boolean;
    substitutions: Substitutions[];
}

export interface Dictionary<T>{
    [index: string]: T;
}

export interface Substitutions {
    rule: RegExp;
    remove: string;
    attach: string;
    extra: string[];
}

export interface Rep {
    match: RegExp;
    replaceWith: string;
}

export interface Conv {
    from: string;
    to: string;
}

export interface Aff {
    SET?: string;
    TRY?: string;
    KEY?: string;
    WORDCHARS?: string;
    NOSPLITSUGS?: boolean;
    MAXCPDSUGS?: number;
    ONLYMAXDIFF?: boolean;
    MAXDIFF?: number;
    KEEPCASE?: string;
    WARN?: string;
    FORCEUCASE?: string;
    BREAK?: number;
    FLAG?: string;  // 'long' | 'num'
    FORBIDDENWORD?: string;
    NOSUGGEST?: string;
    MAP?: string[];
    ICONV?: Conv[];
    OCONV?: Conv[];
    REP?: Rep[];
    COMPOUNDMIN?: number;
    COMPOUNDRULE?: string[];
    CHECKCOMPOUNDCASE?: boolean;
    COMPOUNDBEGIN?: string;
    COMPOUNDMIDDLE?: string;
    COMPOUNDEND?: string;
    COMPOUNDPERMITFLAG?: string;
    ONLYINCOMPOUND?: string;
    CHECKCOMPOUNDDUP?: boolean;
    CHECKCOMPOUNDREP?: boolean;
    CHECKCOMPOUNDPATTERN?: string[][];
    PFX?: Dictionary<Fx>;
    SFX?: Dictionary<Fx>;
}

function simpleTable(fieldValue, field: string, args: string[]) {
    if (fieldValue === undefined) {
        const [ count, ...extraValues ] = args;
        const extra = extraValues.length ? extraValues : undefined;
        return { count, extra, values: [] };
    } else {
        fieldValue.values.push(args);
    }
    return fieldValue;
}

function tablePfxOrSfx(fieldValue, field: string, args: string[], type: string) {
    if (fieldValue === undefined) {
        fieldValue = { };
    }
    const [ subField, ...subValues ] = args;
    if (fieldValue[subField] === undefined) {
        const id = subField;
        const [ combinable, count, ...extra ] = subValues;
        fieldValue[subField] = { id, type, combinable, count, extra, substitutions: [] };
        return fieldValue;
    }
    const [removeValue, attach, ruleAsString = '.', ...extraValues] = subValues;
    const extra = extraValues.length ? extraValues : undefined;
    const remove = removeValue.replace('0', '');
    const ruleRegExp = type === 'PFX' ? '^' + ruleAsString : ruleAsString + '$';
    const rule = new RegExp(ruleRegExp);
    fieldValue[subField].substitutions.push({ remove, attach, rule, extra });

    return fieldValue;
}

function asPfx(fieldValue, field: string, args: string[]) {
    return tablePfxOrSfx(fieldValue, field, args, 'PFX');
}

function asSfx(fieldValue, field: string, args: string[]) {
    return tablePfxOrSfx(fieldValue, field, args, 'SFX');
}

function asString(fieldValue, field: string, args: string[]) {
    return args[0];
}

function asBoolean(fieldValue, field: string, args: string[]) {
    const [ value = '1' ] = args;
    const iValue = parseInt(value);
    return !!iValue;
}

function asNumber(fieldValue, field: string, args: string[]) {
    const [ value = '0' ] = args;
    return parseInt(value);
}

const affTableField = {
    BREAK: asNumber,
    CHECKCOMPOUNDCASE: asBoolean,
    CHECKCOMPOUNDDUP: asBoolean,
    CHECKCOMPOUNDPATTERN: simpleTable,
    CHECKCOMPOUNDREP: asBoolean,
    COMPOUNDBEGIN: asString,
    COMPOUNDEND: asString,
    COMPOUNDMIDDLE: asString,
    COMPOUNDMIN: asNumber,
    COMPOUNDPERMITFLAG: asString,
    COMPOUNDRULE: simpleTable,
    FLAG: asString,  // 'long' | 'num'
    FORBIDDENWORD: asString,
    FORCEUCASE: asString,
    ICONV: simpleTable,
    KEEPCASE: asString,
    KEY: asString,
    MAP: simpleTable,
    MAXCPDSUGS: asNumber,
    MAXDIFF: asNumber,
    NOSPLITSUGS: asBoolean,
    NOSUGGEST: asString,
    OCONV: simpleTable,
    ONLYINCOMPOUND: asString,
    ONLYMAXDIFF: asBoolean,
    PFX: asPfx,
    REP: simpleTable,
    SET: asString,
    SFX: asSfx,
    TRY: asString,
    WARN: asString,
    WORDCHARS: asString,
};


export function parseAffFile(filename: string, encoding: string = 'UTF-8') {
    return parseAff(lineReader(filename, encoding), encoding);
}

export function parseAff(lines: Rx.Observable<string>, encoding: string = 'UTF-8') {
    return lines
        .map(line => line.replace(/^\s*#.*/, ''))
        .map(line => line.replace(/\s+#.*/, ''))
        .filter(line => line.trim() !== '')
        .map(line => line.split(/\s+/))
        .reduce<Aff>((aff, line): Aff => {
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
