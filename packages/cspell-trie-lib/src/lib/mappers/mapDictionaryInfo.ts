import { opFlatten, opMap, pipeSync } from '@cspell/cspell-pipe/sync';
import type { CharacterSetCosts, DictionaryInformation } from '../models/DictionaryInformation';
import { parseLocale } from '../models/locale';
import type { SuggestionCostMapDef } from '../models/suggestionCostsDef';
import { isDefined } from '../utils/util';
import { EditCostsRequired, mapEditCosts } from './mapCosts';
import { hunspellInformationToSuggestionCostDef } from './mapHunspellInformation';
import { PenaltyAdjustment } from '../distance/weightedMaps';
import { calcFirstCharacterReplaceDefs, parseAccents, parseAlphabet } from './mapToSuggestionCostDef';
import { ArrayItem } from '../types';

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
            opMap((cs) => parseAlphabet(cs, locale, editCost)),
            opFlatten()
        ),
        ...calcFirstCharacterReplaceDefs(csAlphabet, editCost),
    ];
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

function processAccents(
    accents: DictionaryInformation['accents'],
    editCost: EditCostsRequired
): SuggestionCostMapDef[] {
    const cs = toCharSets(accents, '\u0300-\u0341', editCost.accentCosts);
    return cs.map((cs) => parseAccents(cs, editCost)).filter(isDefined);
}

export function mapDictionaryInformationToAdjustment(dictInfo: DictionaryInformation): PenaltyAdjustment[] {
    if (!dictInfo.adjustments) return [];

    return dictInfo.adjustments.map(mapAdjustment);
}

type Adjustments = Exclude<DictionaryInformation['adjustments'], undefined>;
type Adjustment = ArrayItem<Adjustments>;

function mapAdjustment(adj: Adjustment): PenaltyAdjustment {
    const { id, regexp, penalty } = adj;
    return {
        id: id,
        regexp: new RegExp(regexp),
        penalty,
    };
}
