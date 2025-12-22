import type { TrieInfo } from '../ITrieNode/TrieInfo.ts';
import { assert } from '../utils/assert.ts';
import type { BinaryFormat } from './binaryFormat.ts';
import { BinaryDataBuilder, BinaryDataReader, BinaryFormatBuilder } from './binaryFormat.ts';

const headerSig = 'TrieBlob';
const version = '00.01.00';
const endianSig = 0x0403_0201;

const _binaryFormat = getBinaryFormat();

export interface TrieBlobInfo {
    readonly nodes: Uint32Array;
    readonly info: TrieInfo | undefined;
}

function getBinaryFormat(): BinaryFormat {
    return new BinaryFormatBuilder()
        .addString('sig', 'Signature "TrieBlob"', headerSig)
        .addUint32('endian', 'Endianness signature', endianSig)
        .addString('version', 'Version string', version)
        .addUint32ArrayPtr('nodes', 'Pointer to nodes array')
        .addStringPtr('trieInfo', 'Pointer to TrieInfo JSON string')
        .addString('reserved', 'Reserved space', 64)
        .build();
}

export function encodeTrieBlobToBTrie(blob: TrieBlobInfo): Uint8Array {
    const format = getBinaryFormat();
    const builder = new BinaryDataBuilder(format);
    builder.setPtrUint32Array('nodes', blob.nodes);
    if (blob.info) {
        const infoStr = JSON.stringify(blob.info);
        builder.setPtrString('trieInfo', infoStr);
    }
    const data = builder.build();
    return data;
}

export function decodeTrieBlobToBTrie(blob: Uint8Array): TrieBlobInfo {
    const reader = new BinaryDataReader(blob, getBinaryFormat());

    if (reader.getString('sig') !== headerSig) {
        throw new ErrorDecodeTrieBlob('Invalid TrieBlob Header');
    }
    if (reader.getUint32('endian') !== endianSig) {
        reader.reverseEndian();
        assert(reader.getUint32('endian') === endianSig, 'Invalid TrieBlob Header after endian conversion');
    }

    const fileVersion = reader.getString('version');
    if (fileVersion !== version) {
        console.warn(`Warning: TrieBlob version mismatch. Expected: ${version}, Found: ${fileVersion}`);
        assert(fileVersion.startsWith(version.slice(0, 6)), 'Unsupported TrieBlob version');
    }

    const nodes = reader.getPtrUint32Array('nodes');
    const infoJson = reader.getPtrString('trieInfo');
    const info: TrieInfo | undefined = infoJson ? JSON.parse(infoJson) : undefined;
    return { nodes, info };
}

export class ErrorDecodeTrieBlob extends Error {
    constructor(message: string) {
        super(message);
    }
}
