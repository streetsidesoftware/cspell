import { TrieNode, FLAG_WORD, ChildMap, TrieRoot } from './TrieNode';
import { TrieRefNode } from './trieRef';
import { Sequence, genSequence } from 'gensequence';
import { convertToTrieRefNodes } from './convertToTrieRefNodes';
import { trieNodeToRoot } from './trie-util';

const EOW = '*';
export const DATA = EOW;

function toReferences(node: TrieNode): Sequence<TrieRefNode> {
    return genSequence(convertToTrieRefNodes(node));
}

const regExpEscapeChars = /([[\]\\,:{}*])/g;
const regExTrailingComma = /,(\}|\n)/g;

function escapeChar(char: string): string {
    return char.replace(regExpEscapeChars, '\\$1'); // lgtm[js/incomplete-sanitization]
}

function trieToExportString(node: TrieNode, base: number): Sequence<string> {
    function* walk(node: TrieRefNode): IterableIterator<string> {
        if (node.f) {
            yield EOW;
        }
        if (node.r) {
            const refs = [...node.r].sort((a, b) => (a[0] < b[0] ? -1 : 1));
            for (const n of refs) {
                const [c, r] = n;
                const ref = r ? r.toString(base) : '';
                yield escapeChar(c) + ref + ',';
            }
        }
    }

    return genSequence(walk(node));
}

function generateHeader(base: number, comment: string): Sequence<string> {
    const header = ['#!/usr/bin/env cspell-trie reader', 'TrieXv1', 'base=' + base]
        .concat(comment ? comment.split('\n').map((a) => '# ' + a) : [])
        .concat(['# Data:']);
    return genSequence(header).map((a) => a + '\n');
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
    const rows = toReferences(root).map((node) => {
        const row = [...trieToExportString(node, radix), '\n'].join('').replace(regExTrailingComma, '$1');
        return row;
    });

    return generateHeader(radix, comment).concat(rows);
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
        const headerReg = /^TrieXv1\nbase=(\d+)$/;
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
        lines: number;
        nodes: TrieNode[];
        root: TrieNode;
    }

    const regNotEscapedCommas = /(^|[^\\]),/g;
    const regUnescapeCommas = /__COMMA__/g;
    const regUnescape = /[\\](.)/g;
    const flagsWord = { f: FLAG_WORD };

    function splitLine(line: string) {
        const pattern = '$1__COMMA__';
        return line
            .replace(regNotEscapedCommas, pattern)
            .split(regUnescapeCommas)
            .map((a) => a.replace(regUnescape, '$1'));
    }

    function decodeLine(line: string, nodes: TrieNode[]): TrieNode {
        const isWord = line[0] === EOW;
        line = isWord ? line.slice(1) : line;
        const flags = isWord ? flagsWord : {};
        const children: [string, TrieNode][] = splitLine(line)
            .filter((a) => !!a)
            .map<[string, number]>((a) => [a[0], Number.parseInt(a.slice(1) || '0', radix)])
            .map<[string, TrieNode]>(([k, i]) => [k, nodes[i]]);
        const cNode = children.length ? { c: new ChildMap(children) } : {};
        return { ...cNode, ...flags };
    }

    readHeader(iter);

    const n = genSequence([DATA])
        .concat(iter)
        .map((a) => a.replace(/\r?\n/, ''))
        .filter((a) => !!a)
        .reduce(
            (acc: ReduceResults, line) => {
                const { lines, nodes } = acc;
                const root = decodeLine(line, nodes);
                nodes[lines] = root;
                return { lines: lines + 1, root, nodes };
            },
            { lines: 0, nodes: [], root: {} }
        );
    return trieNodeToRoot(n.root, {});
}
