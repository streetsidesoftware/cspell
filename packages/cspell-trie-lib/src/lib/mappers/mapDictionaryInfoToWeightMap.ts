import { SuggestionCostMapDef } from '..';
import { addAdjustment, createWeightMap, PenaltyAdjustment, WeightMap } from '../distance/weightedMaps';
import type { DictionaryInformation } from '../models/DictionaryInformation';
import { mapDictionaryInformation, mapDictionaryInformationToAdjustment } from './mapDictionaryInfo';

const defaultDefs: SuggestionCostMapDef[] = [
    {
        map: '1234567890-.',
        insDel: 1,
        penalty: 200,
    },
];

const defaultAdjustments: PenaltyAdjustment[] = [
    {
        id: 'compound-case-change',
        regexp: /\p{Ll}∙\p{Lu}/gu,
        penalty: 1000,
    },
    {
        id: 'short-compounds-1',
        regexp: /^[^∙]{0,2}(?=∙)|∙[^∙]{0,2}(?=∙|$)/gm,
        penalty: 100,
    },
    {
        id: 'short-compounds-3',
        regexp: /^[^∙]{3}(?=∙)|∙[^∙]{3}(?=∙|$)/gm,
        penalty: 50,
    },
];

export function mapDictionaryInformationToWeightMap(dictInfo: DictionaryInformation): WeightMap {
    const defs = mapDictionaryInformation(dictInfo).concat(defaultDefs);
    const adjustments = mapDictionaryInformationToAdjustment(dictInfo);
    const map = createWeightMap(...defs);
    addAdjustment(map, ...defaultAdjustments, ...adjustments);
    return map;
}

export const __testing__ = {};
