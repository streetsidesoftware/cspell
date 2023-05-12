import type { TrieRoot } from '../TrieNode/TrieNode.js';
import * as iv1 from './importExportV1.js';
import * as iv2 from './importExportV2.js';
import * as iv3 from './importExportV3.js';
import * as iv4 from './importExportV4.js';

export interface ExportOptions {
    base?: number;
    comment?: string;
    version?: number;
    addLineBreaksToImproveDiffs?: boolean;
}

type Serializer = (root: TrieRoot, options?: number | ExportOptions) => Iterable<string>;

const serializers: readonly Serializer[] = [
    iv1.serializeTrie,
    iv1.serializeTrie,
    iv2.serializeTrie,
    iv3.serializeTrie,
    iv4.serializeTrie,
] as const;

type Deserializer = (data: string[]) => TrieRoot;

const deserializers: readonly Deserializer[] = [
    iv1.importTrie,
    iv1.importTrie,
    iv2.importTrie,
    iv3.importTrie,
    iv4.importTrie,
] as const;

const DEFAULT_VERSION = 3;

/**
 * Serialize a TrieNode.
 * Note: This is destructive.  The node will no longer be usable.
 * Even though it is possible to preserve the trie, dealing with very large tries can consume a lot of memory.
 * Considering this is the last step before exporting, it was decided to let this be destructive.
 */
export function serializeTrie(root: TrieRoot, options: ExportOptions | number = 16): Iterable<string> {
    const version = typeof options !== 'number' && options.version ? options.version : DEFAULT_VERSION;
    const method = serializers[version];
    if (!method) {
        throw new Error(`Unknown version: ${version}`);
    }
    return method(root, options);
}

const headerReg = /^\s*TrieXv(\d+)/m;

export function importTrie(input: Iterable<string> | IterableIterator<string> | string[] | string): TrieRoot {
    const lines = Array.isArray(input) ? input : typeof input === 'string' ? input.split('\n') : [...input];
    function parseHeaderRows(headerRows: string[]): number {
        for (let i = 0; i < headerRows.length; ++i) {
            const match = headerRows[i].match(headerReg);
            if (match) {
                return parseInt(match[1], 10);
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
