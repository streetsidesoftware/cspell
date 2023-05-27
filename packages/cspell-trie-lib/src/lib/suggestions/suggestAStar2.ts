import type { ITrieNode, TrieOptions } from '../ITrieNode/index.js';
import { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from '../ITrieNode/walker/index.js';
import type { TrieData } from '../TrieData.js';
import { PairingHeap } from '../utils/PairingHeap.js';
import { opCosts } from './constants.js';
import type { GenSuggestionOptionsStrict, SuggestionOptions } from './genSuggestionsOptions.js';
import { createSuggestionOptions } from './genSuggestionsOptions.js';
import type { SuggestionGenerator, SuggestionResult } from './suggestCollector.js';
import { suggestionCollector } from './suggestCollector.js';

type Cost = number;
// type BranchIdx = number;
type WordIndex = number;

interface PNode {
    n: ITrieNode;
    c: Cost;
    i: WordIndex;
    s: string;
    p?: PNode | undefined;
}

const ProgressFactor = opCosts.baseCost + 1;

/**
 * Compare Path Nodes.
 * Balance the calculation between depth vs cost
 * Slightly prefer depth over lower cost.
 */
function comparePath(a: PNode, b: PNode): number {
    return a.c - b.c + (b.i - a.i) * ProgressFactor;
}

export function suggestAStar(trie: TrieData, word: string, options: SuggestionOptions): SuggestionResult[] {
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
    word: string,
    options: GenSuggestionOptionsStrict
): SuggestionGenerator {
    const root = trie.getRoot();
    const { compoundMethod } = options;
    const pathHeap = new PairingHeap(comparePath);
    const resultHeap = new PairingHeap(compareSuggestion);
    const rootPNode: PNode = { n: root, i: 0, c: 0, s: '' };
    const BC = opCosts.baseCost;
    const DL = opCosts.duplicateLetterCost;
    const wordSeparator = compoundMethod === CompoundWordsMethod.JOIN_WORDS ? JOIN_SEPARATOR : WORD_SEPARATOR;
    const sc = specialChars(trie.options);
    const comp = trie.options.compoundCharacter;
    const compRoot = root.get(comp);

    let limit = options.changeLimit * BC;

    pathHeap.add(rootPNode);

    let best = pathHeap.dequeue();
    let maxSize = pathHeap.size;
    let suggestionsGenerated = 0;
    let nodesProcessed = 0;
    while (best) {
        if (++nodesProcessed > 1000) {
            if (suggestionsGenerated < 1) {
                break;
            }
            nodesProcessed >>= 1;
            suggestionsGenerated >>= 1;
        }
        if (best.c > limit) {
            // break;
            best = pathHeap.dequeue();
            maxSize = Math.max(maxSize, pathHeap.size);
            continue;
        }
        processPath(best);

        for (const sug of resultHeap) {
            if (sug.cost > limit) continue;
            const action = yield sug;
            ++suggestionsGenerated;
            if (typeof action === 'number') {
                limit = action;
                // console.log('%o', limit);
            }
            if (typeof action === 'symbol') {
                return;
            }
        }

        best = pathHeap.dequeue();
        maxSize = Math.max(maxSize, pathHeap.size);
    }
    console.log('%o', { maxSize, suggestionsGenerated, nodesProcessed });

    return;

    function compareSuggestion(a: SuggestionResult, b: SuggestionResult): number {
        const pa = (a.isPreferred && 1) || 0;
        const pb = (b.isPreferred && 1) || 0;
        return (
            pb - pa ||
            a.cost - b.cost ||
            Math.abs(a.word.charCodeAt(0) - word.charCodeAt(0)) - Math.abs(b.word.charCodeAt(0) - word.charCodeAt(0))
        );
    }

    function processPath(p: PNode) {
        const len = word.length;

        for (const edge of calcEdges(p)) {
            const c = edge.c;
            if (c > limit) continue;
            if (edge.n.eow && edge.i === len) {
                const word = pNodeToWord(edge);
                const result = { word, cost: c };
                // console.log('%o', result);
                resultHeap.add(result);
            }
            pathHeap.add(edge);
        }
    }

    function* calcEdges(p: PNode): Iterable<PNode> {
        const { n, i } = p;
        const keys = n.keys();
        const s = word[i];
        const cost0 = p.c;
        const cost = cost0 + BC + (i ? 0 : opCosts.firstLetterBias);
        if (s) {
            // Match
            const mIdx = keys.indexOf(s);
            if (mIdx >= 0) {
                yield { n: n.child(mIdx), i: i + 1, c: cost0, s, p };
            }
            // Delete
            const ns = word[i + 1];
            const dCost = s === ns ? cost0 + DL : cost;
            yield { n, i: i + 1, c: dCost, s: '', p };

            // Replace
            for (let j = 0; j < keys.length; ++j) {
                if (j === mIdx || keys[j] in sc) continue;
                yield { n: n.child(j), i: i + 1, c: cost, s: keys[j], p };
            }

            if (n.eow && i) {
                // delete suffix
                if (i < word.length - 1) {
                    yield { n, i: word.length, c: (word.length - i) * BC + cost0, s: '', p };
                }
                // legacy word compound
                if (compoundMethod) {
                    yield { n: root, i, c: cost0 + opCosts.wordBreak, s: wordSeparator, p };
                }
            }

            // swap
            if (ns) {
                const n1 = n.get(ns);
                const n2 = n1?.get(s);
                if (n2) {
                    yield { n: n2, i: i + 2, c: cost0 + opCosts.swapCost, s: ns + s, p };
                }
            }
        }

        // Insert
        {
            // At the end of the word, only append is possible.
            for (let j = 0; j < keys.length; ++j) {
                const char = keys[j];
                if (char in sc) {
                    if (char === comp && compRoot) {
                        yield { n: compRoot, i, c: cost0 + opCosts.wordBreak, s: '', p };
                    }
                    continue;
                }
                yield { n: n.child(j), i, c: cost, s: keys[j], p };
            }
        }
    }
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
