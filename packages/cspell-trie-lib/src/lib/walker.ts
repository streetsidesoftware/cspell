import { TrieNode, ChildMap, TrieRoot } from './TrieNode';

export const JOIN_SEPARATOR: string = '+';
export const WORD_SEPARATOR: string = ' ';

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

export interface WalkerIterator extends Generator<YieldResult, any, boolean | undefined> {
    /**
     * Ask for the next result.
     * goDeeper of true tells the walker to go deeper in the Trie if possible. Default is true.
     * This can be used to limit the walker's depth.
     */
    // next: (goDeeper?: boolean) => IteratorResult<YieldResult>;
}

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
export function* walker(
    root: TrieNode,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,

): WalkerIterator {

    const roots: { [index: number]: ChildMap | [string, TrieNode][] } = {
        [CompoundWordsMethod.NONE]: [],
        [CompoundWordsMethod.JOIN_WORDS]: [[JOIN_SEPARATOR, root]],
        [CompoundWordsMethod.SEPARATE_WORDS]: [[WORD_SEPARATOR, root]],
    };


    function* children(n: TrieNode): IterableIterator<[string, TrieNode]> {
        if (n.c) {
            yield *n.c;
        }
        if (n.f) {
            yield *roots[compoundingMethod];
        }
    }

    let depth = 0;
    const stack: {t: string, c: Iterator<[string, TrieNode]>}[] = [];
    stack[depth] = {t: '', c: children(root)};
    let ir: IteratorResult<[string, TrieNode]>;
    while (depth >= 0) {
        let baseText = stack[depth].t;
        while (!(ir = stack[depth].c.next()).done) {
            const [char, node] = ir.value;
            const text = baseText + char;
            const goDeeper = (yield { text, node, depth });
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

export interface HintedWalkerIterator extends Generator<YieldResult, any, Hinting | undefined> {
    /**
     * Ask for the next result.
     * goDeeper of true tells the walker to go deeper in the Trie if possible. Default is true.
     * This can be used to limit the walker's depth.
     */
    // next: (hinting?: Hinting) => IteratorResult<YieldResult>;
    // [Symbol.iterator]: () => HintedWalkerIterator;
}

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
export function* hintedWalker(
    root: TrieRoot,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
    hint: string,
): HintedWalkerIterator {

    const baseRoot = { c: new Map([...root.c].filter(n => n[0] !== root.compoundCharacter)) };

    const roots: { [index: number]: ChildMap | [string, TrieNode][] } = {
        [CompoundWordsMethod.NONE]: [],
        [CompoundWordsMethod.JOIN_WORDS]: [[JOIN_SEPARATOR, baseRoot]],
        [CompoundWordsMethod.SEPARATE_WORDS]: [[WORD_SEPARATOR, baseRoot]],
    };

    const compoundCharacter = root.compoundCharacter;

    function* children(n: TrieNode, depth: number): IterableIterator<[string, TrieNode]> {
        if (n.c) {
            const h = hint.slice(depth, depth + 3) + hint.slice(Math.max(0, depth - 2), depth);
            const hints = new Set<string>(h);

            // First yield the hints
            yield* [...hints].filter(a => n.c!.has(a)).map(a => [a, n.c!.get(a)!] as [string, TrieNode]);
            // We don't want to suggest the compound character.
            hints.add(compoundCharacter);
            // Then yield everything else.
            yield* [...n.c].filter(a => !hints.has(a[0]));
            if (n.c.has(compoundCharacter)) {
                const compoundRoot = root.c.get(compoundCharacter);
                if (compoundRoot) {
                    yield *children(compoundRoot, depth);
                }
            }
        }
        if (n.f) {
            yield* roots[compoundingMethod];
        }
    }

    let depth = 0;
    const stack: Iterator<[string, TrieNode]>[] = [];
    let baseText = '';
    stack[depth] = children(baseRoot, depth);
    let ir: IteratorResult<[string, TrieNode]>;
    while (depth >= 0) {
        while (!(ir = stack[depth].next()).done) {
            const [char, node] = ir.value;
            const text = baseText + char;
            const hinting = (yield { text, node, depth }) as Hinting;
            if (hinting && hinting.goDeeper) {
                depth++;
                baseText = text;
                stack[depth] = children(node, depth);
            }
        }
        depth -= 1;
        baseText = baseText.slice(0, -1);
    }
}
