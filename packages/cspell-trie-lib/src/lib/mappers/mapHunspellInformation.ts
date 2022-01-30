import { opFilter, opFlatten, opMap, pipeSync as pipe } from '@cspell/cspell-pipe';
import type { HunspellCosts, HunspellInformation } from '../models/DictionaryInformation';
import { Locale } from '../models/locale';
import type { SuggestionCostMapDef } from '../models/suggestionCostsDef';
import { caseForms } from '../utils/text';
import { isDefined, unique as uniqueU } from '../utils/util';
import { mapHunspellCosts } from './mapCosts';
import {
    calcCostsForAccentedLetters,
    calcFirstCharacterReplace,
    parseAlphabet,
    splitMap,
} from './mapToSuggestionCostDef';

interface Costs extends Required<HunspellCosts> {
    locale?: string[] | undefined;
}

export function hunspellInformationToSuggestionCostDef(
    hunInfo: HunspellInformation,
    locales: Locale[] | undefined
): SuggestionCostMapDef[] {
    const costs = calcCosts(hunInfo.costs, locales);

    const operations = [
        affKey,
        affKeyCaps,
        affMap,
        affMapAccents,
        affMapCaps,
        affNoTry,
        affRepConv,
        affTry,
        affTryAccents,
        affTryFirstCharacterReplace,
    ];

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

        const defs = pipe(
            lines,
            opMap((line) =>
                pipe(
                    operations,
                    opMap((fn) => fn(line, costs)),
                    opMap(asArrayOf),
                    opFlatten()
                )
            ),
            opFlatten(),
            opFilter(isDefined)
        );

        return [...defs];
    }

    return parseAff(hunInfo.aff, costs);
}

function calcCosts(costs: HunspellCosts = {}, locale?: Locale[] | undefined): Costs {
    const useLocale = locale?.length ? locale.map((loc) => loc.locale) : undefined;

    const hunCosts = mapHunspellCosts(costs);

    const c: Costs = {
        ...hunCosts,
        locale: useLocale,
    };
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

function affTry(line: string, costs: Costs): SuggestionCostMapDef[] | undefined {
    const m = line.match(regExpTry);
    if (!m) return undefined;

    const cost = costs.tryCharCost;
    const tryChars = m[1];
    const characters = tryChars;

    return parseAlphabet(
        {
            characters,
            cost,
        },
        costs.locale,
        costs
    );
}

function affTryFirstCharacterReplace(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpTry);
    if (!m) return undefined;

    const characters = m[1];
    // Make it a bit cheaper so it will match
    const cost = costs.tryCharCost;

    return calcFirstCharacterReplace(
        {
            characters,
            cost,
        },
        costs
    );
}

const regExpNoTry = /^NO-TRY\s+(\S+)$/;

function affNoTry(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpNoTry);
    if (!m) return undefined;

    const map = m[1];

    return {
        map,
        insDel: Math.max(costs.nonAlphabetCosts - costs.tryCharCost, 0),
        penalty: costs.nonAlphabetCosts + costs.tryCharCost,
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
        map: joinLetters([from, into]),
        replace: cost,
    };
}

const regExpKey = /^(?:KEY)\s+(\S+)$/;

function affKey(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpKey);
    if (!m) return undefined;

    const kbd = m[1];

    const pairs = [...splitMap(kbd)]
        .map(reducer((p, v) => ({ a: p.b, b: v }), { a: '|', b: '|' }))
        .filter((ab) => ab.a !== '|' && ab.b !== '|')
        .map(({ a, b }) => joinLetters([a, b]));

    const pairsUpper = pairs.map((p) => p.toLocaleUpperCase(costs.locale));

    const map = uniqueU(pairs.concat(pairsUpper)).join('|');
    const cost = costs.keyboardCost;

    return {
        map,
        replace: cost,
        swap: cost,
    };
}

function affKeyCaps(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpKey);
    if (!m) return undefined;
    return parseCaps(m[1], costs);
}

function affMapCaps(line: string, costs: Costs): SuggestionCostMapDef | undefined {
    const m = line.match(regExpMap);
    if (!m) return undefined;
    return parseCaps(m[1], costs);
}

function affTryAccents(line: string, costs: Costs): SuggestionCostMapDef[] | undefined {
    const m = line.match(regExpTry);
    if (!m) return undefined;
    return calcCostsForAccentedLetters(m[1], costs.locale, costs);
}

function affMapAccents(line: string, costs: Costs): SuggestionCostMapDef[] | undefined {
    const m = line.match(regExpMap);
    if (!m) return undefined;
    return calcCostsForAccentedLetters(m[1], costs.locale, costs);
}

function parseCaps(value: string, costs: Costs): SuggestionCostMapDef | undefined {
    const locale = costs.locale;
    const letters = [...splitMap(value)].filter((a) => a !== '|');
    const withCases = letters
        .map((s) => caseForms(s, locale))
        .filter((forms) => forms.length > 1)
        .map(joinLetters);

    const map = uniqueU(withCases).join('|');
    const cost = costs.capsCosts;

    if (!map) return undefined;

    return {
        map,
        replace: cost,
    };
}

/**
 * Bring letters / strings together.
 * - `['a', 'b'] => 'ab'`
 * - `['a', 'bc'] => 'a(bc)'`
 * @param letters - letters to join
 */
export function joinLetters(letters: string[]): string {
    const v = [...letters];
    return v.map((a) => (a.length > 1 || !a.length ? `(${a})` : a)).join('');
}

function reducer<T, U = T>(fn: (acc: U, val: T, i: number) => U, initialVal: U) {
    let acc = initialVal;
    return (val: T, i: number) => (acc = fn(acc, val, i));
}

function asArrayOf<T>(v: T | T[]): T[] {
    return Array.isArray(v) ? v : [v];
}

export const __testing__ = {
    affKey,
    affKeyCaps,
    affMap,
    affMapAccents,
    affMapCaps,
    affNoTry,
    affRepConv,
    affTry,
    affTryAccents,
    affTryFirstCharacterReplace,
    calcCosts,
    split: splitMap,
};
