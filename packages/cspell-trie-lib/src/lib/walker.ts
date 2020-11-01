import { TrieNode, ChildMap, TrieRoot } from './TrieNode';

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

/**
 * Ask for the next result.
 * goDeeper of true tells the walker to go deeper in the Trie if possible. Default is true.
 * This can be used to limit the walker's depth.
 */
// next: (goDeeper?: boolean) => IteratorResult<YieldResult>;
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

/**
 * Ask for the next result.
 * goDeeper of true tells the walker to go deeper in the Trie if possible. Default is true.
 * This can be used to limit the walker's depth.
 */
// next: (hinting?: Hinting) => IteratorResult<YieldResult>;
// [Symbol.iterator]: () => HintedWalkerIterator;
export type HintedWalkerIterator = Generator<
    YieldResult,
    any,
    Hinting | undefined
>;

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
export function* hintedWalker(
    root: TrieRoot,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
    hint: string
): HintedWalkerIterator {
    const baseRoot = {
        c: new Map([...root.c].filter((n) => n[0] !== root.compoundCharacter)),
    };

    const roots: { [index: number]: ChildMap | [string, TrieNode][] } = {
        [CompoundWordsMethod.NONE]: [],
        [CompoundWordsMethod.JOIN_WORDS]: [[JOIN_SEPARATOR, baseRoot]],
        [CompoundWordsMethod.SEPARATE_WORDS]: [[WORD_SEPARATOR, baseRoot]],
    };

    const compoundCharacter = root.compoundCharacter;

    interface StackItemEntry {
        letter: string;
        node: TrieNode;
        hintOffset: number;
    }

    type StackItem = IterableIterator<StackItemEntry>;
    type Stack = StackItem[];

    function* children(n: TrieNode, hintOffset: number): StackItem {
        if (n.c) {
            const h =
                hint.slice(hintOffset, hintOffset + 3) +
                hint.slice(Math.max(0, hintOffset - 2), hintOffset);
            const hints = new Set<string>(h);

            // First yield the hints
            yield* [...hints]
                .filter((a) => n.c!.has(a))
                .map((letter) => ({
                    letter,
                    node: n.c!.get(letter)!,
                    hintOffset: hintOffset + 1,
                }));
            // We don't want to suggest the compound character.
            hints.add(compoundCharacter);
            // Then yield everything else.
            yield* [...n.c]
                .filter((a) => !hints.has(a[0]))
                .map(([letter, node]) => ({
                    letter,
                    node,
                    hintOffset: hintOffset + 1,
                }));
            if (n.c.has(compoundCharacter)) {
                const compoundRoot = root.c.get(compoundCharacter);
                if (compoundRoot) {
                    yield* children(compoundRoot, hintOffset);
                }
            }
        }
        if (n.f) {
            yield* [...roots[compoundingMethod]].map(([letter, node]) => ({
                letter,
                node,
                hintOffset,
            }));
        }
    }

    let depth = 0;
    const stack: Stack = [];
    let baseText = '';
    stack[depth] = children(baseRoot, depth);
    let ir: IteratorResult<StackItemEntry, StackItemEntry>;
    while (depth >= 0) {
        while (!(ir = stack[depth].next()).done) {
            const { letter: char, node, hintOffset } = ir.value;
            const text = baseText + char;
            const hinting = (yield { text, node, depth }) as Hinting;
            if (hinting && hinting.goDeeper) {
                depth++;
                baseText = text;
                stack[depth] = children(node, hintOffset);
            }
        }
        depth -= 1;
        baseText = baseText.slice(0, -1);
    }
}
