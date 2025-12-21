import { assert } from '../utils/assert.ts';

interface TextEncoderEncodeIntoResult {
    read: number;
    written: number;
}

export class Utf8Encoder {
    #buffer: ArrayBuffer;
    #bufferSize: number;
    #threshold: number;
    #offset: number;
    #cache: Record<string, Uint8Array>;
    #encoder: TextEncoder;

    /**
     * Create a Utf8Encoder
     * @param bufferSize - size of the internal buffer
     * @param threshold - size threshold to use TextEncoder directly and the results are not cached.
     */
    constructor(bufferSize: number = 1024, threshold: number = 64) {
        assert(threshold <= bufferSize / 3, 'Threshold must be less than a third of the buffer size');
        this.#bufferSize = bufferSize;
        this.#threshold = threshold;
        this.#buffer = new ArrayBuffer(this.#bufferSize);
        this.#offset = 0;
        this.#cache = Object.create(null);
        this.#encoder = new TextEncoder();
    }

    #reallocate() {
        this.#buffer = new ArrayBuffer(this.#bufferSize);
        this.#offset = 0;
        this.#cache = Object.create(null);
    }

    /**
     *
     * @param text - text to encode
     * @returns a shared Uint8Array that contains the UTF-8 encoded text. I can be reused on subsequent calls.
     */
    encode(text: string): Readonly<Uint8Array> {
        if (text.length > this.#threshold) {
            return this.#encoder.encode(text);
        }
        const cached = this.#cache[text];
        if (cached) {
            return cached;
        }
        if (this.#offset + text.length * 2 > this.#bufferSize) {
            this.#reallocate();
        }
        let r = this.#encodeIntoBuffer(text);
        if (r.read < text.length) {
            this.#reallocate();
            r = this.#encodeIntoBuffer(text);
        }
        const result = new Uint8Array(this.#buffer, this.#offset, r.written);
        this.#offset += r.written;
        this.#cache[text] = result;
        return result;
    }

    #encodeIntoBuffer(text: string): TextEncoderEncodeIntoResult {
        const buffer = new Uint8Array(this.#buffer, this.#offset);
        const r = this.#encoder.encodeInto(text, buffer);
        return r;
    }
}

export class Utf8Encoder2 {
    #buffer: ArrayBuffer;
    #byteArray: Uint8Array;
    #bufferSize: number;
    #encoder: TextEncoder;

    /**
     * Create a Utf8Encoder
     * @param bufferSize - size of the internal buffer
     */
    constructor(bufferSize: number = 1024) {
        this.#bufferSize = bufferSize;
        this.#buffer = new ArrayBuffer(this.#bufferSize);
        this.#byteArray = new Uint8Array(this.#buffer);
        this.#encoder = new TextEncoder();
    }

    /**
     *
     * @param text - text to encode
     * @returns a shared Uint8Array that contains the UTF-8 encoded text. I can be reused on subsequent calls.
     */
    encode(text: string): Readonly<Uint8Array> {
        if (text.length * 3 > this.#bufferSize) {
            return this.#encoder.encode(text);
        }
        const r = this.#encoder.encodeInto(text, this.#byteArray);
        return this.#byteArray.subarray(0, r.written);
    }
}
