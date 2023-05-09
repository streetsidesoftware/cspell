const NodeHeaderNumChildrenBits = 8;
const NodeHeaderNumChildrenShift = 0;

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
        const numChildrenMask = TrieBlob.NodeMaskNumChildren;
        const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const letterIndexes = [...word].map((char) => this.lookUpCharIndex(char));
        let nodeIdx = 0;
        let node = nodes[nodeIdx];
        for (let p = 0; p < letterIndexes.length; ++p, node = nodes[nodeIdx]) {
            const letterIdx = letterIndexes[p];
            const count = node & numChildrenMask;
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

    private lookUpCharIndex(char: string): number {
        return this.charToIndexMap[char] ?? -1;
    }

    static NodeMaskEOW = 0x00000100;
    static NodeMaskNumChildren = (1 << NodeHeaderNumChildrenBits) - 1;
    static NodeMaskNumChildrenShift = NodeHeaderNumChildrenShift;
    static NodeChildRefShift = 8;
    static NodeMaskChildCharIndex = 0x000000ff;
}
