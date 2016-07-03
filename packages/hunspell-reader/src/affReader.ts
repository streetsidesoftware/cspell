
import { lineReader } from './fileReader';
import { AffInfo, Aff } from './aff';

const fixRegex = {
    'SFX': { m: /$/, r: '$'},
    'PFX': { m: /^/, r: '^'},
};

const emptyZeroRegex = /^0$/;
const yesRegex = /[yY]/;
const spaceRegex = /\s+/;
const commentRegex = /(?:^\s*#.*)|(?:\s+#.*)/;

function convEntry(fieldValue, field: string, args: string[]) {
    if (fieldValue === undefined) {
        return [];
    }

    fieldValue.push({ from: args[0], to: args[1] });
    return fieldValue;
}

function afEntry(fieldValue, field: string, args: string[]) {
    if (fieldValue === undefined) {
        return [''];
    }

    fieldValue.push(args[0]);
    return fieldValue;
}

function simpleTable(fieldValue, field: string, args: string[]) {
    if (fieldValue === undefined) {
        const [ count, ...extraValues ] = args;
        const extra = extraValues.length ? extraValues : undefined;
        return { count, extra, values: [] };
    }

    fieldValue.values.push(args);
    return fieldValue;
}

function tablePfxOrSfx(fieldValue, field: string, args: string[], type: string) {
    if (fieldValue === undefined) {
        fieldValue = Object.create(null);
    }
    const [ subField, ...subValues ] = args;
    if (fieldValue[subField] === undefined) {
        const id = subField;
        const [ combinable, count, ...extra ] = subValues;
        fieldValue[subField] = { id, type, combinable: !!combinable.match(yesRegex), count, extra, substitutions: [] };
        return fieldValue;
    }
    const [removeValue, attach, ruleAsString = '.', ...extraValues] = subValues;
    const [attachText, attachRules] = attach.split('/', 2);
    const extra = extraValues.length ? extraValues : undefined;
    const remove = removeValue.replace(emptyZeroRegex, '');
    const insertText = attachText.replace(emptyZeroRegex, '');
    const fixUp = fixRegex[type];
    const match = new RegExp(ruleAsString.replace(fixUp.m, fixUp.r));
    const replace = new RegExp(remove.replace(fixUp.m, fixUp.r));
    fieldValue[subField].substitutions.push({ match, remove, replace, attach: insertText, attachRules, extra });

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
    AF: afEntry,
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
    ICONV: convEntry,
    KEEPCASE: asString,
    KEY: asString,
    MAP: simpleTable,
    MAXCPDSUGS: asNumber,
    MAXDIFF: asNumber,
    NEEDAFFIX: asString,
    NOSPLITSUGS: asBoolean,
    NOSUGGEST: asString,
    OCONV: convEntry,
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
    return parseAff(lineReader(filename, encoding), encoding)
        .then(affInfo => {
            if (affInfo.SET && affInfo.SET.toLowerCase() !== encoding.toLowerCase()) {
                return parseAff(lineReader(filename, affInfo.SET), affInfo.SET);
            }
            return affInfo;
        });
}

export function parseAff(lines: Rx.Observable<string>, encoding: string = 'UTF-8') {
    return lines
        .map(line => line.replace(commentRegex, ''))
        .filter(line => line.trim() !== '')
        .map(line => line.split(spaceRegex))
        .reduce<AffInfo>((aff, line): AffInfo => {
            const [ field, ...args ] = line;
            const fn = affTableField[field];
            if (fn) {
                aff[field] = fn(aff[field], field, args);
            } else {
                aff[field] = args;
            }
            return aff;
        }, {})
        .toPromise();
}

export function parseAffFileToAff(filename: string, encoding?: string) {
    return parseAffFile(filename, encoding)
        .then(affInfo => new Aff(affInfo))
        ;
}

