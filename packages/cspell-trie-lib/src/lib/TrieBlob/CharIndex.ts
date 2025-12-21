import { encodeTextToUtf8, encodeUtf8N_BE, type Utf8BE32 } from './Utf8.ts';

export type Utf8Seq = Readonly<number[]>;

export type CharIndexMap = Map<string, Utf8BE32>;

export type RO_CharIndexMap = Readonly<CharIndexMap>;

export type CharIndexSeqMap = Map<string, Utf8Seq>;

export type RO_CharIndexSeqMap = Readonly<CharIndexSeqMap>;

const emptySeq: Utf8Seq = [0];

Object.freeze(emptySeq);

export class CharIndex {
    #charToUtf8SeqMap: CharIndexSeqMap;

    #lastWord = '';
    #lastWordSeq: Utf8Seq = [];
    #multiByteChars: boolean;
    readonly charIndex: Set<string>;

    constructor(charIndex: Set<string> = new Set()) {
        this.charIndex = charIndex;
        this.#charToUtf8SeqMap = buildCharIndexSequenceMap(charIndex);
        this.#multiByteChars = [...this.#charToUtf8SeqMap.values()].some((c) => c.length > 1);
    }

    getCharUtf8Seq(c: string): Utf8Seq {
        const found = this.#charToUtf8SeqMap.get(c);
        if (found) return found;
        const s = encodeTextToUtf8(c);
        this.#charToUtf8SeqMap.set(c, s);
        return s;
    }

    wordToUtf8Seq(word: string): Utf8Seq {
        if (this.#lastWord === word) return this.#lastWordSeq;

        const seq = encodeTextToUtf8(word);

        this.#lastWord = word;
        this.#lastWordSeq = seq;

        return seq;
    }

    indexContainsMultiByteChars(): boolean {
        return this.#multiByteChars;
    }

    get size(): number {
        return this.charIndex.size;
    }

    toJSON(): {
        charIndex: string;
    } {
        return { charIndex: [...this.charIndex].join('') };
    }

    static fromJSON(json: { charIndex: string }): CharIndex {
        const charIndex = new Set<string>(json.charIndex);
        return new CharIndex(charIndex);
    }

    static fromIterable(charIndex: Iterable<string>): CharIndex {
        const charSet = new Set<string>();
        for (const s of charIndex) {
            for (const c of s) {
                charSet.add(c);
            }
        }
        return new CharIndex(charSet);
    }
}

function buildCharIndexSequenceMap(charIndex: Iterable<string>): CharIndexSeqMap {
    const map: CharIndexSeqMap = new Map();
    for (const key of charIndex) {
        map.set(key, encodeTextToUtf8(key));
    }
    return map;
}

export class CharIndexBuilder {
    private readonly charIndex: Set<string> = new Set();
    readonly charIndexMap: CharIndexMap = new Map();
    readonly charIndexSeqMap: CharIndexSeqMap = new Map();

    readonly #mapIdxToSeq = new Map<number, number[]>();

    constructor() {
        this.getUtf8Value('');
    }

    getUtf8Value(c: string): number {
        const found = this.charIndexMap.get(c);
        if (found !== undefined) {
            return found;
        }
        const nc = c.normalize('NFC');
        this.charIndex.add(nc);
        const utf8 = encodeUtf8N_BE(nc.codePointAt(0) || 0);
        this.charIndexMap.set(c, utf8);
        this.charIndexMap.set(nc, utf8);
        this.charIndexMap.set(c.normalize('NFD'), utf8);
        return utf8;
    }

    utf8ValueToUtf8Seq(idx: number): number[] {
        const found = this.#mapIdxToSeq.get(idx);
        if (found !== undefined) {
            return found;
        }
        const seq = splitUtf8(idx);
        this.#mapIdxToSeq.set(idx, seq);
        return seq;
    }

    charToUtf8Seq(c: string): number[] {
        const idx = this.getUtf8Value(c);
        return this.utf8ValueToUtf8Seq(idx);
    }

    wordToUtf8Seq(word: string): number[] {
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
        return this.charIndex.size;
    }

    build(): CharIndex {
        return new CharIndex(this.charIndex);
    }
}

function splitUtf8(utf8: number): number[] {
    utf8 = utf8 < 0 ? 0x1_0000_0000 + utf8 : utf8;
    if (utf8 <= 0xff) return [utf8];
    if (utf8 <= 0xffff) return [(utf8 >> 8) & 0xff, utf8 & 0xff];
    if (utf8 <= 0xff_ffff) return [(utf8 >> 16) & 0xff, (utf8 >> 8) & 0xff, utf8 & 0xff];
    return [(utf8 >> 24) & 0xff, (utf8 >> 16) & 0xff, (utf8 >> 8) & 0xff, utf8 & 0xff].filter((v) => v);
}
