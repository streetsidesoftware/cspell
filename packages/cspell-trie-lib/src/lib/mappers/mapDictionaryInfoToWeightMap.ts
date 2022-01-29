import { SuggestionCostMapDef } from '..';
import { createWeightMap, WeightMap } from '../distance/weightedMaps';
import type { DictionaryInformation } from '../models/DictionaryInformation';
import { mapDictionaryInformation } from './mapDictionaryInfo';

const defaultDefs: SuggestionCostMapDef[] = [
    {
        map: '1234567890-.',
        insDel: 1,
        penalty: 200,
    },
];

export function mapDictionaryInformationToWeightMap(dictInfo: DictionaryInformation): WeightMap {
    const defs = mapDictionaryInformation(dictInfo).concat(defaultDefs);
    return createWeightMap(...defs);
}

export const __testing__ = {};
