import type { Sequence } from 'gensequence';
import { genSequence } from 'gensequence';

import { trieNodeToRoot } from '../trie-util';
import type { TrieNode, TrieRoot } from '../TrieNode';
import { ChildMap, FLAG_WORD } from '../TrieNode';

const EOW = '*';
export const DATA = '__DATA__';

interface TrieRefNode extends TrieNode {
    s: string;
    r?: number[];
}

interface LeafResult {
    n: TrieRefNode;
    p?: TrieRefNode | undefined;
}

interface Line {
    letter: string;
    isWord: boolean;
    refs: number[];
}

function leaves(node: TrieRefNode): Sequence<LeafResult> {
    function toRefNode(node: TrieNode, k: string): TrieRefNode {
        const refNode = node as TrieRefNode;
        refNode.s = refNode.s ?? k;
        return refNode;
    }

    function* walk(node: TrieNode, k: string, p?: TrieRefNode): IterableIterator<LeafResult> {
        const ref = toRefNode(node, k);
        if (!ref.c) {
            yield { n: ref, p };
        } else {
            for (const n of ref.c) {
                yield* walk(n[1], n[0], ref);
            }
        }
    }

    return genSequence(walk(node, ''));
}

function flattenToReferences(node: TrieRefNode): Sequence<TrieRefNode> {
    function* walk(): IterableIterator<TrieRefNode> {
        let iterations = 100;
        let processed = 0;
        let index = 0;

        do {
            processed = 0;
            const signatureMap = new Map<string, number>();
            for (const leaf of leaves(node)) {
                const h = signature(leaf.n);
                let m = signatureMap.get(h);
                if (m === undefined) {
                    // first time, add it to hash
                    yield leaf.n;
                    m = index;
                    signatureMap.set(h, m);
                    index += 1;
                }

                // Fix up the parent
                /* istanbul ignore else */
                if (leaf.p && leaf.p.c) {
                    leaf.p.r = leaf.p.r || [];
                    leaf.p.r.push(m);
                    leaf.p.c.delete(leaf.n.s);
                    if (!leaf.p.c.size) {
                        delete leaf.p.c;
                    }
                }
                processed += 1;
            }
            iterations -= 1;
        } while (processed && iterations && node.c);

        yield node;
    }

    return genSequence(walk());
}

function signature(node: TrieRefNode): string {
    const flags = node.f ? EOW : '';
    const refs = node.r ? node.r.sort((a, b) => a - b).join(',') : '';
    return node.s + flags + refs;
}

function toLine(node: TrieRefNode, base: number): string {
    const flags = node.f ? EOW : '';
    const refs = node.r
        ? node.r
              .sort((a, b) => a - b)
              .map((r) => r.toString(base))
              .join(',')
        : '';
    return node.s + flags + refs;
}

function generateHeader(base: number, comment: string): Sequence<string> {
    const header = ['#!/usr/bin/env cspell-trie reader', 'TrieXv2', 'base=' + base]
        .concat(comment ? comment.split('\n').map((a) => '# ' + a) : [])
        .concat(['# Data:', DATA]);
    return genSequence(header);
}

export interface ExportOptions {
    base?: number;
    comment?: string;
}

/**
 * Serialize a TrieNode.
 * Note: This is destructive.  The node will no longer be usable.
 * Even though it is possible to preserve the trie, dealing with very large tries can consume a lot of memory.
 * Considering this is the last step before exporting, it was decided to let this be destructive.
 */
export function serializeTrie(root: TrieRoot, options: ExportOptions | number = 16): Sequence<string> {
    options = typeof options === 'number' ? { base: options } : options;
    const { base = 16, comment = '' } = options;
    const radix = base > 36 ? 36 : base < 10 ? 10 : base;
    const rootRef: TrieRefNode = { ...root, s: '^' };
    const rows = flattenToReferences(rootRef).map((n) => toLine(n, base));

    return generateHeader(radix, comment)
        .concat(rows)
        .map((a) => a + '\n');
}

function* toIterableIterator<T>(iter: Iterable<T> | IterableIterator<T>): IterableIterator<T> {
    yield* iter;
}

export function importTrie(linesX: Iterable<string> | IterableIterator<string>): TrieRoot {
    let radix = 16;
    const comment = /^\s*#/;
    const iter = toIterableIterator(linesX);

    function parseHeaderRows(headerRows: string[]) {
        const header = headerRows.slice(0, 2).join('\n');
        const headerReg = /^TrieXv2\nbase=(\d+)$/;
        /* istanbul ignore if */
        if (!headerReg.test(header)) throw new Error('Unknown file format');
        radix = Number.parseInt(header.replace(headerReg, '$1'), 10);
    }

    function readHeader(iter: Iterator<string>) {
        const headerRows: string[] = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const next = iter.next();
            if (next.done) {
                break;
            }
            const line = next.value.trim();
            if (!line || comment.test(line)) {
                continue;
            }
            if (line === DATA) {
                break;
            }
            headerRows.push(line);
        }
        parseHeaderRows(headerRows);
    }

    interface ReduceResults {
        nodes: TrieRefNode[];
        root: TrieRefNode;
    }

    function parseLine(line: string, base: number): Line {
        const isWord = line[1] === EOW;
        const refOffset = isWord ? 2 : 1;
        const refs = line
            .slice(refOffset)
            .split(',')
            .filter((a) => !!a)
            .map((r) => parseInt(r, base));
        return {
            letter: line[0],
            isWord,
            refs,
        };
    }

    const flagsWord = { f: FLAG_WORD };

    function decodeLine(line: string, nodes: TrieRefNode[]): TrieRefNode {
        const { letter, isWord, refs } = parseLine(line, radix);
        const flags = isWord ? flagsWord : {};
        const children: [string, TrieRefNode][] = refs
            .map((r) => nodes[r])
            .sort((a, b) => (a.s < b.s ? -1 : 1))
            .map((n) => [n.s, n]);
        const cNode = children.length ? { c: new ChildMap(children) } : {};
        return { s: letter, ...cNode, ...flags };
    }

    readHeader(iter);

    const n = genSequence(iter)
        .map((a) => a.replace(/\r?\n/, ''))
        .filter((a) => !!a)
        .reduce(
            (acc: ReduceResults, line) => {
                const { nodes } = acc;
                const root = decodeLine(line, nodes);
                nodes.push(root);
                return { root, nodes };
            },
            { nodes: [], root: { s: '', c: new Map<string, TrieNode>() } }
        );

    return trieNodeToRoot(n.root, {});
}
