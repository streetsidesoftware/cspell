import type { ITrieNode, TrieOptions } from '../ITrieNode/index.js';
import { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from '../ITrieNode/walker/index.js';
import type { TrieData } from '../TrieData.js';
import { PairingHeap } from '../utils/PairingHeap.js';
import { opCosts } from './constants.js';
import type { SuggestionOptions } from './genSuggestionsOptions.js';
import { createSuggestionOptions } from './genSuggestionsOptions.js';
import { visualLetterMaskMap } from './orthography.js';
import type { SuggestionGenerator, SuggestionResult } from './suggestCollector.js';
import { suggestionCollector } from './suggestCollector.js';

type Cost = number;
// type BranchIdx = number;
type WordIndex = number;

/** A Trie structure used to track accumulated costs */
interface CostTrie {
    /** cost by index */
    c: number[];
    t: Record<string, CostTrie | undefined>;
}

interface PNode {
    /** current node */
    n: ITrieNode;
    /** Accumulated cost */
    c: Cost;
    /** Index into src word */
    i: WordIndex;
    /** letter used or '' */
    s: string;
    /** parent node */
    p: PNode | undefined;
    /** cost trie to reduce duplicate paths */
    t: CostTrie;
    /** edit action taken */
    a?: string;
}

// const ProgressFactor = opCosts.baseCost - 1;

/**
 * Compare Path Nodes.
 * Balance the calculation between depth vs cost
 */
function comparePath(a: PNode, b: PNode): number {
    return a.c / (a.i + 1) - b.c / (b.i + 1) + (b.i - a.i);
}

export function suggestAStar(trie: TrieData, word: string, options: SuggestionOptions = {}): SuggestionResult[] {
    const opts = createSuggestionOptions(options);
    const collector = suggestionCollector(word, {
        numSuggestions: opts.numSuggestions,
        changeLimit: opts.changeLimit,
        includeTies: opts.includeTies,
        ignoreCase: opts.ignoreCase,
        timeout: opts.timeout,
    });
    collector.collect(getSuggestionsAStar(trie, word, opts));
    return collector.suggestions;
}

export function* getSuggestionsAStar(
    trie: TrieData,
    srcWord: string,
    options: SuggestionOptions = {}
): SuggestionGenerator {
    const { compoundMethod, changeLimit, ignoreCase } = createSuggestionOptions(options);
    const visMap = visualLetterMaskMap;
    const root = trie.getRoot();
    const rootIgnoreCase = (ignoreCase && root.get(root.info.stripCaseAndAccentsPrefix)) || undefined;
    const pathHeap = new PairingHeap(comparePath);
    const resultHeap = new PairingHeap(compareSuggestion);
    const rootPNode: PNode = { n: root, i: 0, c: 0, s: '', p: undefined, t: createCostTrie() };
    const BC = opCosts.baseCost;
    const VC = opCosts.visuallySimilar;
    const DL = opCosts.duplicateLetterCost;
    const wordSeparator = compoundMethod === CompoundWordsMethod.JOIN_WORDS ? JOIN_SEPARATOR : WORD_SEPARATOR;
    const sc = specialChars(trie.info);
    const comp = trie.info.compoundCharacter;
    const compRoot = root.get(comp);
    const compRootIgnoreCase = rootIgnoreCase && rootIgnoreCase.get(comp);
    const emitted: Record<string, number> = Object.create(null);

    /** Initial limit is based upon the length of the word. */
    let limit = BC * Math.min(srcWord.length * opCosts.wordLengthCostFactor, changeLimit);

    pathHeap.add(rootPNode);
    if (rootIgnoreCase) {
        pathHeap.add({ n: rootIgnoreCase, i: 0, c: 0, s: '', p: undefined, t: createCostTrie() });
    }

    let best = pathHeap.dequeue();
    let maxSize = pathHeap.size;
    let suggestionsGenerated = 0;
    let nodesProcessed = 0;
    let nodesProcessedLimit = 1000;
    let minGen = 1;
    while (best) {
        if (++nodesProcessed > nodesProcessedLimit) {
            nodesProcessedLimit += 1000;
            if (suggestionsGenerated < minGen) {
                break;
            }
            minGen += suggestionsGenerated;
            // nodesProcessed >>= 1;
            // suggestionsGenerated >>= 1;
        }
        if (best.c > limit) {
            // break;
            best = pathHeap.dequeue();
            maxSize = Math.max(maxSize, pathHeap.size);
            continue;
        }
        processPath(best);

        for (const sug of resultHeap) {
            ++suggestionsGenerated;
            if (sug.cost > limit) continue;
            // console.log('%o', sug);
            if (sug.word in emitted && emitted[sug.word] <= sug.cost) continue;
            const action = yield sug;
            emitted[sug.word] = sug.cost;
            if (typeof action === 'number') {
                // console.log('%o', { limit, newLimit: action, sug });
                limit = Math.min(action, limit);
            }
            if (typeof action === 'symbol') {
                return;
            }
        }

        best = pathHeap.dequeue();
        maxSize = Math.max(maxSize, pathHeap.size);
    }
    // console.log('%o', { maxSize, suggestionsGenerated, nodesProcessed });

    return;

    function compareSuggestion(a: SuggestionResult, b: SuggestionResult): number {
        const pa = (a.isPreferred && 1) || 0;
        const pb = (b.isPreferred && 1) || 0;
        return (
            pb - pa ||
            a.cost - b.cost ||
            Math.abs(a.word.charCodeAt(0) - srcWord.charCodeAt(0)) -
                Math.abs(b.word.charCodeAt(0) - srcWord.charCodeAt(0))
        );
    }

    function processPath(p: PNode) {
        const len = srcWord.length;

        for (const edge of calcEdges(p)) {
            const c = edge.c;
            // if (srcWord.includes('WALK')) {
            //     console.warn('%o', { word: pNodeToWord(edge), cost: edge.c });
            // }
            if (c > limit) continue;
            if (edge.n.eow && edge.i === len) {
                const word = pNodeToWord(edge);
                const result = { word, cost: c };
                resultHeap.add(result);
            }
            pathHeap.add(edge);
        }
    }

    function* calcEdges(p: PNode): Iterable<PNode> {
        const { n, i, t } = p;
        const keys = n.keys();
        const s = srcWord[i];
        const sg = visMap[s] || 0;
        const cost0 = p.c;
        const cost = cost0 + BC - i + (i ? 0 : opCosts.firstLetterBias);
        const costVis = cost0 + VC;
        const costLegacyCompound = cost0 + opCosts.wordBreak;
        const costCompound = cost0 + opCosts.compound;
        if (s) {
            // Match
            const mIdx = keys.indexOf(s);
            if (mIdx >= 0) {
                const nn = applyCost(t, n.child(mIdx), i + 1, cost0, s, p, '=', s);
                nn && (yield nn);
            }

            // Double letter, delete 1
            const ns = srcWord[i + 1];
            if (s == ns && mIdx >= 0) {
                const nn = applyCost(t, n.child(mIdx), i + 2, cost0 + DL, s, p, 'dd', s);
                nn && (yield nn);
            }
            // Delete
            {
                const nn = applyCost(t, n, i + 1, cost, '', p, 'd', '');
                nn && (yield nn);
            }

            // Replace
            for (let j = 0; j < keys.length; ++j) {
                const ss = keys[j];
                if (j === mIdx || ss in sc) continue;
                const g = visMap[ss] || 0;
                // srcWord === 'WALK' && console.log(g.toString(2));
                const c = sg & g ? costVis : cost;
                const nn = applyCost(t, n.child(j), i + 1, c, ss, p, 'r', ss);
                nn && (yield nn);
            }

            if (n.eow && i) {
                // legacy word compound
                if (compoundMethod) {
                    const nn = applyCost(t, root, i, costLegacyCompound, wordSeparator, p, 'L', wordSeparator);
                    // console.warn('%o', nn && editHistory(nn));
                    nn && (yield nn);
                }
            }

            // swap
            if (ns) {
                const n1 = n.get(ns);
                const n2 = n1?.get(s);
                if (n2) {
                    const ss = ns + s;
                    const nn = applyCost(t, n2, i + 2, cost0 + opCosts.swapCost, ss, p, 's', ss);
                    nn && (yield nn);
                }
            }
        }

        // Natural Compound
        if (compRoot && costCompound <= limit && keys.includes(comp)) {
            if (compRootIgnoreCase) {
                const nn = applyCost(t, compRootIgnoreCase, i, costCompound, '', p, '~+', '~+');
                nn && (yield nn);
            }
            {
                const nn = applyCost(t, compRoot, i, costCompound, '', p, '+', '+');
                nn && (yield nn);
            }
        }

        // Insert
        if (cost <= limit) {
            // At the end of the word, only append is possible.
            for (let j = 0; j < keys.length; ++j) {
                const char = keys[j];
                if (char in sc) continue;
                const nn = applyCost(t, n.child(j), i, cost, char, p, 'i', char);
                nn && (yield nn);
            }
        }
    }
}

function createCostTrie(): CostTrie {
    return { c: [], t: Object.create(null) };
}

/**
 * Apply a cost to the current step.
 * @param t - trie node
 * @param s - letter to apply, empty string means to apply to the current node
 * @param i - index
 * @param c - cost
 * @returns PNode if it was applied, otherwise undefined
 */
function applyCost(
    t: CostTrie,
    n: ITrieNode,
    i: number,
    c: number,
    s: string,
    p: PNode,
    a: string,
    ss: string
): PNode | undefined {
    const tt = ss ? (t.t[ss] ??= createCostTrie()) : t;
    const curr = tt.c[i];
    if (curr <= c) return undefined;
    tt.c[i] = c;
    return { n, i, c, s, p, t: tt, a };
}

function pNodeToWord(p: PNode): string {
    const parts: string[] = [];
    let n: PNode | undefined = p;
    while (n) {
        parts.push(n.s);
        n = n.p;
    }
    parts.reverse();
    return parts.join('');
}

function specialChars(options: TrieOptions): Record<string, true | undefined> {
    const charSet: Record<string, true | undefined> = Object.create(null);
    for (const c of Object.values(options)) {
        charSet[c] = true;
    }
    return charSet;
}

function orderNodes(p: PNode): PNode[] {
    const nodes: PNode[] = [];
    let n: PNode | undefined = p;
    while (n) {
        nodes.push(n);
        n = n.p;
    }
    return nodes.reverse();
}

function editHistory(p: PNode) {
    const nodes = orderNodes(p);
    return nodes.map((n) => ({ i: n.i, c: n.c, a: n.a, s: n.s }));
}

export const __testing__ = {
    comparePath,
    editHistory,
};
