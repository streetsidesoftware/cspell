import {Sequence, genSequence} from 'gensequence';
import {TrieNode, FLAG_WORD, ChildMap} from './TrieNode';

export function insert(text: string, node: TrieNode = {}): TrieNode {
    if (text.length) {
        const head = text[0];
        const tail = text.slice(1);
        node.c = node.c || new ChildMap();
        node.c.set(head, insert(tail, node.c.get(head)));
    } else {
        node.f = (node.f || 0) | FLAG_WORD;
    }
    return node;
}

export function isWordTerminationNode(node: TrieNode) {
    return ((node.f || 0) & FLAG_WORD) === FLAG_WORD;
}

/**
 * Sorts the nodes in a trie in place.
 */
export function orderTrie(node: TrieNode) {
    if (!node.c) return;

    const nodes = [...node.c].sort(([a], [b]) => a < b ? -1 : 1);
    node.c = new Map(nodes);
    for (const n of node.c) {
        orderTrie(n[1]);
    }
}

export interface YieldResult {
    text: string;
    node: TrieNode;
    depth: number;
}

/**
 * Generator an iterator that will walk the Trie parent then children in a depth first fashion that preserves sorted order.
 */
export function walk(node: TrieNode): Sequence<YieldResult> {
    return genSequence(walker(node));
}

export const iterateTrie = walk;

/**
 * Generate a Iterator that can walk a Trie and yield the words.
 */
export function iteratorTrieWords(node: TrieNode): Sequence<string> {
    return walk(node)
        .filter(r => isWordTerminationNode(r.node))
        .map(r => r.text);
}


export interface WalkerIterator extends IterableIterator<YieldResult> {
    /**
     * Ask for the next result.
     * goDeeper of true tells the walker to go deeper in the Trie if possible. Default is true.
     * This can be used to limit the walker's depth.
     */
    next: (goDeeper?: boolean) => IteratorResult<YieldResult>;
    [Symbol.iterator]: () => WalkerIterator;
}

export enum CompoundWordsMethod {
    /**
     * Do not compound words.
     */
    NONE = 0,
    /**
     * Create word compounds separated by spaces.
     */
    SEPARATE_WORDS,
    /**
     * Create word compounds without separation.
     */
    JOIN_WORDS,
}

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
export function* walker(root: TrieNode, compoundingMethod?: CompoundWordsMethod): WalkerIterator {

    const compoundRoot: Map<string, TrieNode> | [string, TrieNode][] = compoundingMethod
        ? (compoundingMethod == CompoundWordsMethod.JOIN_WORDS ? root.c || [] : [[' ', root]])
        : [];
    const head = new Map<string, TrieNode>(compoundRoot);

    function* children(n: TrieNode) {
        if (n.c) {
            yield *n.c;
        }
        if (n.f) {
            yield *head;
        }
    }

    let depth = 0;
    const stack: Iterator<[string, TrieNode]>[] = [];
    let baseText = '';
    stack[depth] = ((root.c || [])[Symbol.iterator])();
    let ir: IteratorResult<[string, TrieNode]>;
    while (depth >= 0) {
        while (!(ir = stack[depth].next()).done) {
            const [char, node] = ir.value;
            const text = baseText + char;
            const goDeeper = yield { text, node, depth } as YieldResult;
            if (goDeeper === undefined || goDeeper) {
                depth++;
                baseText = text;
                stack[depth] = children(node);
            }
        }
        depth -= 1;
        baseText = baseText.slice(0, -1);
    }
}

export function createRoot(): TrieNode {
    return {};
}

export function createTriFromList(words: Iterable<string>): TrieNode {
    const root = createRoot();
    for (const word of words) {
        insert(word, root);
    }
    return root;
}
