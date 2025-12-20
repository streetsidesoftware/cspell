import type { SuggestionCostMapDef } from '../models/suggestionCostsDef.ts';
import { distanceAStarWeighted } from './distanceAStarWeighted.ts';
import { levenshteinDistance } from './levenshtein.ts';
import type { WeightMap } from './weightedMaps.ts';
import { addDefToWeightMap, createWeightMap } from './weightedMaps.ts';

export type { SuggestionCostMapDef } from '../models/suggestionCostsDef.ts';

const defaultCost = 100;

/**
 * Calculate the edit distance between any two words.
 * Use the Damerau–Levenshtein distance algorithm.
 * @param wordA
 * @param wordB
 * @param editCost - the cost of each edit (defaults to 100)
 * @returns the edit distance.
 */
export function editDistance(wordA: string, wordB: string, editCost: number = defaultCost): number {
    return levenshteinDistance(wordA, wordB) * editCost;
}

/**
 * Calculate the weighted edit distance between any two words.
 * @param wordA
 * @param wordB
 * @param weights - the weights to use
 * @param editCost - the cost of each edit (defaults to 100)
 * @returns the edit distance
 */
export function editDistanceWeighted(
    wordA: string,
    wordB: string,
    weights: WeightMap,
    editCost: number = defaultCost,
): number {
    return distanceAStarWeighted(wordA, wordB, weights, editCost);
}

/**
 * Collect Map definitions into a single weighted map.
 * @param defs - list of definitions
 * @returns A Weighted Map to be used with distance calculations.
 */
export function createWeightedMap(defs: SuggestionCostMapDef[]): WeightMap {
    return createWeightMap(...defs);
}

/**
 * Update a WeightedMap with a WeightedMapDef
 * @param weightedMap - map to update
 * @param def - the definition to use
 */
export function updatedWeightedMap(weightedMap: WeightMap, def: SuggestionCostMapDef): void {
    addDefToWeightMap(weightedMap, def);
}
