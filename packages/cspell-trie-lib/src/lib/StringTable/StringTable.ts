import type { BinaryFormat } from '../binary/index.ts';
import { BinaryDataBuilder, BinaryDataReader, BinaryFormatBuilder } from '../binary/index.ts';
import { GTrie } from '../GTrie/index.ts';
import { assert } from '../utils/assert.ts';

type U32Array = Uint32Array<ArrayBuffer>;
type U16Array = Uint16Array<ArrayBuffer>;
type U8Array = Uint8Array<ArrayBuffer>;

type IndexArray = U32Array | U16Array | number[];

type IndexArrayRO = U32Array | U16Array | Readonly<number[]>;

/**
 * This is a set of strings stored in a compact form.
 *
 * Strings are stored as UTF-8 encoded bytes in a single contiguous buffer.
 * Each string is referenced by its starting index and length within the buffer.
 *
 * This design minimizes memory overhead by avoiding individual string objects,
 * allowing efficient storage and retrieval of a large number of strings.
 *
 * Strings are retrieved based on their index.
 *
 * The internal index table contains the offset and length of each string in the buffer.
 *
 */
export class StringTable {
    #index: IndexArray;
    #data: U8Array;
    #strLenBits: number;
    #strLenMask: number;
    #decoder = new TextDecoder();

    /**
     *
     * @param index - the lookup index format: `offset|len` where the low bits are the length
     * @param utf8ByteData - the UTF-8 encoded byte data for all the strings
     * @param strLenBits - number of bits used to store the length of the string in the index entry
     */
    constructor(index: IndexArray, utf8ByteData: U8Array, strLenBits: number) {
        this.#index = index;
        this.#data = utf8ByteData;
        this.#strLenBits = strLenBits;
        this.#strLenMask = (1 << strLenBits) - 1;
    }

    get index(): Readonly<IndexArray> {
        return this.#index;
    }

    get charData(): Readonly<U8Array> {
        return this.#data;
    }

    get strLenBits(): number {
        return this.#strLenBits;
    }

    getStringBytes(idx: number): Uint8Array | undefined {
        if (idx < 0 || idx >= this.#index.length) return undefined;
        const value = this.#index[idx];
        const offset = value >>> this.#strLenBits;
        const length = value & this.#strLenMask;
        return this.#data.subarray(offset, offset + length);
    }

    getString(idx: number): string | undefined {
        const bytes = this.getStringBytes(idx);
        if (!bytes) return undefined;
        return this.#decoder.decode(bytes);
    }

    toString(): string {
        return [...this.#index].map((_, i) => this.getString(i) || '').join(', ');
    }

    toJSON(): { index: number[]; data: number[]; strLenBits: number } {
        return {
            index: [...this.#index],
            data: [...this.#data],
            strLenBits: this.#strLenBits,
        };
    }
}

export class StringTableBuilder {
    #buffers: (number[] | Uint8Array)[] = [];
    #encoder = new TextEncoder();
    #lookupTrie = new GTrie<number, number>();
    #locked = false;
    #maxStrLen = 0;

    addStringBytes(bytes: Uint8Array | number[]): number {
        assert(!this.#locked, 'StringTableBuilder is locked and cannot be modified.');
        const found = this.#lookupTrie.get(bytes);
        if (found !== undefined) {
            return found;
        }
        const idx = this.#buffers.push(bytes) - 1;
        this.#lookupTrie.insert(bytes, idx);
        this.#maxStrLen = Math.max(this.#maxStrLen, bytes.length);
        return idx;
    }

    addString(str: string): number {
        const bytes = this.#encoder.encode(str);
        return this.addStringBytes(bytes);
    }

    build(): StringTable {
        this.#locked = true;

        if (!this.#buffers.length) {
            return new StringTable([], new Uint8Array(0), 8);
        }

        // sorted by size descending
        const sortedBySize = this.#buffers.map((b, i) => ({ b, i })).sort((a, b) => b.b.length - a.b.length);
        const byteValues: number[] = [];

        const strLenBits = Math.ceil(Math.log2(this.#maxStrLen + 1));
        const strLenMask = (1 << strLenBits) - 1;
        const index: number[] = new Array(this.#buffers.length);

        for (const { b, i } of sortedBySize) {
            let offset = findValues(b);
            if (offset < 0) {
                offset = appendValues(b);
            }
            const length = b.length;
            assert(length <= strLenMask, `String length ${length} exceeds maximum of ${strLenMask}`);
            index[i] = (offset << strLenBits) | length;
        }

        return new StringTable(index, new Uint8Array(byteValues), strLenBits);

        function findValues(buf: number[] | Uint8Array): number {
            const bufLen = buf.length;
            const byteLen = byteValues.length;
            const maxOffset = byteLen - bufLen;

            for (let i = 0; i <= maxOffset; i++) {
                let match = true;
                for (let j = 0; j < bufLen; j++) {
                    if (byteValues[i + j] !== buf[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    return i;
                }
            }

            return -1;
        }

        function appendValues(buf: number[] | Uint8Array): number {
            const offset = byteValues.length;
            byteValues.push(...buf);
            return offset;
        }
    }
}

function getStringTableBinaryFormat(): BinaryFormat {
    return new BinaryFormatBuilder()
        .addUint8('indexBits', 'The number of bits needed for each index entry', 32)
        .addUint8('strLenBits', 'The number of bits needed to store the max length of a string in the table.', 8)
        .addString('reserved', 'Reserved for future use', 6)
        .addUint32ArrayPtr('index32', 'String index array of 32 bit entries')
        .addUint16ArrayPtr('index16', 'String index array of 16 bit entries', 'index32')
        .addUint8ArrayPtr('index', 'String index array of 8 bit entries', 'index32')
        .addUint8ArrayPtr('data', 'String byte data')
        .build();
}

export function encodeStringTableToBinary(table: StringTable, endian: 'LE' | 'BE'): U8Array {
    const strLenBits = table.strLenBits;
    const offsetBits = Math.ceil(Math.log2(table.charData.length + 1));
    const minIndexBits = strLenBits + offsetBits;
    const indexBits = minIndexBits <= 16 ? 16 : 32;
    assert(minIndexBits <= indexBits, `Index bits ${indexBits} is too small for required bits ${minIndexBits}`);

    const format = getStringTableBinaryFormat();

    const builder = new BinaryDataBuilder(format, endian);
    builder.setUint8('indexBits', indexBits);
    builder.setUint8('strLenBits', strLenBits);
    if (indexBits === 16) {
        builder.setPtrUint16Array('index16', toU16Array(table.index));
    } else {
        builder.setPtrUint32Array('index32', toU32Array(table.index));
    }
    builder.setPtrUint8Array('data', table.charData);

    return builder.build();
}

export function decodeStringTableFromBinary(data: U8Array, endian: 'LE' | 'BE'): StringTable {
    const reader = new BinaryDataReader(data, getStringTableBinaryFormat(), endian);
    const indexBits = reader.getUint8('indexBits');
    const strLenBits = reader.getUint8('strLenBits');
    const index = indexBits === 16 ? reader.getPtrUint16Array('index16') : reader.getPtrUint32Array('index32');
    const buffer = reader.getPtrUint8Array('data');
    return new StringTable(index, buffer, strLenBits);
}

function toU16Array(data: IndexArrayRO): U16Array {
    if (data instanceof Uint16Array) {
        return data;
    }
    return new Uint16Array(data);
}

function toU32Array(data: IndexArrayRO): U32Array {
    if (data instanceof Uint32Array) {
        return data;
    }
    return new Uint32Array(data);
}
