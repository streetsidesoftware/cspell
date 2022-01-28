import { createWeightMap, WeightMap } from '../distance/weightedMaps';
import type { DictionaryInformation } from '../models/DictionaryInformation';
import { hunspellInformationToSuggestionCostDef } from './mapHunspellInformation';

export function mapDictionaryInformationToWeightMap(dictInfo: DictionaryInformation): WeightMap {
    const defsEC = dictInfo.suggestionEditCosts || [];
    const defsHI = dictInfo.hunspellInformation
        ? hunspellInformationToSuggestionCostDef(dictInfo.hunspellInformation, dictInfo.locale)
        : [];
    return createWeightMap(...defsEC, ...defsHI);
}

export const __testing__ = {};
