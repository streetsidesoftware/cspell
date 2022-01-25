import { createWeightMap, WeightMap } from '../distance/weightedMaps';
import type { DictionaryInformation, HunspellCosts, HunspellInformation } from '../models/DictionaryInformation';
import type { SuggestionCostMapDef } from '../models/suggestionCostsDef';
import { isDefined } from '../utils/util';

type Costs = Required<HunspellCosts>;

export function dictionaryInformationToWeightMap(dictInfo: DictionaryInformation): WeightMap {
    const defsEC = dictInfo.suggestionEditCosts || [];
    const defsHI = dictInfo.hunspellInformation
        ? hunspellInformationToSuggestionCostDef(dictInfo.hunspellInformation)
        : [];
    return createWeightMap(...defsEC, ...defsHI);
}

export function hunspellInformationToSuggestionCostDef(hunInfo: HunspellInformation): SuggestionCostMapDef[] {
    const defs: SuggestionCostMapDef[] = [];
    const costs = calcCosts(hunInfo.costs);

    function parseAff(aff: string, costs: Costs) {
        // cspell:ignore OCONV
        const regSupportedAff = /^(?:MAP|KEY|TRY|NO-TRY|ICONV|OCONV|REP)\s/;
        const rejectAff = /^(?:MAP|KEY|TRY|ICONV|OCONV|REP)\s+\d+$/;

        const lines = aff
            .split('\n')
            .map((a) => a.replace(/#.*/, ''))
            .map((a) => a.trim())
            .filter((a) => regSupportedAff.test(a))
            .filter((a) => !rejectAff.test(a));
        lines.forEach((line) => {
            [affMap, affNoTry, affRepConv, affTry, affTryFirstCharacterReplace, affKey]
                .map((fn) => fn(line, costs))
                .filter(isDefined)
                .forEach((def) => defs.push(def));
        });
    }

    parseAff(hunInfo.aff, costs);

    return defs;
}

function calcCosts(costs: HunspellCosts = {}): Costs {
    const {
        firstLetterPenalty = 4,
        ioConvertCost = 30,
        keyboardCost = 94,
        mapCost = 25,
        replaceCosts = 75,
        tryCharCost = 95,
    } = costs;
    const c: Costs = { tryCharCost, keyboardCost, mapCost, ioConvertCost, replaceCosts, firstLetterPenalty };
    return c;
}

const regExpMap = /^(?:MAP)\s+(\S+)$/;

function affMap(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpMap);
    if (!m) return undefined;

    const map = m[1];
    const cost = costs.mapCost;

    return {
        map,
        replace: cost,
        swap: cost,
    };
}

const regExpTry = /^(?:TRY)\s+(\S+)$/;

function affTry(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpTry);
    if (!m) return undefined;

    const map = m[1];
    const cost = costs.tryCharCost;

    return {
        map,
        insDel: cost,
        replace: cost,
        swap: cost,
    };
}

function affTryFirstCharacterReplace(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpTry);
    if (!m) return undefined;

    const map = [...split(m[1])].map((char) => `(^${char})`).join('');
    const cost = costs.tryCharCost;
    const penalty = costs.firstLetterPenalty;

    return {
        map,
        replace: cost - penalty,
        penalty,
    };
}

const regExpNoTry = /^NO-TRY\s+(\S+)$/;

function affNoTry(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpNoTry);
    if (!m) return undefined;

    const map = m[1];

    return {
        map,
        insDel: Math.max(100 - costs.tryCharCost, 0),
        penalty: 100 + costs.tryCharCost,
    };
}

// cspell:ignore conv
const regExpRepConv = /^(?:REP|(?:I|O)CONV)\s+(\S+)\s+(\S+)$/;

function affRepConv(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpRepConv);
    if (!m) return undefined;

    const cost = line.startsWith('REP') ? costs.replaceCosts : costs.ioConvertCost;
    const from = m[1];
    let into = m[2];
    into = into.replace(/^0$/, '');

    if (from.startsWith('^') && !into.startsWith('^')) {
        into = '^' + into;
    }

    if (from.endsWith('$') && !into.endsWith('$')) {
        into = into + '$';
    }

    return {
        map: `(${from})(${into})`,
        replace: cost,
    };
}

const regExpKey = /^(?:KEY)\s+(\S+)$/;

function affKey(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpKey);
    if (!m) return undefined;

    const kbd = m[1];

    const pairs = [...split(kbd)]
        .map(reducer((p, v) => ({ a: p.b, b: v }), { a: '|', b: '|' }))
        .filter((ab) => ab.a !== '|' && ab.b !== '|')
        .map((ab) => ab.a + ab.b);

    const map = pairs.join('|');
    const cost = costs.keyboardCost;

    return {
        map,
        replace: cost,
        swap: cost,
    };
}

function* split(map: string): Iterable<string> {
    let seq = '';
    let mode = 0;
    for (const char of map) {
        if (mode && char === ')') {
            yield seq;
            mode = 0;
            continue;
        }
        if (mode) {
            seq += char;
            continue;
        }
        if (char === '(') {
            mode = 1;
            seq = '';
            continue;
        }
        yield char;
    }
}

function reducer<T, U = T>(fn: (acc: U, val: T, i: number) => U, initialVal: U) {
    let acc = initialVal;
    return (val: T, i: number) => (acc = fn(acc, val, i));
}

// function pipe<T>(v: T, ...fns: ((v: T) => T)[]): T {
//     for (const fn of fns) {
//         v = fn(v);
//     }
//     return v;
// }

export const __testing__ = {
    affKey,
    affMap,
    affNoTry,
    affRepConv,
    affTry,
    affTryFirstCharacterReplace,
    split,
    calcCosts,
};
