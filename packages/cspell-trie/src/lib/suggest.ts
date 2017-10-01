import {TrieNode} from './TrieNode';
import {walker, isWordTerminationNode, CompoundingMethod} from './util';
export {CompoundingMethod} from './util';

const defaultMaxNumberSuggestions = 10;

const baseCost = 100;
const swapCost = 75;
const postSwapCost = swapCost - baseCost;
const maxNumChanges = 5;

export type Cost = number;
export type MaxCost = Cost;

export interface SuggestionResult {
    word: string;
    cost: Cost;
}
export function suggest(
    root: TrieNode,
    word: string,
    maxNumSuggestions: number = defaultMaxNumberSuggestions,
): SuggestionResult[] {
    const collector = suggestionCollector(word, maxNumSuggestions);
    genSuggestions(root, word, collector);
    return collector.suggestions;
}

// @todo: convert this to use generators / iterators instead of `output` collector

export function genSuggestions(
    root: TrieNode,
    word: string,
    output: (suggestion: SuggestionResult) => MaxCost
) {
    genCompoundableSuggestions(root, word, CompoundingMethod.NONE, output);
}

export function genCompoundableSuggestions(
    root: TrieNode,
    word: string,
    compoundMethod: CompoundingMethod,
    output: (suggestion: SuggestionResult) => MaxCost
) {
    const bc = baseCost;
    const psc = postSwapCost;
    const matrix: number[][] = [[]];
    const x = ' ' + word;
    const mx = x.length - 1;

    let costLimit = Math.min(bc * word.length / 2, bc * maxNumChanges);

    for (let i = 0; i <= mx; ++i) {
        matrix[0][i] = i * baseCost;
    }

    const i = walker(root, compoundMethod);
    let deeper = true;
    for (let r = i.next(deeper); !r.done; r = i.next(deeper)) {
        const {text, node, depth} = r.value;
        const d = depth + 1;
        const lastSugLetter = d > 1 ? text[d - 2] : '';
        const w = text.slice(-1);
        const c = bc - d;
        matrix[d] = matrix[d] || [];
        matrix[d][0] = matrix[d - 1][0] + bc;
        let lastLetter = x[0];
        let min = matrix[d][0];
        for (let i = 1; i <= mx; ++i) {
            let curLetter = x[i];
            let subCost = (w === curLetter)
                ? 0
                : (curLetter === lastSugLetter ? (w === lastLetter ? psc : c) : c);
            matrix[d][i] = Math.min(
                matrix[d - 1][i - 1] + subCost, // substitute
                matrix[d - 1][i    ] + c,      // insert
                matrix[d    ][i - 1] + c       // delete
            );
            min = Math.min(min, matrix[d][i]);
            lastLetter = curLetter;
        }
        let cost = matrix[d][mx];
        if (isWordTerminationNode(node) && cost <= costLimit) {
            costLimit = output({ word: text, cost });
        }
        deeper = (min <= costLimit);
    }
}

export interface SuggestionCollector {
    (suggestion: SuggestionResult): MaxCost;
    readonly suggestions: SuggestionResult[];
    readonly maxCost: number;
    readonly word: string;
}

export function suggestionCollector(word: string, maxNumSuggestions: number, filter: (word: string) => boolean = () => true): SuggestionCollector {
    const sugs = new Map<string, SuggestionResult>();
    let maxCost: number = Math.min(baseCost * word.length / 2, baseCost * maxNumChanges);

    function comp(a: SuggestionResult, b: SuggestionResult): number {
        return a.cost - b.cost || a.word.length - b.word.length || a.word.localeCompare(b.word);
    }

    function dropMax() {
        if (sugs.size < 2) {
            return;
        }
        const sorted = [...sugs.values()].sort(comp);
        const toRemove = sorted.pop()!;
        const maxSug = sorted.pop()!;

        sugs.delete(toRemove.word);
        maxCost = maxSug.cost;
    }

    function collector(suggestion: SuggestionResult): MaxCost {
        const {word, cost} = suggestion;
        if (cost <= maxCost && filter(suggestion.word)) {
            if (sugs.has(word)) {
                const known = sugs.get(word)!;
                known.cost = Math.min(known.cost, cost);
            } else {
                sugs.set(word, { word, cost });
                if (sugs.size > maxNumSuggestions) {
                    dropMax();
                }
            }
        }
        return maxCost;
    }

    const sugCollector = collector as SuggestionCollector;
    Object.defineProperties(sugCollector, {
        suggestions: { get: () => [...sugs.values()].sort(comp) },
        maxCost: { get: () => maxCost },
        word: { get: () => word },
    });

    return sugCollector;
}
