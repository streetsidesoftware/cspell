import { isDefined } from '../../utils/isDefined.js';
import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode.js';
import type { YieldResult } from './walkerTypes.js';
import { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from './walkerTypes.js';

/**
 * Ask for the next result.
 * goDeeper of true tells the walker to go deeper in the Trie if possible. Default is true.
 * This can be used to limit the walker's depth.
 */
// next: (hinting?: Hinting) => IteratorResult<YieldResult>;
// [Symbol.iterator]: () => HintedWalkerIterator;
export type HintedWalkerIterator = Generator<YieldResult, void, Hinting | undefined>;

export function hintedWalker(
    root: ITrieNodeRoot,
    ignoreCase: boolean,
    hint: string,
    compoundingMethod: CompoundWordsMethod | undefined,
    emitWordSeparator?: string,
): HintedWalkerIterator {
    return hintedWalkerNext(root, ignoreCase, hint, compoundingMethod, emitWordSeparator);
}

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
function* hintedWalkerNext(
    root: ITrieNodeRoot,
    ignoreCase: boolean,
    hint: string,
    compoundingMethod: CompoundWordsMethod | undefined,
    emitWordSeparator = '',
): HintedWalkerIterator {
    const _compoundingMethod = compoundingMethod ?? CompoundWordsMethod.NONE;
    const trieInfo = root.info;

    const compoundCharacter = trieInfo.compoundCharacter;
    const noCaseCharacter = trieInfo.stripCaseAndAccentsPrefix;

    const rawRoots = [root, ignoreCase ? root.get(noCaseCharacter) : undefined].filter(isDefined);

    const specialRootsPrefix = existMap([compoundCharacter, noCaseCharacter, trieInfo.forbiddenWordPrefix]);
    function filterRoot(root: ITrieNode): ITrieNode {
        return new ITrieNodeFiltered(root, ([v]) => !(v in specialRootsPrefix));
    }

    const roots = rawRoots.map(filterRoot);
    const compoundRoots = rawRoots.map((r) => r.get(compoundCharacter)).filter(isDefined);
    const setOfCompoundRoots = new Set(compoundRoots);
    const rootsForCompoundMethods = [...roots, ...compoundRoots];

    const compoundMethodRoots: { [index: number]: readonly (readonly [string, ITrieNode])[] } = {
        [CompoundWordsMethod.NONE]: [],
        [CompoundWordsMethod.JOIN_WORDS]: [...rootsForCompoundMethods.map((r) => [JOIN_SEPARATOR, r] as const)],
        [CompoundWordsMethod.SEPARATE_WORDS]: [...rootsForCompoundMethods.map((r) => [WORD_SEPARATOR, r] as const)],
    };

    interface StackItemEntry {
        letter: string;
        node: ITrieNode;
        hintOffset: number;
    }

    type StackItem = IterableIterator<StackItemEntry>;
    type Stack = StackItem[];

    function* children(n: ITrieNode, hintOffset: number): StackItem {
        if (n.hasChildren()) {
            const h = hint.slice(hintOffset, hintOffset + 3) + hint.slice(Math.max(0, hintOffset - 2), hintOffset);
            const hints = new Set<string>(h);

            // First yield the hints
            yield* [...hints]
                .map((a) => [a, n.get(a)] as const)
                .map(
                    ([letter, node]) =>
                        node && {
                            letter,
                            node,
                            hintOffset: hintOffset + 1,
                        },
                )
                .filter(isDefined);
            // We don't want to suggest the compound character.
            hints.add(compoundCharacter);
            // Then yield everything else.
            yield* n
                .entries()
                .filter((a) => !hints.has(a[0]))
                .map(([letter, node]) => ({
                    letter,
                    node,
                    hintOffset: hintOffset + 1,
                }));
            if (n.has(compoundCharacter) && !setOfCompoundRoots.has(n)) {
                for (const compoundRoot of compoundRoots) {
                    for (const child of children(compoundRoot, hintOffset)) {
                        const { letter, node, hintOffset } = child;
                        yield { letter: emitWordSeparator + letter, node, hintOffset };
                    }
                }
            }
        }
        if (n.eow) {
            yield* [...compoundMethodRoots[_compoundingMethod]].map(([letter, node]) => ({
                letter: letter,
                node,
                hintOffset,
            }));
        }
    }

    for (const root of roots) {
        let depth = 0;
        const stack: Stack = [];
        const stackText: string[] = [''];
        stack[depth] = children(root, depth);
        let ir: IteratorResult<StackItemEntry, StackItemEntry>;
        while (depth >= 0) {
            while (!(ir = stack[depth].next()).done) {
                const { letter: char, node, hintOffset } = ir.value;
                const text = stackText[depth] + char;
                const hinting = (yield { text, node, depth }) as Hinting;
                if (hinting && hinting.goDeeper) {
                    depth++;
                    stackText[depth] = text;
                    stack[depth] = children(node, hintOffset);
                }
            }
            depth -= 1;
        }
    }
}

export interface Hinting {
    goDeeper: boolean;
}

function existMap(values: string[]): Record<string, true> {
    const m: Record<string, true> = Object.create(null);
    for (const v of values) {
        m[v] = true;
    }
    return m;
}

export const __testing__ = {
    hintedWalkerNext,
};

class ITrieNodeFiltered implements ITrieNode {
    readonly id: ITrieNodeId;
    readonly eow: boolean;
    readonly size: number;
    private filtered: (readonly [string, number])[];
    private keyMap: Map<string, number>;

    constructor(
        private srcNode: ITrieNode,
        predicate: (key: string, idx: number, srcNode: ITrieNode) => boolean,
    ) {
        this.id = srcNode.id;
        this.eow = srcNode.eow;
        const keys = srcNode.keys();
        this.filtered = keys
            .map((key, idx) => [key, idx] as const)
            .filter(([key, idx]) => predicate(key, idx, srcNode));
        this.keyMap = new Map(this.filtered);
        this.size = this.keyMap.size;
    }

    keys(): readonly string[] {
        return [...this.keyMap.keys()];
    }

    values(): readonly ITrieNode[] {
        return this.filtered.map(([_, idx]) => this.srcNode.child(idx));
    }

    child(idx: number): ITrieNode {
        const [_, srcIdx] = this.filtered[idx];
        return this.srcNode.child(srcIdx);
    }

    entries(): readonly (readonly [string, ITrieNode])[] {
        return this.filtered.map(([key, idx]) => [key, this.srcNode.child(idx)] as const);
    }

    has(char: string): boolean {
        return this.keyMap.has(char);
    }

    hasChildren(): boolean {
        return this.size > 0;
    }

    get(char: string): ITrieNode | undefined {
        const idx = this.keyMap.get(char);
        if (idx === undefined) return undefined;
        return this.srcNode.child(idx);
    }
}
