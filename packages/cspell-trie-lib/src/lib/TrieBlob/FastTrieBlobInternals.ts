import type { FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.js';

export class FastTrieBlobInternals implements FastTrieBlobBitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;

    constructor(
        readonly nodes: number[][],
        readonly charIndex: string[],
        readonly charToIndexMap: Readonly<Record<string, number>>,
        maskInfo: FastTrieBlobBitMaskInfo
    ) {
        const { NodeMaskEOW, NodeMaskChildCharIndex, NodeChildRefShift } = maskInfo;
        this.NodeMaskEOW = NodeMaskEOW;
        this.NodeMaskChildCharIndex = NodeMaskChildCharIndex;
        this.NodeChildRefShift = NodeChildRefShift;
    }
}
