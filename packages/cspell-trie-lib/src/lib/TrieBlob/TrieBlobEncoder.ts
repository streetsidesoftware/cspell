import type { BinaryFormat } from '../binary/index.ts';
import { BinaryDataBuilder, BinaryDataReader, BinaryFormatBuilder } from '../binary/index.ts';
import {
    cvtTrieCharacteristicsToFlags,
    cvtTrieInfoToFlags,
    parseTrieCharacteristics,
    parseTrieInfoFlags,
} from '../ITrieNode/TrieInfo.ts';
import { decodeStringTableFromBinary, encodeStringTableToBinary } from '../StringTable/StringTable.ts';
import { assert } from '../utils/assert.ts';
import { toUint8Array } from '../utils/rawData.ts';
import type { TrieBlobInfo } from './TrieBlobInfo.ts';

const headerSig = 'TrieBlob';
const version = '00.01.00';
const endianSig = 0x0403_0201;

function getBinaryFormat(): BinaryFormat {
    return new BinaryFormatBuilder()
        .addString('sig', 'Signature "TrieBlob"', headerSig)
        .addUint32('endian', 'Endianness signature', endianSig)
        .addString('version', 'Version string', version)
        .addUint32ArrayPtr('nodes', 'Pointer to nodes array')
        .addString('reserved0', 'Old Pointer to TrieInfo JSON string', 8)
        .addString('trieInfo', 'Pointer to TrieInfo JSON string', 16)
        .addString('characteristics', 'Available characteristic values', 8)
        .addUint8ArrayPtr('stringTable', 'Pointer to String Table data')
        .addString('reserved', 'Reserved space', 64)
        .build();
}

type U8Array = Uint8Array<ArrayBuffer>;

export function encodeTrieBlobToBTrie(blob: TrieBlobInfo): U8Array {
    const format = getBinaryFormat();
    const builder = new BinaryDataBuilder(format);
    builder.setPtrUint32Array('nodes', blob.nodes);
    builder.setString('trieInfo', cvtTrieInfoToFlags(blob.info));
    builder.setString('characteristics', cvtTrieCharacteristicsToFlags(blob.characteristics));

    if (blob.stringTable.length) {
        const stringTableData = encodeStringTableToBinary(blob.stringTable, builder.endian);
        builder.setPtrUint8Array('stringTable', stringTableData);
    }

    const data = builder.build();
    return data;
}

export function decodeTrieBlobToBTrie(blob: U8Array): TrieBlobInfo {
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
    const info = parseTrieInfoFlags(reader.getString('trieInfo'));
    const characteristics = parseTrieCharacteristics(reader.getString('characteristics'));

    const stringTableData = reader.getPtrUint8Array('stringTable');
    const stringTable = decodeStringTableFromBinary(stringTableData, reader.endian);

    return { nodes, stringTable, info, characteristics };
}

export class ErrorDecodeTrieBlob extends Error {
    constructor(message: string) {
        super(message);
    }
}

export function isBTrieData(data: U8Array | ArrayBufferView<ArrayBuffer>): boolean {
    const buf = toUint8Array(data);
    if (buf.length < headerSig.length) return false;

    for (let i = 0; i < headerSig.length; i++) {
        if (buf[i] !== headerSig.codePointAt(i)) {
            return false;
        }
    }
    return true;
}
