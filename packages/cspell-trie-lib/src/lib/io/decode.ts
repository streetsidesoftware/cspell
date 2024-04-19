import type { TrieData } from '../TrieData.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import * as iv1 from './importExportV1.js';
import * as iv2 from './importExportV2.js';
import * as iv4 from './importExportV4.js';
import { importTrieV3AsFastTrieBlob } from './importV3FastBlob.js';

export function decodeTrieData(raw: string | Buffer): TrieData {
    // Binary format detection can be added here.
    return decodeStringFormat(typeof raw === 'string' ? raw : raw.toString('utf8'));
}

function decodeStringFormat(data: string): TrieData {
    return importTrie(data);
}

type Deserializer = (data: string[]) => TrieData;

const deserializers: readonly Deserializer[] = [
    (data: string[]) => new TrieNodeTrie(iv1.importTrie(data)),
    (data: string[]) => new TrieNodeTrie(iv1.importTrie(data)),
    (data: string[]) => new TrieNodeTrie(iv2.importTrie(data)),
    (data: string[]) => importTrieV3AsFastTrieBlob(data),
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
