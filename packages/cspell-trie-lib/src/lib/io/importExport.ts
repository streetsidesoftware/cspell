import { toDistributableIterable } from '@cspell/cspell-pipe';

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

const deserializers = [iv1.importTrie, iv1.importTrie, iv2.importTrie, iv3.importTrie, iv4.importTrie] as const;

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

export function importTrie(lines: Iterable<string> | IterableIterator<string> | string[]): TrieRoot {
    const aLines = Array.isArray(lines) ? lines : [...lines];
    function parseHeaderRows(headerRows: string[]): number {
        const header = headerRows.join('\n');
        const headerReg = /^\s*TrieXv(\d+)/m;
        const match = header.match(headerReg);
        if (!match) throw new Error('Unknown file format');
        return parseInt(match[1], 10);
    }

    function readHeader(iter: Iterable<string>) {
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

    const input = toDistributableIterable(aLines);
    const headerLines = readHeader(input);
    const version = parseHeaderRows(headerLines);
    const stream = [...headerLines, ...input];
    const method = deserializers[version];
    if (!method) {
        throw new Error(`Unsupported version: ${version}`);
    }
    return method(stream);
}
