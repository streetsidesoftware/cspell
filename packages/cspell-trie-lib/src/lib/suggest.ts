import { visualLetterMaskMap } from './orthography';
import { MaxCost, suggestionCollector, SuggestionIterator, SuggestionResult } from './suggestCollector';
import { TrieRoot } from './TrieNode';
import { isWordTerminationNode } from './util';
import { CompoundWordsMethod, hintedWalker, JOIN_SEPARATOR, WORD_SEPARATOR } from './walker';

const defaultMaxNumberSuggestions = 10;

const baseCost = 100;
const swapCost = 75;
const postSwapCost = swapCost - baseCost;
const maxNumChanges = 5;
const insertSpaceCost = -1;
const mapSubCost = 1;
const maxCostScale = 0.5;

const setOfSeparators = new Set([JOIN_SEPARATOR, WORD_SEPARATOR]);

const collator = new Intl.Collator();

export function suggest(
    root: TrieRoot | TrieRoot[],
    word: string,
    numSuggestions: number = defaultMaxNumberSuggestions,
    compoundMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
    numChanges: number = maxNumChanges,
    ignoreCase?: boolean
): SuggestionResult[] {
    const collector = suggestionCollector(word, {
        numSuggestions: numSuggestions,
        changeLimit: numChanges,
        includeTies: true,
        ignoreCase,
    });
    collector.collect(genSuggestions(root, word, compoundMethod));
    return collector.suggestions;
}

export function* genSuggestions(
    root: TrieRoot | TrieRoot[],
    word: string,
    compoundMethod: CompoundWordsMethod = CompoundWordsMethod.NONE
): SuggestionIterator {
    const roots = Array.isArray(root) ? root : [root];
    for (const r of roots) {
        yield* genCompoundableSuggestions(r, word, compoundMethod);
    }
    return undefined;
}

interface Range {
    a: number;
    b: number;
}

export function* genCompoundableSuggestions(
    root: TrieRoot,
    word: string,
    compoundMethod: CompoundWordsMethod
): SuggestionIterator {
    type History = SuggestionResult;

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
    const specialCosts: Record<string, number | undefined> = {
        [WORD_SEPARATOR]: insertSpaceCost,
        [JOIN_SEPARATOR]: insertSpaceCost,
    };

    let costLimit: MaxCost = bc * Math.min(word.length * maxCostScale, maxNumChanges);
    const a = 0;
    let b = 0;
    for (let i = 0, c = 0; i <= mx && c <= costLimit; ++i) {
        c = i * baseCost;
        matrix[0][i] = c;
        b = i;
    }
    stack[0] = { a, b };

    const hint = word;
    const iWalk = hintedWalker(root, compoundMethod, hint);
    let goDeeper = true;
    for (let r = iWalk.next({ goDeeper }); !r.done; r = iWalk.next({ goDeeper })) {
        const { text, node, depth } = r.value;
        let { a, b } = stack[depth];
        const w = text.slice(-1);
        const wG = visualLetterMaskMap[w] || 0;
        if (setOfSeparators.has(w)) {
            const mxRange = matrix[depth].slice(a, b + 1);
            const mxMin = Math.min(...mxRange);
            const tag = [a].concat(mxRange.map((c) => c - mxMin)).join();
            const ht = historyTags.get(tag);
            if (ht && ht.m <= mxMin) {
                goDeeper = false;
                const { i, w, m } = ht;
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
        const ci = c + (specialCosts[w] || 0);

        // Setup first column
        matrix[d] = matrix[d] || [];
        matrix[d][a] = matrix[d - 1][a] + ci + d - a;
        let lastLetter = x[a];
        let min = matrix[d][a];
        let i;

        // calc the core letters
        for (i = a + 1; i <= b; ++i) {
            const curLetter = x[i];
            const cG = visualLetterMaskMap[curLetter] || 0;
            const subCost =
                w === curLetter
                    ? 0
                    : wG & cG
                    ? mapSubCost
                    : curLetter === lastSugLetter
                    ? w === lastLetter
                        ? psc
                        : c
                    : c;
            const e = Math.min(
                matrix[d - 1][i - 1] + subCost, // substitute
                matrix[d - 1][i] + ci, // insert
                matrix[d][i - 1] + c // delete
            );
            min = Math.min(min, e);
            matrix[d][i] = e;
            lastLetter = curLetter;
        }

        // fix the last column
        const { b: bb } = stack[d - 1];
        while (b < mx) {
            b += 1;
            i = b;
            const curLetter = x[i];
            const cG = visualLetterMaskMap[curLetter] || 0;
            const subCost =
                w === curLetter
                    ? 0
                    : wG & cG
                    ? mapSubCost
                    : curLetter === lastSugLetter
                    ? w === lastLetter
                        ? psc
                        : c
                    : c;
            // if (i - 1) is out of range, use the last value.
            // no need to be exact, the value will be past maxCost.
            const j = Math.min(bb, i - 1);
            const e = Math.min(
                matrix[d - 1][j] + subCost, // substitute
                matrix[d][i - 1] + c // delete
            );
            min = Math.min(min, e);
            matrix[d][i] = e;
            lastLetter = curLetter;
            if (e > costLimit) break;
        }

        // Adjust the range between a and b
        for (; b > a && matrix[d][b] > costLimit; b -= 1) {
            /* empty */
        }
        for (; a < b && matrix[d][a] > costLimit; a += 1) {
            /* empty */
        }

        b = Math.min(b + 1, mx);
        stack[d] = { a, b };
        const cost = matrix[d][b];
        if (node.f && isWordTerminationNode(node) && cost <= costLimit) {
            const r = { word: text, cost };
            history.push(r);
            costLimit = (yield r) || costLimit;
        }
        goDeeper = min <= costLimit;
    }
    return undefined;
}

// comparison function for Suggestion Results.
export function compSuggestionResults(a: SuggestionResult, b: SuggestionResult): number {
    return a.cost - b.cost || a.word.length - b.word.length || collator.compare(a.word, b.word);
}
