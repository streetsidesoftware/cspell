import {TrieNode} from './TrieNode';
import {walker, isWordTerminationNode, CompoundWordsMethod} from './util';
export {CompoundWordsMethod} from './util';

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

export interface SuggestionIterator extends IterableIterator<SuggestionResult | undefined> {
    /**
     * Ask for the next result.
     * maxCost - sets the max cost for following suggestions
     * This is used to limit which suggestions are emitted.
     * If the iterator.next() returns `undefined`, it is to request a value for maxCost.
     */
    next: (maxCost?: MaxCost) => IteratorResult<SuggestionResult | undefined>;
    [Symbol.iterator]: () => SuggestionIterator;
}

export function suggest(
    root: TrieNode,
    word: string,
    maxNumSuggestions: number = defaultMaxNumberSuggestions,
    compoundMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
): SuggestionResult[] {
    const collector = suggestionCollector(word, maxNumSuggestions);
    collector.collect(genSuggestions(root, word, compoundMethod));
    return collector.suggestions;
}

export function* genSuggestions(
    root: TrieNode,
    word: string,
    compoundMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
): SuggestionIterator {
    yield *genCompoundableSuggestions(root, word, compoundMethod);
}

export function* genCompoundableSuggestions(
    root: TrieNode,
    word: string,
    compoundMethod: CompoundWordsMethod,
): SuggestionIterator {
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
            costLimit = (yield { word: text, cost }) || costLimit;
        }
        deeper = (min <= costLimit);
    }
}

export function compSuggestionResults(a: SuggestionResult, b: SuggestionResult): number {
    return a.cost - b.cost || a.word.length - b.word.length || a.word.localeCompare(b.word);
}

export interface SuggestionCollector {
    collect: (src: SuggestionIterator) => void;
    add: (suggestion: SuggestionResult) => SuggestionCollector;
    // (suggestion: SuggestionResult): MaxCost;
    readonly suggestions: SuggestionResult[];
    readonly maxCost: number;
    readonly word: string;
}

export function suggestionCollector(word: string, maxNumSuggestions: number, filter: (word: string) => boolean = () => true): SuggestionCollector {
    const sugs = new Map<string, SuggestionResult>();
    let maxCost: number = Math.min(baseCost * word.length / 2, baseCost * maxNumChanges);

    function dropMax() {
        if (sugs.size < 2) {
            sugs.clear();
            return;
        }
        const sorted = [...sugs.values()].sort(compSuggestionResults);
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

    function collect(src: SuggestionIterator) {
        let ir: IteratorResult<SuggestionResult | undefined>;
        while (!(ir = src.next(maxCost)).done) {
            if (ir.value !== undefined) {
                collector(ir.value);
            }
        }
    }

    return {
        collect,
        add: function (suggestion: SuggestionResult) { collector(suggestion); return this;},
        get suggestions() { return [...sugs.values()].sort(compSuggestionResults) },
        get maxCost() { return maxCost; },
        get word() { return word; },
    };
}
