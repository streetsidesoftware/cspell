import { pipeSync } from '../../pipe';
import { opFlatten, opMap, opUnique, opJoinStrings } from '../../pipe/operators';
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
            opMap((c) => caseForms(c, locale))
        ),
    ];
    const alphabet = joinLetters([
        ...pipeSync(
            charForms,
            opFlatten(),
            opMap((letter) => accentForms(letter)),
            opFlatten(),
            opUnique()
        ),
    ]);

    const sugAlpha: SuggestionCostMapDef = clean({
        map: alphabet,
        replace: cost,
        insDel: cost,
        swap: cost,
        penalty,
    });

    const caps = charForms.map((a) => joinLetters(a)).join('|');
    const sugCaps: SuggestionCostMapDef = {
        map: caps,
        replace: editCost.capsCosts,
    };

    return [sugAlpha, sugCaps];
}

export function calcFirstLetterDef(alphabet: CharacterSetCosts[], editCost: EditCostsRequired): SuggestionCostMapDef {
    const mapOfFirstLetters = [
        ...pipeSync(
            alphabet,
            opMap((cs) => cs.characters),
            opMap((c) =>
                pipeSync(
                    expandCharacterSet(c),
                    opUnique(),
                    opMap((letter) => `(^${letter})`)
                )
            ),
            opJoinStrings('')
        ),
    ].join('|');

    const penalty = editCost.firstLetterPenalty;
    // Make it a bit cheaper so it will match
    const cost = editCost.baseCost - penalty;

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
