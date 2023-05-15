export interface FastTrieBlobBitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
}

export function extractInfo(info: FastTrieBlobBitMaskInfo): FastTrieBlobBitMaskInfo {
    const { NodeMaskEOW, NodeMaskChildCharIndex, NodeChildRefShift } = info;
    return {
        NodeMaskEOW,
        NodeMaskChildCharIndex,
        NodeChildRefShift,
    };
}
