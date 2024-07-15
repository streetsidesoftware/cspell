import { encodeUtf8N_BE, type Utf8BE32 } from './Utf8.js';

export type Utf8Seq = Readonly<number[]>;

export type CharIndexMap = Record<string, Utf8BE32>;

export type RO_CharIndexMap = Readonly<CharIndexMap>;

export type CharIndexSeqMap = Record<string, Utf8Seq | number>;

export type RO_CharIndexSeqMap = Readonly<CharIndexSeqMap>;

const emptySeq: Utf8Seq = [0];

Object.freeze(emptySeq);

export class CharIndex {
    readonly charToUtf8Map: RO_CharIndexMap;
    readonly charToUtf8SeqMap: RO_CharIndexSeqMap;

    #lastWord = '';
    #lastWordSeq: Utf8Seq = [];

    constructor(readonly charIndex: readonly string[]) {
        this.charToUtf8Map = buildCharIndexMap(charIndex);
        this.charToUtf8SeqMap = buildCharIndexSequenceMap(this.charToUtf8Map);
    }

    getUtf8Value(c: string): number {
        return this.charToUtf8Map[c] || 0;
    }

    getCharUtf8Seq(c: string): Utf8Seq {
        const r = this.charToUtf8SeqMap[c] ?? emptySeq;
        return typeof r === 'number' ? [r] : r;
    }

    __wordToUtf8Seq(word: string): Utf8Seq {
        // Note: Array.flatMap is very slow
        const seq: number[] = new Array(word.length);
        let i = 0;
        for (const c of word) {
            const cSep = this.charToUtf8SeqMap[c];
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
        if (seq.length !== i) seq.length = i;
        return seq;
    }

    wordToUtf8Seq(word: string): Utf8Seq {
        if (this.#lastWord === word) return this.#lastWordSeq;

        const seq = this.__wordToUtf8Seq(word);

        this.#lastWord = word;
        this.#lastWordSeq = seq;

        return seq;
    }

    indexContainsMultiByteChars(): boolean {
        return Object.values(this.charToUtf8Map).some((v) => v >= 0x80);
    }

    get size(): number {
        return this.charIndex.length;
    }

    toJSON() {
        return { charIndex: this.charIndex };
    }
}

function buildCharIndexMap(charIndex: readonly string[]): CharIndexMap {
    const map: CharIndexMap = Object.create(null);
    for (const c of charIndex) {
        const cn = c.normalize('NFC');
        const utf8 = encodeUtf8N_BE(cn.codePointAt(0) || 0);
        map[c] = utf8;
        map[c.normalize('NFC')] = utf8;
        map[c.normalize('NFD')] = utf8;
    }
    return map;
}

function buildCharIndexSequenceMap(charIndexMap: RO_CharIndexMap): CharIndexSeqMap {
    const map: CharIndexSeqMap = Object.create(null);
    for (const [key, value] of Object.entries(charIndexMap)) {
        map[key] = splitUtf8IfNeeded(value);
    }
    return map;
}

export class CharIndexBuilder {
    private readonly charIndex: string[] = [];
    readonly charIndexMap: CharIndexMap = Object.create(null);
    readonly charIndexSeqMap: CharIndexSeqMap = Object.create(null);

    readonly #mapIdxToSeq = new Map<number, number[] | number>();

    constructor() {
        this.getUtf8Value('');
    }

    getUtf8Value(c: string): number {
        const found = this.charIndexMap[c];
        if (found !== undefined) {
            return found;
        }
        const nc = c.normalize('NFC');
        this.charIndex.push(nc);
        const utf8 = encodeUtf8N_BE(nc.codePointAt(0) || 0);
        this.charIndexMap[c] = utf8;
        this.charIndexMap[nc] = utf8;
        this.charIndexMap[c.normalize('NFD')] = utf8;
        return utf8;
    }

    utf8ValueToUtf8Seq(idx: number): number[] | number {
        const found = this.#mapIdxToSeq.get(idx);
        if (found !== undefined) {
            return found;
        }
        const seq = splitUtf8IfNeeded(idx);
        this.#mapIdxToSeq.set(idx, seq);
        return seq;
    }

    charToUtf8Seq(c: string): number[] {
        const idx = this.getUtf8Value(c);
        const s = this.utf8ValueToUtf8Seq(idx);
        return typeof s === 'number' ? [s] : s;
    }

    wordToUtf8Seq(word: string): number[] {
        // word = word.normalize('NFC');
        const seq: number[] = new Array(word.length);
        let i = 0;
        for (const c of word) {
            const idx = this.getUtf8Value(c);
            const cSep = this.utf8ValueToUtf8Seq(idx);
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

function splitUtf8IfNeeded(utf8: number): number | number[] {
    if (utf8 < 0x80) return utf8;
    const s = [(utf8 >> 24) & 0xff, (utf8 >> 16) & 0xff, (utf8 >> 8) & 0xff, utf8 & 0xff].filter((v) => v);
    return s.length ? s : s[0];
}
