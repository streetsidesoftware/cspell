import type { FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.js';
import { NumberSequenceByteEncoderDecoder } from './NumberSequenceByteDecoderAccumulator.js';

export class FastTrieBlobInternals implements FastTrieBlobBitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
    readonly isIndexDecoderNeeded: boolean;

    constructor(
        readonly nodes: number[][],
        readonly charIndex: readonly string[],
        readonly charToIndexMap: Readonly<Record<string, number>>,
        maskInfo: FastTrieBlobBitMaskInfo,
    ) {
        const { NodeMaskEOW, NodeMaskChildCharIndex, NodeChildRefShift } = maskInfo;
        this.NodeMaskEOW = NodeMaskEOW;
        this.NodeMaskChildCharIndex = NodeMaskChildCharIndex;
        this.NodeChildRefShift = NodeChildRefShift;
        this.isIndexDecoderNeeded = charIndex.length > NumberSequenceByteEncoderDecoder.MaxCharIndex;
    }
}
