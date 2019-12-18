import { TrieNode, FLAG_WORD } from './TrieNode';
import { Sequence, genSequence } from 'gensequence';
import { bufferLines } from './bufferLines';
import { IterableLike } from './IterableLike';

const EOW = '$';
const BACK = '<';
const EOL = '\n';
const REF = '#';
const EOR = ';';

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
    const cache = new Map<TrieNode, number>();
    let count = 0;


    function ref(n: number): string {
        return '#' + n.toString(radix) + ';';
    }

    function *walk(node: TrieNode, depth: number): Generator<string> {
        const r = cache.get(node);
        if (r !== undefined) {
            yield ref(r); // (node.f && !node.c) ? EOW : ref(r);
            return;
        }
        cache.set(node, count++);
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

    return generateHeader(radix, comment)
        .concat(bufferLines(bufferLines(walk(root, 0), 120, '\n'), 10, ''));
}

function *toIterableIterator<T>(iter: IterableLike<T>): IterableIterator<T> {
    yield *iter;
}

export function importTrie(linesX: IterableLike<string>): TrieNode {
    let radix = 16;
    const comment = /^\s*#/;
    const iter = toIterableIterator(linesX);

    function parseHeaderRows(headerRows: string[]) {
        const header = headerRows.slice(0, 2).join('\n');
        const headerReg = /^TrieXv3\nbase=(\d+)$/;
        /* istanbul ignore if */
        if (!headerReg.test(header)) throw new Error('Unknown file format');
        radix = Number.parseInt(header.replace(headerReg, '$1'), 10);
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

    interface Stack {
        node: TrieNode;
        s: string;
        p: TrieNode;
    }

    interface ReduceResults {
        stack: Stack[];
        nodes: TrieNode[];
        root: TrieNode;
        ref: string | undefined;
    }

    readHeader(iter);

    const root: TrieNode = {};

    const n = genSequence(iter)
        .concatMap(a => a.split(''))
        .reduce((acc: ReduceResults, s) => {
            const { root, nodes, stack } = acc;
            const top = stack[stack.length - 1];
            const node = top.node;
            let ref = acc.ref;
            if (ref !== undefined) {
                const p = top.p;
                if (s === EOR) {
                    const r = parseInt(ref, radix);
                    p.c?.set(top.s, nodes[r]);
                    return { root, nodes, stack, ref: undefined };
                }
                return { root, nodes, stack, ref: ref + s };
            }
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
                case REF:
                    nodes.pop();
                    ref = '';
                    break;
                default:
                    node.c = node.c ?? new Map<string, TrieNode>();
                    const n = {};
                    node.c.set(s, n);
                    stack.push({ node: n, p: node, s });
                    nodes.push(n);
                    break;
            }
            return { root, nodes, stack, s, ref };
        }, { nodes: [ root ], root, stack: [{ node: root, p: root, s: '' }], ref: undefined });
    return n.root;
}
