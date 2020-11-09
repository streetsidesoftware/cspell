import { TrieNode, ChildMap } from './TrieNode';

export const JOIN_SEPARATOR = '+';
export const WORD_SEPARATOR = ' ';

export interface YieldResult {
    text: string;
    node: TrieNode;
    depth: number;
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

export type WalkerIterator = Generator<YieldResult, any, boolean | undefined>;

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
export function* walker(
    root: TrieNode,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE
): WalkerIterator {
    const roots: { [index: number]: ChildMap | [string, TrieNode][] } = {
        [CompoundWordsMethod.NONE]: [],
        [CompoundWordsMethod.JOIN_WORDS]: [[JOIN_SEPARATOR, root]],
        [CompoundWordsMethod.SEPARATE_WORDS]: [[WORD_SEPARATOR, root]],
    };

    function* children(n: TrieNode): IterableIterator<[string, TrieNode]> {
        if (n.c) {
            yield* n.c;
        }
        if (n.f) {
            yield* roots[compoundingMethod];
        }
    }

    let depth = 0;
    const stack: { t: string; c: Iterator<[string, TrieNode]> }[] = [];
    stack[depth] = { t: '', c: children(root) };
    let ir: IteratorResult<[string, TrieNode]>;
    while (depth >= 0) {
        let baseText = stack[depth].t;
        while (!(ir = stack[depth].c.next()).done) {
            const [char, node] = ir.value;
            const text = baseText + char;
            const goDeeper = yield { text, node, depth };
            if (goDeeper || goDeeper === undefined) {
                depth++;
                baseText = text;
                stack[depth] = { t: text, c: children(node) };
            }
        }
        depth -= 1;
    }
}

export interface Hinting {
    goDeeper: boolean;
}

export type HintedWalkerIterator = Generator<YieldResult, any, Hinting | undefined>;

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
export function* hintedWalker(
    root: TrieNode,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
    hint: string
): HintedWalkerIterator {
    const roots: { [index: number]: ChildMap | [string, TrieNode][] } = {
        [CompoundWordsMethod.NONE]: [],
        [CompoundWordsMethod.JOIN_WORDS]: [[JOIN_SEPARATOR, root]],
        [CompoundWordsMethod.SEPARATE_WORDS]: [[WORD_SEPARATOR, root]],
    };

    const hints = new Set(hint.slice(0, 5));

    function* children(n: TrieNode): IterableIterator<[string, TrieNode]> {
        if (n.c) {
            // First yield the hints
            yield* [...hints].filter((a) => n.c!.has(a)).map((a) => [a, n.c!.get(a)!] as [string, TrieNode]);
            // Then yield everything else.
            yield* [...n.c].filter((a) => !hints.has(a[0]));
        }
        if (n.f) {
            yield* roots[compoundingMethod];
        }
    }

    let depth = 0;
    const stack: Iterator<[string, TrieNode]>[] = [];
    let baseText = '';
    stack[depth] = children(root);
    let ir: IteratorResult<[string, TrieNode]>;
    while (depth >= 0) {
        while (!(ir = stack[depth].next()).done) {
            const [char, node] = ir.value;
            const text = baseText + char;
            const hinting = (yield { text, node, depth }) as Hinting;
            if (hinting && hinting.goDeeper) {
                depth++;
                baseText = text;
                stack[depth] = children(node);
            }
        }
        depth -= 1;
        baseText = baseText.slice(0, -1);
    }
}
