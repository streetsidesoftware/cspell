import type { TrieCost, WeightMap } from '../distance/weightedMaps.js';
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
    const collector = suggestionCollector(word, opts);
    collector.collect(getSuggestionsAStar(trie, word, opts));
    return collector.suggestions;
}

export function* getSuggestionsAStar(
    trie: TrieData,
    srcWord: string,
    options: SuggestionOptions = {}
): SuggestionGenerator {
    const { compoundMethod, changeLimit, ignoreCase, weightMap } = createSuggestionOptions(options);
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
            if (sug.word in emitted && emitted[sug.word] <= sug.cost) continue;
            // console.warn('%o', sug);
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

        if (p.n.eow && p.i === len) {
            const word = pNodeToWord(p);
            const result = { word, cost: p.c };
            resultHeap.add(result);
        }

        calcEdges(p);
    }

    function calcEdges(p: PNode): void {
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
                storePath(t, n.child(mIdx), i + 1, cost0, s, p, '=', s);
            }

            if (weightMap) {
                processWeightMapEdges(p, weightMap);
            }

            // Double letter, delete 1
            const ns = srcWord[i + 1];
            if (s == ns && mIdx >= 0) {
                storePath(t, n.child(mIdx), i + 2, cost0 + DL, s, p, 'dd', s);
            }
            // Delete
            storePath(t, n, i + 1, cost, '', p, 'd', '');

            // Replace
            for (let j = 0; j < keys.length; ++j) {
                const ss = keys[j];
                if (j === mIdx || ss in sc) continue;
                const g = visMap[ss] || 0;
                // srcWord === 'WALK' && console.log(g.toString(2));
                const c = sg & g ? costVis : cost;
                storePath(t, n.child(j), i + 1, c, ss, p, 'r', ss);
            }

            if (n.eow && i) {
                // legacy word compound
                if (compoundMethod) {
                    storePath(t, root, i, costLegacyCompound, wordSeparator, p, 'L', wordSeparator);
                }
            }

            // swap
            if (ns) {
                const n1 = n.get(ns);
                const n2 = n1?.get(s);
                if (n2) {
                    const ss = ns + s;
                    storePath(t, n2, i + 2, cost0 + opCosts.swapCost, ss, p, 's', ss);
                }
            }
        }

        // Natural Compound
        if (compRoot && costCompound <= limit && keys.includes(comp)) {
            if (compRootIgnoreCase) {
                storePath(t, compRootIgnoreCase, i, costCompound, '', p, '~+', '~+');
            }
            storePath(t, compRoot, i, costCompound, '', p, '+', '+');
        }

        // Insert
        if (cost <= limit) {
            // At the end of the word, only append is possible.
            for (let j = 0; j < keys.length; ++j) {
                const char = keys[j];
                if (char in sc) continue;
                storePath(t, n.child(j), i, cost, char, p, 'i', char);
            }
        }
    }

    function processWeightMapEdges(p: PNode, weightMap: WeightMap) {
        delLetters(p, weightMap, srcWord, storePath);
        insLetters(p, weightMap, srcWord, storePath);
        repLetters(p, weightMap, srcWord, storePath);
        return;
    }

    /**
     * Apply a cost to the current step.
     * @param t - trie node
     * @param s - letter to apply, empty string means to apply to the current node
     * @param i - index
     * @param c - cost
     * @returns PNode if it was applied, otherwise undefined
     */
    function storePath(
        t: CostTrie,
        n: ITrieNode,
        i: number,
        c: number,
        s: string,
        p: PNode,
        a: string,
        ss: string
    ): void {
        const tt = getCostTrie(t, ss);
        const curr = tt.c[i];
        if (curr <= c || c > limit) return undefined;
        tt.c[i] = c;
        pathHeap.add({ n, i, c, s, p, t: tt, a });
    }
}

function delLetters(pNode: PNode, weightMap: WeightMap, word: string, storePath: FnStorePath) {
    const { t, n } = pNode;
    const trie = weightMap.insDel;
    let ii = pNode.i;
    const cost0 = pNode.c - pNode.i;

    const len = word.length;

    for (let nn = trie.n; ii < len && nn; ) {
        const tt = nn[word[ii]];
        if (!tt) return;
        ++ii;
        if (tt.c !== undefined) {
            storePath(t, n, ii, cost0 + tt.c, '', pNode, 'd', '');
        }
        nn = tt.n;
    }
}

function insLetters(p: PNode, weightMap: WeightMap, _word: string, storePath: FnStorePath) {
    const { t, i, c, n } = p;
    const cost0 = c + i;

    searchTrieCostNodesMatchingTrie2(weightMap.insDel, n, (s, tc, n) => {
        if (tc.c !== undefined) {
            storePath(t, n, i, cost0 + tc.c, s, p, 'i', s);
        }
    });
}

function repLetters(pNode: PNode, weightMap: WeightMap, word: string, storePath: FnStorePath) {
    const node = pNode.n;
    const t = pNode.t;
    const cost0 = pNode.c - pNode.i;
    const remove = searchTrieCostNodesMatchingWord(weightMap.replace, word, pNode.i);
    for (const r of remove) {
        const tInsert = r.t.t;
        if (!tInsert) continue;
        const i = r.i;
        for (const ins of searchTrieCostNodesMatchingTrie<TrieCost>(tInsert, node)) {
            const { n, s, t: tt } = ins;
            const c = tt.c;
            if (c === undefined) {
                continue;
            }
            storePath(t, n, i, cost0 + c + (tt.p || 0), s, pNode, 'r', s);
        }
    }
}

function* searchTrieCostNodesMatchingWord<T extends { n?: Record<string, T> }>(trie: T, word: string, i: number) {
    const len = word.length;

    for (let n = trie.n; i < len && n; ) {
        const t = n[word[i]];
        if (!t) return;
        ++i;
        yield { i, t };
        n = t.n;
    }
}

function createCostTrie(): CostTrie {
    return { c: [], t: Object.create(null) };
}

function getCostTrie(t: CostTrie, s: string) {
    if (s.length == 1) {
        return (t.t[s] ??= createCostTrie());
    }
    if (!s) {
        return t;
    }
    let tt = t;
    for (const c of [...s]) {
        tt = tt.t[c] ??= createCostTrie();
    }
    return tt;
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

interface SearchMatchingTrie<T> {
    s: string;
    t: T;
    n: ITrieNode;
}

function* searchTrieCostNodesMatchingTrie<T extends { n?: Record<string, T> }>(
    trie: T,
    node: ITrieNode,
    s = ''
): Iterable<SearchMatchingTrie<T>> {
    const n = trie.n;
    if (!n) return;
    const keys = node.keys();
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const t = n[key];
        if (!t) continue;
        const c = node.child(i);
        const pfx = s + key;
        yield { s: pfx, t, n: c };
        yield* searchTrieCostNodesMatchingTrie(t, c, pfx);
    }
}

function searchTrieCostNodesMatchingTrie2<T extends { n?: Record<string, T> }>(
    trie: T,
    node: ITrieNode,
    emit: (s: string, t: T, n: ITrieNode) => void,
    s = ''
): void {
    const n = trie.n;
    if (!n) return;
    const keys = node.keys();
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const t = n[key];
        if (!t) continue;
        const c = node.child(i);
        const pfx = s + key;
        emit(pfx, t, c);
        searchTrieCostNodesMatchingTrie2(t, c, emit, pfx);
    }
}

function prefixLines(content: string, prefix: string): string {
    return content
        .split('\n')
        .map((line) => prefix + line)
        .join('\n');
}

function serializeCostTrie(p: PNode): string {
    while (p.p) {
        p = p.p;
    }
    return _serializeCostTrie(p.t);
}

function _serializeCostTrie(t: CostTrie): string {
    const lines: string[] = [];
    lines.push(`:: [${t.c.join()}]`);
    for (const [letter, child] of Object.entries(t.t)) {
        lines.push(letter + ':');
        if (!child) continue;
        lines.push(prefixLines(_serializeCostTrie(child), '| '));
    }
    return lines.join('\n');
}

type FnStorePath = (
    t: CostTrie,
    n: ITrieNode,
    i: number,
    c: number,
    s: string,
    p: PNode,
    a: string,
    ss: string
) => void;

export const __testing__ = {
    comparePath,
    editHistory,
    serializeCostTrie,
};
