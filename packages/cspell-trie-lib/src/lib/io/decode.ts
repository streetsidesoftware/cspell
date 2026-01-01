import { decodeBTrie, isBTrieData } from '../TrieBlob/index.ts';
import type { TrieData } from '../TrieData.ts';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.ts';
import { toUint8Array } from '../utils/rawData.ts';
import * as iv1 from './importExportV1.ts';
import * as iv2 from './importExportV2.ts';
import * as iv4 from './importExportV4.ts';
import { importTrieV3AsTrieBlob } from './importV3FastBlob.ts';

export function decodeTrieData(raw: string | ArrayBufferView<ArrayBuffer> | Uint8Array<ArrayBuffer>): TrieData {
    if (typeof raw === 'string') {
        return decodeStringFormat(raw);
    }

    const data = toUint8Array(raw);

    if (isBTrieData(data)) {
        return decodeBTrie(data);
    }

    const decoder = new TextDecoder();
    const text = decoder.decode(data);
    return decodeStringFormat(text);
}

function decodeStringFormat(data: string): TrieData {
    return importTrie(data);
}

type Deserializer = (data: string[]) => TrieData;

const deserializers: readonly Deserializer[] = [
    (data: string[]) => new TrieNodeTrie(iv1.importTrie(data)),
    (data: string[]) => new TrieNodeTrie(iv1.importTrie(data)),
    (data: string[]) => new TrieNodeTrie(iv2.importTrie(data)),
    (data: string[]) => importTrieV3AsTrieBlob(data),
    (data: string[]) => new TrieNodeTrie(iv4.importTrie(data)),
] as const;

const headerReg = /^\s*TrieXv(\d+)/m;

function importTrie(input: Iterable<string> | IterableIterator<string> | string[] | string): TrieData {
    const lines = Array.isArray(input) ? input : typeof input === 'string' ? input.split('\n') : [...input];
    function parseHeaderRows(headerRows: string[]): number {
        for (let i = 0; i < headerRows.length; ++i) {
            const match = headerRows[i].match(headerReg);
            if (match) {
                return Number.parseInt(match[1], 10);
            }
        }
        throw new Error('Unknown file format');
    }

    function readHeader(iter: string[]) {
        const headerRows: string[] = [];
        for (const entry of iter) {
            const line = entry.trim();
            headerRows.push(line);
            if (line === iv1.DATA || line === iv2.DATA) {
                break;
            }
        }
        return headerRows;
    }

    const headerLines = readHeader(lines);
    const version = parseHeaderRows(headerLines);
    const method = deserializers[version];
    if (!method) {
        throw new Error(`Unsupported version: ${version}`);
    }
    return method(lines);
}
