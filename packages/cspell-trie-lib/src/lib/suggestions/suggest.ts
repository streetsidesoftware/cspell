import { createSuggestionOptions, GenSuggestionOptions, SuggestionOptions } from '../genSuggestionsOptions';
import { visualLetterMaskMap } from './orthography';
import { MaxCost, suggestionCollector, SuggestionGenerator, SuggestionResult } from './suggestCollector';
import { TrieRoot } from '../TrieNode';
import { isWordTerminationNode } from '../trie-util';
import { CompoundWordsMethod, hintedWalker, JOIN_SEPARATOR, WORD_SEPARATOR } from '../walker';

const baseCost = 100;
const swapCost = 75;
const postSwapCost = swapCost - baseCost;
const insertSpaceCost = -1;
const mapSubCost = 1;
const maxCostScale = 0.5;
const discourageInsertCost = baseCost;

const setOfSeparators = new Set([JOIN_SEPARATOR, WORD_SEPARATOR]);

export function suggest(
    root: TrieRoot | TrieRoot[],
    word: string,
    options: SuggestionOptions = {}
): SuggestionResult[] {
    const opts = createSuggestionOptions(options);
    const collector = suggestionCollector(word, {
        numSuggestions: opts.numSuggestions,
        changeLimit: opts.changeLimit,
        includeTies: opts.includeTies,
        ignoreCase: opts.ignoreCase,
        timeout: opts.timeout,
        filter: opts.filter,
    });
    collector.collect(genSuggestions(root, word, opts));
    return collector.suggestions;
}

export function* genSuggestions(
    root: TrieRoot | TrieRoot[],
    word: string,
    options: GenSuggestionOptions = {}
): SuggestionGenerator {
    const roots = Array.isArray(root) ? root : [root];
    for (const r of roots) {
        yield* genCompoundableSuggestions(r, word, options);
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
    options: GenSuggestionOptions = {}
): SuggestionGenerator {
    const { compoundMethod = CompoundWordsMethod.NONE, changeLimit, ignoreCase } = createSuggestionOptions(options);
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
    const specialInsCosts: Record<string, number | undefined> = Object.assign(Object.create(null), {
        [WORD_SEPARATOR]: insertSpaceCost,
        [JOIN_SEPARATOR]: insertSpaceCost,
    });

    const specialSubCosts: Record<string, number | undefined> = Object.assign(Object.create(null), {
        '-': discourageInsertCost,
    });

    let stopNow = false;
    let costLimit: MaxCost = bc * Math.min(word.length * maxCostScale, changeLimit);

    function updateCostLimit(maxCost: number | symbol | undefined) {
        switch (typeof maxCost) {
            case 'number':
                costLimit = maxCost;
                break;
            case 'symbol':
                stopNow = true;
                break;
        }
    }

    const a = 0;
    let b = 0;
    for (let i = 0, c = 0; i <= mx && c <= costLimit; ++i) {
        c = i * baseCost;
        matrix[0][i] = c;
        b = i;
    }
    stack[0] = { a, b };

    const hint = word;
    const iWalk = hintedWalker(root, ignoreCase, hint, compoundMethod);
    let goDeeper = true;
    for (let r = iWalk.next({ goDeeper }); !stopNow && !r.done; r = iWalk.next({ goDeeper })) {
        const { text, node, depth } = r.value;
        let { a, b } = stack[depth];
        /** Current character from word */
        const w = text.slice(-1);
        /** Current character visual letter group */
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
                        updateCostLimit(yield { word: emit, cost });
                    }
                }
                continue;
            } else {
                historyTags.set(tag, { w: text, i: history.length, m: mxMin });
            }
        }
        /** current depth */
        const d = depth + 1;
        const lastSugLetter = d > 1 ? text[d - 2] : '';
        /** standard cost */
        const c = bc - d + (specialSubCosts[w] || 0);
        /** insert cost */
        const ci = c + (specialInsCosts[w] || 0);

        // Setup first column
        matrix[d] = matrix[d] || [];
        matrix[d][a] = matrix[d - 1][a] + ci + d - a;
        let lastLetter = x[a];
        let min = matrix[d][a];
        let i;

        // calc the core letters
        for (i = a + 1; i <= b; ++i) {
            const curLetter = x[i];
            /** current group */
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
            updateCostLimit(yield r);
        } else {
            updateCostLimit(yield undefined);
        }
        goDeeper = min <= costLimit;
    }
    return undefined;
}
