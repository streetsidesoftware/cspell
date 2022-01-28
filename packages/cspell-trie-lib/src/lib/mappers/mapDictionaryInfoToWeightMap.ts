import { createWeightMap, WeightMap } from '../distance/weightedMaps';
import type { DictionaryInformation } from '../models/DictionaryInformation';
import { mapDictionaryInformation } from './mapDictionaryInfo';

export function mapDictionaryInformationToWeightMap(dictInfo: DictionaryInformation): WeightMap {
    const defs = mapDictionaryInformation(dictInfo);
    return createWeightMap(...defs);
}

export const __testing__ = {};
