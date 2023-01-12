import { opFilter, opFlatten, opMap, opUnique, pipe } from '@cspell/cspell-pipe/sync';
import { map } from 'gensequence/dist/operators';

import type { CharacterSetCosts } from '../models/DictionaryInformation';
import type { SuggestionCostMapDef } from '../models/suggestionCostsDef';
import { accentForms, caseForms, expandCharacterSet, stripAccents, stripNonAccents } from '../utils/text';
import { clean } from '../utils/util';
import { joinLetters } from './joinLetters';
import type { EditCostsRequired } from './mapCosts';

export function parseAlphabet(
    cs: CharacterSetCosts,
    locale: string[] | undefined,
    editCost: EditCostsRequired
): SuggestionCostMapDef[] {
    const { cost, penalty } = cs;
    const characters = expandCharacterSet(cs.characters);
    const charForms = [
        ...pipe(
            characters,
            opMap((c) => caseForms(c, locale).sort())
        ),
    ];
    const alphabet = joinLetters(
        [
            ...pipe(
                charForms,
                opFlatten(),
                opMap((letter) => accentForms(letter)),
                opFlatten(),
                opUnique()
            ),
        ].sort()
    );

    const sugAlpha: SuggestionCostMapDef = clean({
        map: alphabet,
        replace: cost,
        insDel: cost,
        swap: cost,
        penalty,
    });

    return [
        sugAlpha,
        parseAlphabetCaps(cs.characters, locale, editCost),
        ...calcCostsForAccentedLetters(alphabet, locale, editCost),
    ];
}

export function parseAlphabetCaps(
    alphabet: string,
    locale: string[] | undefined,
    editCost: EditCostsRequired
): SuggestionCostMapDef {
    const characters = expandCharacterSet(alphabet);
    const charForms = [
        ...pipe(
            characters,
            opMap((c) => caseForms(c, locale).sort())
        ),
    ];

    const caps = charForms.map((a) => joinLetters(a)).join('|');
    const sugCaps: SuggestionCostMapDef = {
        map: caps,
        replace: editCost.capsCosts,
    };

    return sugCaps;
}

export function calcFirstCharacterReplaceDefs(
    alphabets: CharacterSetCosts[],
    editCost: EditCostsRequired
): SuggestionCostMapDef[] {
    return alphabets.map((cs) => calcFirstCharacterReplace(cs, editCost));
}

export function calcFirstCharacterReplace(cs: CharacterSetCosts, editCost: EditCostsRequired): SuggestionCostMapDef {
    const mapOfFirstLetters =
        [
            ...pipe(
                expandCharacterSet(cs.characters),
                opUnique(),
                opMap((letter) => `(^${letter})`)
            ),
        ]
            .sort()
            .join('') + '(^)';

    const penalty = editCost.firstLetterPenalty;
    // Make it a bit cheaper so it will match
    const cost = cs.cost - penalty;

    return {
        map: mapOfFirstLetters,
        replace: cost,
        penalty: penalty * 2,
    };
}

export function parseAccents(cs: CharacterSetCosts, _editCost: EditCostsRequired): SuggestionCostMapDef | undefined {
    const { cost, penalty } = cs;

    const accents = joinLetters([
        ...pipe(
            expandCharacterSet(cs.characters),
            map((char) => stripNonAccents(char))
        ),
    ]);

    if (!accents) return undefined;

    return clean({
        map: accents,
        replace: cost,
        insDel: cost,
        penalty,
    });
}

export function calcCostsForAccentedLetters(
    simpleMap: string,
    locale: string[] | undefined,
    costs: EditCostsRequired
): SuggestionCostMapDef[] {
    const charactersWithAccents = [
        ...pipe(
            splitMap(simpleMap),
            opMap((char) => caseForms(char, locale)),
            opFlatten(),
            opMap((char) => [...accentForms(char)]),
            opFilter((forms) => forms.length > 1)
        ),
    ];

    const characters = pipe(
        charactersWithAccents,
        opMap((forms) => new Set([...forms, ...forms.map((char) => stripAccents(char))])),
        opMap((forms) => [...forms].sort()),
        opFilter((forms) => forms.length > 1),
        opMap(joinLetters),
        opUnique()
    );

    const replaceAccentMap = [...characters].join('|');
    const cost = costs.accentCosts;
    const costToReplaceAccent = !replaceAccentMap ? [] : [{ map: replaceAccentMap, replace: cost }];

    const normalizeMap = charactersWithAccents
        .map((a) => a.sort())
        .map(joinLetters)
        .join('|');
    const costToNormalizeAccent = !normalizeMap ? [] : [{ map: normalizeMap, replace: 0 }];

    return [...costToReplaceAccent, ...costToNormalizeAccent];
}

/**
 * Splits a simple map string into its parts.
 * - `abc` => `a`, `b`, `c`
 * - `a(bc)` => `a`, `bc`
 * @param map - string of characters
 */
export function* splitMap(map: string): Iterable<string> {
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
