import { pipeSync } from '../../pipe';
import { opFlatten, opMap, opUnique } from '../../pipe/operators';
import type { CharacterSetCosts } from '../models/DictionaryInformation';
import type { SuggestionCostMapDef } from '../models/suggestionCostsDef';
import { accentForms, caseForms, expandCharacterSet } from '../utils/text';
import { clean } from '../utils/util';
import { EditCostsRequired } from './mapCosts';
import { joinLetters } from './mapHunspellInformation';

export function parseAlphabet(
    cs: CharacterSetCosts,
    locale: string[] | undefined,
    editCost: EditCostsRequired
): SuggestionCostMapDef[] {
    const { cost, penalty } = cs;
    const characters = expandCharacterSet(cs.characters);
    const charForms = [
        ...pipeSync(
            characters,
            opMap((c) => caseForms(c, locale).sort())
        ),
    ];
    const alphabet = joinLetters(
        [
            ...pipeSync(
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

    return [sugAlpha, parseAlphabetCaps(cs.characters, locale, editCost)];
}

export function parseAlphabetCaps(
    alphabet: string,
    locale: string[] | undefined,
    editCost: EditCostsRequired
): SuggestionCostMapDef {
    const characters = expandCharacterSet(alphabet);
    const charForms = [
        ...pipeSync(
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
    const mapOfFirstLetters = [
        ...pipeSync(
            expandCharacterSet(cs.characters),
            opUnique(),
            opMap((letter) => `(^${letter})`)
        ),
    ]
        .sort()
        .join('');

    const penalty = editCost.firstLetterPenalty;
    // Make it a bit cheaper so it will match
    const cost = cs.cost - penalty;

    return {
        map: mapOfFirstLetters,
        replace: cost,
        penalty,
    };
}

export function parseAccents(cs: CharacterSetCosts, _editCost: EditCostsRequired): SuggestionCostMapDef {
    const { cost, penalty } = cs;
    const characters = expandCharacterSet(cs.characters);
    return clean({
        map: joinLetters([...characters]),
        replace: cost,
        penalty,
    });
}
