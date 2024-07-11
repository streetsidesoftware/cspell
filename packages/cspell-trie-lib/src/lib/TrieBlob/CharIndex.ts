import { NumberSequenceByteEncoderDecoder } from './NumberSequenceByteDecoderAccumulator.js';

export type CharIndexMap = Record<string, number>;

export type RO_CharIndexMap = Readonly<CharIndexMap>;

export type CharIndexSeqMap = Record<string, number[] | number>;

export type RO_CharIndexSeqMap = Readonly<CharIndexSeqMap>;

const emptySeq: number[] = [];

Object.freeze(emptySeq);

export class CharIndex {
    readonly charIndexMap: RO_CharIndexMap;
    readonly charIndexSeqMap: RO_CharIndexSeqMap;
    constructor(readonly charIndex: readonly string[]) {
        this.charIndexMap = buildCharIndexMap(charIndex);
        this.charIndexSeqMap = buildCharIndexSequenceMap(this.charIndexMap);
    }

    getCharIndex(c: string): number {
        return this.charIndexMap[c] || 0;
    }

    getCharIndexSeq(c: string): number[] {
        const r = this.charIndexSeqMap[c] ?? emptySeq;
        return typeof r === 'number' ? [r] : r;
    }

    wordToCharIndexSequence(word: string): number[] {
        // return [...word].flatMap((c) => this.getCharIndexSeq(c));
        const seq: number[] = new Array(word.length);
        let i = 0;
        for (const c of word) {
            const cSep = this.charIndexSeqMap[c];
            if (typeof cSep === 'number') {
                seq[i++] = cSep;
                continue;
            }
            if (!cSep) continue;
            for (const cIdx of cSep) {
                seq[i++] = cIdx;
            }
        }
        if (seq.length !== i) seq.length = i;
        return seq;
    }

    indexToCharacter(idx: number): string {
        return this.charIndex[idx] || '';
    }
}

function buildCharIndexMap(charIndex: readonly string[]): CharIndexMap {
    const map: CharIndexMap = Object.create(null);
    for (let i = 0; i < charIndex.length; ++i) {
        const c = charIndex[i];
        map[c] = i;
        map[c.normalize('NFC')] = i;
        map[c.normalize('NFD')] = i;
    }
    return map;
}

function buildCharIndexSequenceMap(charIndexMap: RO_CharIndexMap): CharIndexSeqMap {
    const map: CharIndexSeqMap = Object.create(null);
    for (const [c, idx] of Object.entries(charIndexMap)) {
        const n = NumberSequenceByteEncoderDecoder.encode(idx);
        map[c] = n.length === 1 ? n[0] : n;
    }
    return map;
}

export class CharIndexBuilder {
    private readonly charIndex: string[] = [];
    readonly charIndexMap: CharIndexMap = Object.create(null);
    readonly charIndexSeqMap: CharIndexSeqMap = Object.create(null);

    readonly #mapIdxToSeq = new Map<number, number[]>();

    constructor() {
        this.addChar('');
    }

    addChar(c: string): number {
        const found = this.charIndexMap[c];
        if (found !== undefined) {
            return found;
        }
        const idx = this.charIndex.push(c) - 1;
        this.charIndexMap[c] = idx;
        this.charIndexMap[c.normalize('NFC')] = idx;
        this.charIndexMap[c.normalize('NFD')] = idx;
        return idx;
    }

    indexToSequence(idx: number): number[] {
        const found = this.#mapIdxToSeq.get(idx);
        if (found) {
            return found;
        }
        const seq = NumberSequenceByteEncoderDecoder.encode(idx);
        this.#mapIdxToSeq.set(idx, seq);
        return seq;
    }

    build(): CharIndex {
        return new CharIndex(this.charIndex);
    }
}
