import type { Trie } from './trie';
import type { TrieNode } from './TrieNode';

export interface WalkItem {
    /** prefix so far */
    s: string;
    n: TrieNode;
    /** compound depth */
    d: number;
    /** true iff compound edge */
    c: boolean;
}

export type WalkNext = boolean;

/**
 *
 * Depth first walk of a compound trie.
 * If there are compounds, this becomes an infinite iterator.
 * Use i.next(false) to prevent the walker from going deeper into the trie.
 *
 * @param trie the compound Trie to walk
 */
export function* compoundWalker(trie: Trie, caseSensitive = true): Generator<WalkItem, void, WalkNext> {
    const { compoundCharacter: cc, forbiddenWordPrefix: forbidden, stripCaseAndAccentsPrefix } = trie.options;
    const blockNode = new Set([cc, forbidden, stripCaseAndAccentsPrefix]);
    const root = (!caseSensitive && trie.root.c?.get(stripCaseAndAccentsPrefix)) || trie.root;

    function* walk(n: TrieNode, s: string, c: boolean, d: number): Generator<WalkItem, void, WalkNext> {
        const deeper = yield { n, s, c, d };
        if (deeper !== false && n.c) {
            for (const [k, cn] of n.c) {
                if (blockNode.has(k)) continue;
                yield* walk(cn, s + k, false, d);
            }
            if (n.c.has(cc)) {
                const compoundNodes = root.c?.get(cc);
                if (compoundNodes) {
                    yield* walk(compoundNodes, s, true, d + 1);
                }
            }
        }
    }

    // Make sure we do not walk forbidden and compound only words from the root.
    for (const n of root.c || []) {
        if (!blockNode.has(n[0])) {
            yield* walk(n[1], n[0], false, 0);
        }
    }
}

/**
 *
 * @param trie Trie to walk
 * @param maxDepth Max compound depth
 * @param caseSensitive case sensitive search.
 */
export function* compoundWords(trie: Trie, maxDepth: number, caseSensitive = true): Generator<string, void, unknown> {
    const stream = compoundWalker(trie, caseSensitive);
    let item = stream.next();
    while (!item.done) {
        const { n, s, d } = item.value;
        if (d >= maxDepth) {
            item = stream.next(false);
            continue;
        }
        if (n.f) {
            yield s;
        }
        item = stream.next();
    }
}
