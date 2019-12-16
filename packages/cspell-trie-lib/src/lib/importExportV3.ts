import { TrieNode, FLAG_WORD } from './TrieNode';
import { Sequence, genSequence } from 'gensequence';

const EOW = '$';
const BACK = '<';
const EOL = '\n';

export const DATA = '__DATA__';

function generateHeader(base: number, comment: string): Sequence<string> {
    const header = [
        '#!/usr/bin/env cspell-trie reader',
        'TrieXv3',
        'base=' + base,
    ]
    .concat(comment
        ? comment.split('\n').map(a => '# ' + a)
        : []
    )
    .concat([
        '# Data:',
        DATA,
    ]);
    return genSequence(header).map(a => a + '\n');
}

function *walk(node: TrieNode, depth: number): Generator<string> {
    if (node.f) {
        yield EOW;
        // yield EOL;
    }
    if (node.c) {
        const c = [...node.c].sort((a, b) => a[0] < b[0] ? -1 : 1);
        for (const [s, n] of c) {
            yield s;
            yield *walk(n, depth + 1);
            yield BACK;
            if (depth === 0) yield EOL;
        }
    }
}

export interface ExportOptions {
    base?: number;
    comment?: string;
}

/**
 * Serialize a TrieNode.
 */
export function serializeTrie(root: TrieNode, options: ExportOptions | number = 16): Sequence<string> {
    options = typeof options === 'number' ? { base: options } : options;
    const { base = 16, comment = '' } = options;
    const radix = base > 36 ? 36 : base < 10 ? 10 : base;

    return generateHeader(radix, comment)
        .concat(walk(root, 0));
}

function *toIterableIterator<T>(iter: Iterable<T> | IterableIterator<T>): IterableIterator<T> {
    yield *iter;
}

export function importTrie(linesX: Iterable<string> | IterableIterator<string>): TrieNode {
    // let radix = 16;
    const comment = /^\s*#/;
    const iter = toIterableIterator(linesX);

    function parseHeaderRows(headerRows: string[]) {
        const header = headerRows.slice(0, 2).join('\n');
        const headerReg = /^TrieXv3\nbase=(\d+)$/;
        /* istanbul ignore if */
        if (!headerReg.test(header)) throw new Error('Unknown file format');
        // radix = Number.parseInt(header.replace(headerReg, '$1'), 10);
    }

    function readHeader(iter: Iterator<string>) {

        const headerRows: string[] = [];
        while (true) {
            const next = iter.next();
            if (next.done) { break; }
            const line = next.value.trim();
            if (!line || comment.test(line)) { continue; }
            if (line === DATA) { break; }
            headerRows.push(line);
        }
        parseHeaderRows(headerRows);
    }

    interface ReduceResults {
        stack: TrieNode[];
        nodes: TrieNode[];
        root: TrieNode;
    }

    readHeader(iter);

    const root: TrieNode = {};

    const n = genSequence(iter)
        .concatMap(a => a.split(''))
        .reduce((acc: ReduceResults, s) => {
            const { root, nodes, stack } = acc;
            const node = stack[stack.length - 1];
            switch (s) {
                case EOL:
                    // ignore line breaks;
                    break;
                case EOW:
                    node.f = FLAG_WORD;
                    break;
                case BACK:
                    stack.pop();
                    break;
                default:
                    node.c = node.c ?? new Map<string, TrieNode>();
                    const n = {};
                    node.c.set(s, n);
                    stack.push(n);
                    break;
            }
            return { root, nodes, stack };
        }, { nodes: [], root, stack: [root] });
    return n.root;
}
