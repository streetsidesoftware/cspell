import type { ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import type { TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { StringTable } from '../StringTable/StringTable.ts';
import type { TrieDataFundamentals } from '../TrieData.ts';
import type { FastTrieBlobInternals } from './FastTrieBlobInternals.ts';
import { assertSorted, sortNodes } from './FastTrieBlobInternals.ts';
import { TrieBlob } from './TrieBlob.ts';
import {
    NodeChildIndexRefShift,
    NodeHeaderNumChildrenMask,
    NodeMaskCharByte,
    type TrieBlobNode32,
} from './TrieBlobFormat.ts';
import { Utf8Accumulator } from './Utf8.ts';

type FastTrieBlobNode = TrieBlobNode32;

const checkSorted = false;

export class FastTrieBlob implements TrieDataFundamentals {
    #iTrieRoot: ITrieNodeRoot | undefined;
    #nodes: FastTrieBlobNode[];
    #stringTable: StringTable;
    #trieBlob: TrieBlob | undefined;
    readonly info: Readonly<TrieInfo>;

    private constructor(nodes: FastTrieBlobNode[], stringTable: StringTable, info: Readonly<TrieInfo>) {
        this.#nodes = nodes;
        this.#stringTable = stringTable;
        this.info = info;

        if (checkSorted) {
            assertSorted(this.#nodes, NodeMaskCharByte);
        }
    }

    get stringTable(): StringTable {
        return this.#stringTable;
    }

    toTrieBlob(): TrieBlob {
        this.#trieBlob ||= this.#toTrieBlob();
        return this.#trieBlob;
    }

    #toTrieBlob(): TrieBlob {
        const nodeMaskChildCharIndex = NodeMaskCharByte;
        const nodeChildRefShift = NodeChildIndexRefShift;
        const nodes = this.#nodes;
        function calcNodeToIndex(nodes: FastTrieBlobNode[]): number[] {
            let offset = 0;
            const idx: number[] = Array(nodes.length + 1);
            for (let i = 0; i < nodes.length; ++i) {
                idx[i] = offset;
                offset += nodes[i].length;
            }
            idx[nodes.length] = offset;
            return idx;
        }

        const nodeToIndex = calcNodeToIndex(nodes);
        const nodeElementCount = nodeToIndex[nodeToIndex.length - 1];
        const binNodes = new Uint32Array(nodeElementCount);
        const lenShift = TrieBlob.NodeMaskNumChildrenShift;
        const refShift = TrieBlob.NodeChildRefShift;

        let offset = 0;
        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i];
            // assert(offset === nodeToIndex[i]);
            binNodes[offset++] = ((node.length - 1) << lenShift) | (node[0] & ~NodeHeaderNumChildrenMask);
            for (let j = 1; j < node.length; ++j) {
                const v = node[j];
                const nodeRef = v >>> nodeChildRefShift;
                const charIndex = v & nodeMaskChildCharIndex;
                binNodes[offset++] = (nodeToIndex[nodeRef] << refShift) | charIndex;
            }
        }

        return new TrieBlob(binNodes, this.#stringTable, this.info);
    }

    encodeToBTrie(): Uint8Array<ArrayBuffer> {
        return this.toTrieBlob().encodeToBTrie();
    }

    toJSON(): {
        info: Readonly<TrieInfo>;
        nodes: NodeToJSON[];
    } {
        return {
            info: this.info,
            nodes: nodesToJSON(this.#nodes),
            // charIndex: this._charIndex,
        };
    }

    static create(data: FastTrieBlobInternals): FastTrieBlob {
        return new FastTrieBlob(data.nodes, data.stringTable, data.info);
    }

    get iTrieRoot(): ITrieNodeRoot {
        return (this.#iTrieRoot ??= this.toTrieBlob().getRoot());
    }

    getRoot(): ITrieNodeRoot {
        return this.iTrieRoot;
    }

    /** number of nodes */
    get size(): number {
        return this.#nodes.length;
    }

    static fromTrieBlob(trie: TrieBlob): FastTrieBlob {
        const trieNodesBin = TrieBlob.nodesView(trie);
        const nodeOffsets: number[] = [];
        for (
            let offset = 0;
            offset < trieNodesBin.length;
            offset += (trieNodesBin[offset] & TrieBlob.NodeMaskNumChildren) + 1
        ) {
            nodeOffsets.push(offset);
        }
        const offsetToNodeIndex = new Map<number, number>(nodeOffsets.map((offset, i) => [offset, i]));
        const nodes: FastTrieBlobNode[] = Array.from({ length: nodeOffsets.length });
        for (let i = 0; i < nodes.length; ++i) {
            const offset = nodeOffsets[i];
            const n = trieNodesBin[offset];
            const eow = n & TrieBlob.NodeMaskEOW;
            const count = n & TrieBlob.NodeMaskNumChildren;
            // Preallocate the array to the correct size.
            const node = new Uint32Array(count + 1);
            node[0] = eow;
            nodes[i] = node;
            for (let j = 1; j <= count; ++j) {
                const n = trieNodesBin[offset + j];
                const charIndex = n & TrieBlob.NodeMaskChildCharIndex;
                const nodeIndex = n >>> TrieBlob.NodeChildRefShift;
                const idx = offsetToNodeIndex.get(nodeIndex);
                if (idx === undefined) {
                    throw new Error(`Invalid node index ${nodeIndex}`);
                }
                node[j] = (idx << TrieBlob.NodeChildRefShift) | charIndex;
            }
        }
        return new FastTrieBlob(sortNodes(nodes, TrieBlob.NodeMaskChildCharIndex), trie.stringTable, trie.info);
    }

    static isFastTrieBlob(obj: unknown): obj is FastTrieBlob {
        return obj instanceof FastTrieBlob;
    }
}

export interface NodeChildToJson {
    i: number; // index of the child node
    c?: string | undefined; // character at this node, or undefined if not applicable
    s: string; // sequence index in hex format
}
export interface NodeToJSON {
    i: number; // index of the node
    w: number; // end of word flag (1 if EOW, 0 otherwise)
    c?: NodeChildToJson[]; // children of the node, or undefined if no children
}

export function nodesToJSON<T extends FastTrieBlobNode | Uint32Array>(nodes: Readonly<T[]>): NodeToJSON[] {
    const mapNodeToAcc = new Map<T, Utf8Accumulator>();

    function mapNode(node: T, i: number) {
        if (node.length === 1) {
            return {
                i,
                w: (!!(node[0] & TrieBlob.NodeMaskEOW) && 1) || 0,
            };
        }

        const acc = mapNodeToAcc.get(node) || Utf8Accumulator.create();

        function mapChild(n: number) {
            const index = n >>> TrieBlob.NodeChildRefShift;
            const seq = n & TrieBlob.NodeMaskChildCharIndex;
            const cAcc = acc.clone();
            const codePoint = cAcc.decode(seq);
            if (codePoint === undefined) {
                mapNodeToAcc.set(nodes[index], cAcc);
            }
            return {
                i: index,
                c: (codePoint && String.fromCodePoint(codePoint)) || undefined,
                s: seq.toString(16).padStart(2, '0'),
            };
        }

        return {
            i,
            w: (!!(node[0] & TrieBlob.NodeMaskEOW) && 1) || 0,
            c: [...node.slice(1)].map(mapChild),
        };
    }

    return nodes.map((n, i) => mapNode(n, i));
}
