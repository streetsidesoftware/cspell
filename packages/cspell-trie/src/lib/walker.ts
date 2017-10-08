import {TrieNode, ChildMap} from './TrieNode';

export interface YieldResult {
    text: string;
    node: TrieNode;
    depth: number;
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
export function* walker(
    root: TrieNode,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
): WalkerIterator {

        const roots: { [index: number]: ChildMap | [string, TrieNode][] } = {
            [CompoundWordsMethod.NONE]: [],
            [CompoundWordsMethod.JOIN_WORDS]: [['+', root]],
            [CompoundWordsMethod.SEPARATE_WORDS]: [[' ', root]],
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
        const stack: Iterator<[string, TrieNode]>[] = [];
        let baseText = '';
        stack[depth] = children(root);
        let ir: IteratorResult<[string, TrieNode]>;
        while (depth >= 0) {
            while (!(ir = stack[depth].next()).done) {
                const [char, node] = ir.value;
                const text = baseText + char;
                const goDeeper = (yield { text, node, depth });
                if (goDeeper || goDeeper === undefined) {
                    depth++;
                    baseText = text;
                    stack[depth] = children(node);
                }
            }
            depth -= 1;
            baseText = baseText.slice(0, -1);
        }
    }

