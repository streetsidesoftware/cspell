const NodeHeaderNumChildrenBits = 8;
const NodeHeaderNumChildrenShift = 0;

export class TrieBlob {
    constructor(
        private nodes: Uint32Array,
        private charToIndexMap: Record<string, number>,
        private charIndex: string[]
    ) {}

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
