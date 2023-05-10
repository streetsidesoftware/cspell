const NodeHeaderNumChildrenBits = 8;
const NodeHeaderNumChildrenShift = 0;

const HEADER_SIZE_UINT32 = 8;
const HEADER_SIZE = HEADER_SIZE_UINT32 * 4;

const HEADER_OFFSET = 0;
const HEADER_OFFSET_ENDIAN = HEADER_OFFSET + 8;
const HEADER_OFFSET_NODES = HEADER_OFFSET_ENDIAN + 4;
const HEADER_OFFSET_NODES_LEN = HEADER_OFFSET_NODES + 4;
const HEADER_OFFSET_CHAR_INDEX = HEADER_OFFSET_NODES_LEN + 4;
const HEADER_OFFSET_CHAR_INDEX_LEN = HEADER_OFFSET_CHAR_INDEX + 4;

const HEADER = {
    offset: HEADER_OFFSET,
    endian: HEADER_OFFSET_ENDIAN,
    nodes: HEADER_OFFSET_NODES,
    nodesLen: HEADER_OFFSET_NODES_LEN,
    charIndex: HEADER_OFFSET_CHAR_INDEX,
    charIndexLen: HEADER_OFFSET_CHAR_INDEX_LEN,
} as const;

const headerSig = 'TrieBlob';
const endianSig = 0x04030201;

export class TrieBlob {
    private charToIndexMap: Record<string, number>;
    constructor(private nodes: Uint32Array, private charIndex: string[]) {
        this.charToIndexMap = Object.create(null);
        for (let i = 0; i < charIndex.length; ++i) {
            const char = charIndex[i];
            this.charToIndexMap[char.normalize('NFC')] = i;
            this.charToIndexMap[char.normalize('NFD')] = i;
        }
    }

    has(word: string): boolean {
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const letterIndexes = [...word].map((char) => this.lookUpCharIndex(char));
        let nodeIdx = 0;
        let node = nodes[nodeIdx];
        for (let p = 0; p < letterIndexes.length; ++p, node = nodes[nodeIdx]) {
            const letterIdx = letterIndexes[p];
            const count = node & NodeMaskNumChildren;
            let i = count - 1;
            for (; i > 0; --i) {
                if ((nodes[i + nodeIdx] & NodeMaskChildCharIndex) === letterIdx) {
                    break;
                }
            }
            if (i < 1) return false;
            nodeIdx = nodes[i + nodeIdx] >>> NodeChildRefShift;
        }

        return (node & TrieBlob.NodeMaskEOW) === TrieBlob.NodeMaskEOW;
    }

    *words(): Iterable<string> {
        interface StackItem {
            nodeIdx: number;
            pos: number;
            word: string;
        }
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeMaskEOW = TrieBlob.NodeMaskEOW;
        const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const stack: StackItem[] = [{ nodeIdx: 0, pos: 0, word: '' }];
        let depth = 0;

        while (depth >= 0) {
            const { nodeIdx, pos, word } = stack[depth];
            const node = nodes[nodeIdx];

            if (!pos && node & NodeMaskEOW) {
                yield word;
            }
            const len = node & NodeMaskNumChildren;
            if (pos >= len - 1) {
                --depth;
                continue;
            }
            const nextPos = ++stack[depth].pos;
            const entry = nodes[nodeIdx + nextPos];
            const charIdx = entry & NodeMaskChildCharIndex;
            const letter = this.charIndex[charIdx];
            ++depth;
            stack[depth] = {
                nodeIdx: entry >>> NodeChildRefShift,
                pos: 0,
                word: word + letter,
            };
        }
    }

    private lookUpCharIndex(char: string): number {
        return this.charToIndexMap[char] ?? -1;
    }

    toJSON() {
        return {
            charIndex: this.charIndex,
            nodes: splitString(Buffer.from(this.nodes.buffer).toString('base64')),
        };
    }

    encodeBin(): Uint8Array {
        const charIndex = Buffer.from(this.charIndex.join('\n'));
        const charIndexLen = (charIndex.byteLength + 3) & ~3;
        const nodeOffset = HEADER_SIZE + charIndexLen;
        const size = nodeOffset + this.nodes.length * 4;
        const useLittle = isLittleEndian();
        const buffer = Buffer.alloc(size);
        const header = new DataView(buffer.buffer);
        const nodeData = new Uint8Array(this.nodes.buffer);
        buffer.write(headerSig, 0, 'utf8');
        header.setUint32(HEADER.endian, endianSig, useLittle);
        header.setUint32(HEADER.nodes, nodeOffset, useLittle);
        header.setUint32(HEADER.nodesLen, this.nodes.length, useLittle);
        header.setUint32(HEADER.charIndex, HEADER_SIZE, useLittle);
        header.setUint32(HEADER.charIndexLen, charIndex.length, useLittle);
        buffer.set(charIndex, HEADER_SIZE);
        buffer.set(nodeData, nodeOffset);
        // dumpBin(nodeData);
        return buffer;
    }

    static decodeBin(blob: Uint8Array): TrieBlob {
        if (!checkSig(blob)) {
            throw new ErrorDecodeTrieBlob('Invalid TrieBlob Header');
        }
        const header = new DataView(blob.buffer);
        const useLittle = isLittleEndian();
        if (header.getUint32(HEADER.endian, useLittle) !== endianSig) {
            // swap the bytes
            // blob.swap32();
            if (header.getUint32(HEADER.endian, useLittle) !== endianSig) {
                throw new ErrorDecodeTrieBlob('Invalid TrieBlob Header');
            }
        }
        const offsetNodes = header.getUint32(HEADER.nodes, useLittle);
        const lenNodes = header.getUint32(HEADER.nodesLen, useLittle);
        const offsetCharIndex = header.getUint32(HEADER.charIndex, useLittle);
        const lenCharIndex = header.getUint32(HEADER.charIndexLen, useLittle);
        const charIndex = Buffer.from(blob.subarray(offsetCharIndex, offsetCharIndex + lenCharIndex))
            .toString('utf8')
            .split('\n');
        const nodes = new Uint32Array(blob.buffer).subarray(offsetNodes / 4, offsetNodes / 4 + lenNodes);
        return new TrieBlob(nodes, charIndex);
    }

    static NodeMaskEOW = 0x00000100;
    static NodeMaskNumChildren = (1 << NodeHeaderNumChildrenBits) - 1;
    static NodeMaskNumChildrenShift = NodeHeaderNumChildrenShift;
    static NodeChildRefShift = 8;
    static NodeMaskChildCharIndex = 0x000000ff;
}

function isLittleEndian(): boolean {
    const buf = new Uint8Array([1, 2, 3, 4]);
    const view = new DataView(buf.buffer);
    return view.getUint32(0, true) === 0x04030201;
}

function checkSig(blob: Uint8Array): boolean {
    if (blob.length < HEADER_SIZE) {
        return false;
    }
    const buf = Buffer.from(blob, 0, headerSig.length);
    if (buf.toString('utf8', 0, headerSig.length) !== headerSig) {
        return false;
    }
    return true;
}

class ErrorDecodeTrieBlob extends Error {
    constructor(message: string) {
        super(message);
    }
}

function splitString(s: string, len = 64): string[] {
    const splits: string[] = [];
    for (let i = 0; i < s.length; i += len) {
        splits.push(s.slice(i, i + len));
    }
    return splits;
}

// function dumpBin(blob: Uint8Array | ArrayBuffer, message?: string) {
//     if (message) {
//         console.log(message);
//     }
//     const blob8 = new Uint8Array(blob);
//     const values: string[] = [];
//     for (let i = 0; i < blob8.length; ++i) {
//         values.push(('0' + blob8[i].toString(16)).slice(-2));
//         if ((i & 31) === 31) {
//             console.log(values.join(' '));
//             values.length = 0;
//         }
//     }
//     console.log(values.join(' '));
// }
