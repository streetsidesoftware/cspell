import { NumberSequenceByteEncoderDecoder } from './NumberSequenceByteDecoderAccumulator.js';

export type CharIndexSeq = Readonly<number[]>;

export type CharIndexMap = Record<string, number>;

export type RO_CharIndexMap = Readonly<CharIndexMap>;

export type CharIndexSeqMap = Record<string, CharIndexSeq | number>;

export type RO_CharIndexSeqMap = Readonly<CharIndexSeqMap>;

const emptySeq: CharIndexSeq = [0];

Object.freeze(emptySeq);

export class CharIndex {
    readonly charIndexMap: RO_CharIndexMap;
    readonly charIndexSeqMap: RO_CharIndexSeqMap;

    #lastWord = '';
    #lastWordSeq: CharIndexSeq = [];

    constructor(readonly charIndex: readonly string[]) {
        this.charIndexMap = buildCharIndexMap(charIndex);
        this.charIndexSeqMap = buildCharIndexSequenceMap(this.charIndexMap);
    }

    getCharIndex(c: string): number {
        return this.charIndexMap[c] || 0;
    }

    getCharIndexSeq(c: string): CharIndexSeq {
        const r = this.charIndexSeqMap[c] ?? emptySeq;
        return typeof r === 'number' ? [r] : r;
    }

    __wordToCharIndexSequence(word: string): CharIndexSeq {
        // Note: Array.flatMap is very slow
        const seq: number[] = new Array(word.length);
        let i = 0;
        for (const c of word) {
            const cSep = this.charIndexSeqMap[c];
            if (typeof cSep === 'number') {
                seq[i++] = cSep;
                continue;
            }
            if (!cSep) {
                seq[i++] = 0;
                continue;
            }
            for (const cIdx of cSep) {
                seq[i++] = cIdx;
            }
        }
        return seq;
    }

    wordToCharIndexSequence(word: string): CharIndexSeq {
        if (this.#lastWord === word) return this.#lastWordSeq;

        const seq = this.__wordToCharIndexSequence(word);

        this.#lastWord = word;
        this.#lastWordSeq = seq;

        return seq;
    }

    get size(): number {
        return this.charIndex.length;
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
        map[c] = NumberSequenceByteEncoderDecoder.encodeIfNeeded(idx);
    }
    return map;
}

export class CharIndexBuilder {
    private readonly charIndex: string[] = [];
    readonly charIndexMap: CharIndexMap = Object.create(null);
    readonly charIndexSeqMap: CharIndexSeqMap = Object.create(null);

    readonly #mapIdxToSeq = new Map<number, number[] | number>();

    constructor() {
        this.getCharIndex('');
    }

    getCharIndex(c: string): number {
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

    indexToSequence(idx: number): number[] | number {
        const found = this.#mapIdxToSeq.get(idx);
        if (found !== undefined) {
            return found;
        }
        const seq = NumberSequenceByteEncoderDecoder.encodeIfNeeded(idx);
        this.#mapIdxToSeq.set(idx, seq);
        return seq;
    }

    charToSequence(c: string): number[] {
        const idx = this.getCharIndex(c);
        const s = this.indexToSequence(idx);
        return typeof s === 'number' ? [s] : s;
    }

    wordToCharIndexSequence(word: string): number[] {
        // word = word.normalize('NFC');
        const seq: number[] = new Array(word.length);
        let i = 0;
        for (const c of word) {
            const idx = this.getCharIndex(c);
            const cSep = this.indexToSequence(idx);
            if (typeof cSep === 'number') {
                seq[i++] = cSep;
                continue;
            }
            for (const cIdx of cSep) {
                seq[i++] = cIdx;
            }
        }
        if (seq.length !== i) seq.length = i;
        return seq;
    }

    get size(): number {
        return this.charIndex.length;
    }

    build(): CharIndex {
        return new CharIndex(this.charIndex);
    }
}
