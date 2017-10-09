import {TrieNode} from './TrieNode';
import {isWordTerminationNode} from './util';
import {CompoundWordsMethod, hintedWalker, JOIN_SEPARATOR, WORD_SEPARATOR} from './walker';
export {CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR} from './walker';

const defaultMaxNumberSuggestions = 10;

const baseCost = 100;
const swapCost = 75;
const postSwapCost = swapCost - baseCost;
const maxNumChanges = 5;
const insertSpaceDiscount = 1;

const setOfSeparators = new Set([ JOIN_SEPARATOR, WORD_SEPARATOR ]);

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

interface Range {
    a: number;
    b: number;
}

export function* genCompoundableSuggestions(
    root: TrieNode,
    word: string,
    compoundMethod: CompoundWordsMethod
): SuggestionIterator {
    interface History extends SuggestionResult {}

    interface HistoryTag {
        i: number;
        w: string;
        m: number;
    }

    const history: History[] = [];
    const historyTags = new Map<string, HistoryTag>();
    const bc = baseCost;
    const psc = postSwapCost;
    const matrix: number[][] = [[]];
    const stack: Range[] = [];
    const x = ' ' + word;
    const mx = x.length - 1;
    const specialDiscounts: { [index: string]: number } = {
        [WORD_SEPARATOR]: insertSpaceDiscount,
        [JOIN_SEPARATOR]: insertSpaceDiscount,
    };

    let costLimit = Math.min(bc * word.length / 2, bc * maxNumChanges);
    let a: number = 0;
    let b: number = 0;
    for (let i = 0, c = 0; i <= mx && c <= costLimit; ++i) {
        c = i * baseCost;
        matrix[0][i] = c;
        b = i;
    }
    stack[0] = {a, b};

    let hint = word.slice(a);
    const i = hintedWalker(root, compoundMethod, hint);
    let goDeeper = true;
    for (let r = i.next({ goDeeper }); !r.done; r = i.next({ goDeeper })) {
        const {text, node, depth} = r.value;
        let {a, b} = stack[depth];
        const w = text.slice(-1);
        if (setOfSeparators.has(w)) {
            const mxRange = matrix[depth].slice(a, b + 1);
            const mxMin = Math.min(...mxRange);
            const tag = [a].concat(mxRange.map(c => c - mxMin)).join();
            if (historyTags.has(tag) && historyTags.get(tag)!.m <= mxMin) {
                goDeeper = false;
                const { i, w, m } = historyTags.get(tag)!;
                if (i >= history.length) {
                    continue;
                }
                const r = history[i];
                if (r.word.slice(0, w.length) !== w) {
                    continue;
                }
                const dc = mxMin - m;
                for (let p = i; p < history.length; ++p) {
                    const { word, cost: hCost } = history[p];
                    const fix = word.slice(0, w.length);
                    if (fix !== w) {
                        break;
                    }
                    const cost = hCost + dc;
                    if (cost <= costLimit) {
                        const suffix = word.slice(w.length);
                        const emit = text + suffix;
                        costLimit = (yield { word: emit, cost }) || costLimit;
                    }
                }
                continue;
            } else {
                historyTags.set(tag, { w: text, i: history.length, m: mxMin });
            }
        }
        const d = depth + 1;
        const lastSugLetter = d > 1 ? text[d - 2] : '';
        const c = bc - d;
        const ci = c - (specialDiscounts[w] || 0);

        // Setup first column
        matrix[d] = matrix[d] || [];
        matrix[d][a] = matrix[d - 1][a] + ci + d - a;
        let lastLetter = x[a];
        let min = matrix[d][a];
        let i;

        // calc the core letters
        for (i = a + 1; i <= b; ++i) {
            const curLetter = x[i];
            const subCost = (w === curLetter)
                ? 0
                : (curLetter === lastSugLetter ? (w === lastLetter ? psc : c) : c);
            const e = Math.min(
                matrix[d - 1][i - 1] + subCost, // substitute
                matrix[d - 1][i    ] + ci,      // insert
                matrix[d    ][i - 1] + c        // delete
            );
            min = Math.min(min, e);
            matrix[d][i] = e;
            lastLetter = curLetter;
        }

        // fix the last column
        b += 1;
        if (b <= mx) {
            i = b;
            const curLetter = x[i];
            const subCost = (w === curLetter)
                ? 0
                : (curLetter === lastSugLetter ? (w === lastLetter ? psc : c) : c);
            const e = Math.min(
                matrix[d - 1][i - 1] + subCost, // substitute
                matrix[d    ][i - 1] + c        // delete
            );
            min = Math.min(min, e);
            matrix[d][i] = e;
            lastLetter = curLetter;
        } else {
            b -= 1;
        }

        // Adjust the range between a and b
        for (; b > a && matrix[d][b] > costLimit; b -= 1) {
        }
        for (; a < b && matrix[d][a] > costLimit; a += 1) {
        }

        b = Math.min(b + 1, mx);
        stack[d] = {a, b};
        const cost = matrix[d][b];
        if (node.f && isWordTerminationNode(node) && cost <= costLimit) {
            const r = { word: text, cost };
            history.push(r);
            costLimit = (yield r) || costLimit;
        }
        goDeeper = (min <= costLimit);
        hint = word.slice(a, b);
    }
    // console.log(`tag size: ${historyTags.size}, history size: ${history.length}`);
    // console.log(history.map((r, i) => `${i} ${r.cost} ${r.word}`).join('\n'));
}


// comparison function for Suggestion Results.
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
    readonly maxNumSuggestions: number;
}

export function suggestionCollector(
    word: string,
    maxNumSuggestions: number,
    filter: (word: string) => boolean = () => true,
    changeLimit: number = maxNumChanges
): SuggestionCollector {
    const sugs = new Map<string, SuggestionResult>();
    let maxCost: number = Math.min(baseCost * word.length / 2, baseCost * changeLimit);

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
        add: function (suggestion: SuggestionResult) { collector(suggestion); return this; },
        get suggestions() { return [...sugs.values()].sort(compSuggestionResults); },
        get maxCost() { return maxCost; },
        get word() { return word; },
        get maxNumSuggestions() { return maxNumSuggestions; },
    };
}
