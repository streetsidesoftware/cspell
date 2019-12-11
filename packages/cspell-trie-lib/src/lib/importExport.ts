import { Sequence, genSequence } from 'gensequence';
import { TrieNode } from './TrieNode';
import * as ieV1 from './importExportV1';
import * as ieV2 from './importExportV2';

export interface ExportOptions {
    base?: number;
    comment?: string;
    version?: number;
}

/**
 * Serialize a TrieNode.
 * Note: This is destructive.  The node will no longer be usable.
 * Even though it is possible to preserve the trie, dealing with very large tries can consume a lot of memory.
 * Considering this is the last step before exporting, it was decided to let this be destructive.
 */
export function serializeTrie(root: TrieNode, options: ExportOptions | number = 16): Sequence<string> {
    if (typeof options !== 'number' && options.version === 2) {
        return ieV2.serializeTrie(root, options);
    }

    return ieV1.serializeTrie(root, options);
}



export function importTrie(lines: Iterable<string> | IterableIterator<string>): TrieNode {
    const comment = /^\s*#/;

    function parseHeaderRows(headerRows: string[]): number {
        const header = headerRows.join('\n');
        const headerReg = /\bTrieXv(\d+)/;
        /* istanbul ignore if */
        const match = header.match(headerReg);
        if (!match) throw new Error('Unknown file format');
        return parseInt(match[1], 10);
    }

    function readHeader(iter: Iterator<string>) {

        const headerRows: string[] = [];
        while (true) {
            const next = iter.next();
            if (next.done) { break; }
            const line = next.value.trim();
            if (!line || comment.test(line)) { continue; }
            if (line === ieV1.DATA || line === ieV2.DATA) { break; }
            headerRows.push(line);
        }

        return headerRows;
    }

    const input = genSequence(lines);
    const headerLines = readHeader(input);
    const version = parseHeaderRows(headerLines);
    const stream = genSequence(headerLines).concat(input);
    switch (version) {
        case 1: return ieV1.importTrie(stream);
        case 2: return ieV2.importTrie(stream);
        default:
            throw new Error(`Unsupported version: ${version}`);
    }
}
