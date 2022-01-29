import { pipeSync } from '../../pipe';
import { flatten, map, unique } from '../../pipe/operators';
import type { DictionaryInformation, CharacterSetCosts } from '../models/DictionaryInformation';
import { parseLocale } from '../models/locale';
import type { SuggestionCostMapDef } from '../models/suggestionCostsDef';
import { accentForms, caseForms, expandCharacterSet } from '../utils/text';
import { clean } from '../utils/util';
import { EditCostsRequired, mapEditCosts } from './mapCosts';
import { hunspellInformationToSuggestionCostDef, joinLetters } from './mapHunspellInformation';

export function mapDictionaryInformation(dictInfo: DictionaryInformation): SuggestionCostMapDef[] {
    const _locale = dictInfo.locale;
    const locale = _locale ? parseLocale(_locale).filter((loc) => loc.isValid()) : undefined;
    const locales = locale?.map((loc) => loc.locale);
    const costs = mapEditCosts(dictInfo.costs);

    const defsEC = dictInfo.suggestionEditCosts || [];
    const defsHI = dictInfo.hunspellInformation
        ? hunspellInformationToSuggestionCostDef(dictInfo.hunspellInformation, locale)
        : [];
    return [
        ...defsEC,
        ...processAlphabet(dictInfo.alphabet, locales, costs),
        ...processAccents(dictInfo.accents, costs),
        ...defsHI,
    ];
}

function processAlphabet(
    alphabet: DictionaryInformation['alphabet'],
    locale: string[] | undefined,
    editCost: EditCostsRequired
): SuggestionCostMapDef[] {
    const csAlphabet = toCharSets(alphabet, 'a-zA-Z', editCost.baseCost);

    return [
        ...pipeSync(
            csAlphabet,
            map((cs) => parseAlphabet(cs, locale, editCost)),
            flatten()
        ),
        calcFirstLetterDef(csAlphabet, editCost),
    ];
}

function parseAlphabet(
    cs: CharacterSetCosts,
    locale: string[] | undefined,
    editCost: EditCostsRequired
): SuggestionCostMapDef[] {
    const { cost, penalty } = cs;
    const characters = expandCharacterSet(cs.characters);
    const charForms = [
        ...pipeSync(
            characters,
            map((c) => caseForms(c, locale))
        ),
    ];
    const alphabet = joinLetters([
        ...pipeSync(
            charForms,
            flatten(),
            map((letter) => accentForms(letter)),
            flatten(),
            unique()
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

function toCharSets(
    cs: string | CharacterSetCosts[] | undefined,
    defaultValue: string | undefined,
    cost: number,
    penalty?: number
): CharacterSetCosts[] {
    cs = cs ?? defaultValue;
    if (!cs) return [];

    if (typeof cs === 'string') {
        cs = [
            {
                characters: cs,
                cost,
            },
        ];
    }

    if (penalty !== undefined) {
        cs.forEach((cs) => (cs.penalty = penalty));
    }

    return cs;
}

function calcFirstLetterDef(alphabet: CharacterSetCosts[], editCost: EditCostsRequired): SuggestionCostMapDef {
    const mapOfFirstLetters = [
        ...pipeSync(
            alphabet,
            map((cs) => cs.characters),
            map((c) => expandCharacterSet(c)),
            flatten(),
            unique(),
            map((letter) => `(^${letter})`)
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

function processAccents(
    accents: DictionaryInformation['accents'],
    editCost: EditCostsRequired
): SuggestionCostMapDef[] {
    const cs = toCharSets(accents, '\u0300-\u0341', editCost.accentCosts);
    return cs.map((cs) => parseAccents(cs, editCost));
}

function parseAccents(cs: CharacterSetCosts, _editCost: EditCostsRequired): SuggestionCostMapDef {
    const { cost, penalty } = cs;
    const characters = expandCharacterSet(cs.characters);
    return clean({
        map: joinLetters([...characters]),
        replace: cost,
        penalty,
    });
}
