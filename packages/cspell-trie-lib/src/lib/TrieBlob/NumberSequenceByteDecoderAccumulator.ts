import { assert } from '../utils/assert.js';

export enum SpecialCharIndex {
    Mask = 248,
    MaxCharIndex = Mask - 1,
    Index8bit = Mask | 1,
    Index14bit = Mask | 2,
    Index21bit = Mask | 3,
}

export type EncodedSequence =
    | [number]
    | [SpecialCharIndex.Index8bit, number]
    | [SpecialCharIndex.Index14bit, number, number]
    | [SpecialCharIndex.Index21bit, number, number, number];

export class NumberSequenceByteEncoderDecoder {
    static encode(n: number): EncodedSequence {
        if (n < this.SpecialCharIndexMask) return [n];
        if (n < this.SpecialCharIndexMask * 2) {
            return [SpecialCharIndex.Index8bit, n - this.SpecialCharIndexMask];
        }
        if (n < 1 << 14) return [SpecialCharIndex.Index14bit, n >>> 7, n & 0x7f];
        assert(n < 1 << 21);
        return [SpecialCharIndex.Index21bit, (n >>> 14) & 0x7f, (n >>> 7) & 0x7f, n & 0x7f];
    }

    static decode(encodedSequence: EncodedSequence): number {
        const [a, b, c, d] = encodedSequence;
        switch (a) {
            case SpecialCharIndex.Index8bit:
                // assert(encodedSequence.length === 2);
                return (b || 0) + this.SpecialCharIndexMask;
            case SpecialCharIndex.Index14bit:
                // assert(encodedSequence.length === 3);
                return ((b || 0) << 7) + (c || 0);
            case SpecialCharIndex.Index21bit:
                // assert(encodedSequence.length === 4);
                return ((b || 0) << 14) + ((c || 0) << 7) + (d || 0);
            default:
                // assert(a <= SpecialCharIndex.MaxCharIndex);
                return a;
        }
    }

    static *encodeSequence(sequence: Iterable<number>): Iterable<number> {
        for (const n of sequence) {
            const encoded = this.encode(n);
            yield* encoded;
        }
    }

    static decodeSequence(sequence: Iterable<number>): number[] {
        const acc = NumberSequenceByteDecoderAccumulator.create();
        return [...acc.decodeSequence(sequence)];
    }

    static SpecialCharIndexMask = SpecialCharIndex.Mask as const;
    static MaxCharIndex = SpecialCharIndex.MaxCharIndex as const;
    /**
     * SpecialCharIndex8bit is used to indicate a node chain. Where the final character index is 248 + the index found in the next node.
     */
    static SpecialCharIndex8bit = SpecialCharIndex.Index8bit as const;
    static SpecialCharIndex16bit = SpecialCharIndex.Index14bit as const;
    static SpecialCharIndex24bit = SpecialCharIndex.Index21bit as const;
}

export class NumberSequenceByteDecoderAccumulator {
    protected constructor(
        private byteMode = 0,
        private accumulation = 0,
    ) {}

    *decodeSequence(sequence: Iterable<number>): Iterable<number> {
        const accumulator = this.clone();
        for (const idx of sequence) {
            const r = accumulator.decode(idx);
            if (r !== undefined) {
                yield r;
            }
        }
    }

    decode(idx: number): number | undefined {
        if (!this.byteMode) {
            if (idx < NumberSequenceByteEncoderDecoder.SpecialCharIndexMask) {
                const v = idx + this.accumulation;
                this.accumulation = 0;
                return v;
            }
            switch (idx) {
                case NumberSequenceByteEncoderDecoder.SpecialCharIndex8bit:
                    this.accumulation += NumberSequenceByteEncoderDecoder.SpecialCharIndexMask;
                    break;
                case NumberSequenceByteEncoderDecoder.SpecialCharIndex16bit:
                    this.byteMode = 2;
                    break;
                case NumberSequenceByteEncoderDecoder.SpecialCharIndex24bit:
                    this.byteMode = 3;
                    break;
                default:
                    throw new Error('Invalid SpecialCharIndex');
            }
            return undefined;
        }
        this.accumulation = (this.accumulation << 7) + idx;
        --this.byteMode;
        if (!this.byteMode) {
            const r = this.accumulation;
            this.accumulation = 0;
            return r;
        }
        return undefined;
    }

    reset() {
        this.byteMode = 0;
        this.accumulation = 0;
    }

    clone(): NumberSequenceByteDecoderAccumulator {
        const n = new NumberSequenceByteDecoderAccumulator(this.byteMode, this.accumulation);
        return n;
    }

    isPending(): boolean {
        return !!(this.byteMode || this.accumulation);
    }

    static create(): NumberSequenceByteDecoderAccumulator {
        return new NumberSequenceByteDecoderAccumulator();
    }
}
