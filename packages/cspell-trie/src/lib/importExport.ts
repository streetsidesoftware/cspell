import { TrieNode, FLAG_WORD, ChildMap } from './TrieNode';
import { TrieRefNode, RefMap } from './trieRef';
import { Sequence, genSequence } from 'gensequence';
import * as Rx from 'rxjs/Rx';

interface LeafResult { n: TrieRefNode; p?: TrieRefNode; k: string; }

function leaves(node: TrieNode): Sequence<LeafResult> {
    function *walk(node: TrieNode, k: string, p?: TrieNode): IterableIterator<LeafResult> {
        if (!node.c) {
            yield { n: node, p, k};
        } else {
            const children = [...node.c];
            for (const n of children) {
                yield* walk(n[1], n[0], node);
            }
        }
    }

    return genSequence(walk(node, ''));
}

function flattenToReferences(node: TrieNode): Sequence<TrieNode> {

    function * walk() {
        let iterations = 100;
        let processed = 0;
        let index = 0;

        function hash(node: TrieRefNode): string {
            const flags = node.f ? '*' : '';
            const refs = node.r ? '{' + [...node.r].sort((a, b) => a[0] < b[0] ? -1 : 1).map(a => a.join(':')).join(',') + '}' : '';
            return flags + refs;
        }

        do {
            processed = 0;
            let hashMap = new Map<string, number>();
            for (const leaf of leaves(node)) {
                const h = hash(leaf.n);
                let m = hashMap.get(h);
                if (m === undefined) {
                    // first time, add it to hash
                    yield leaf.n;
                    m = index;
                    hashMap.set(h, m);
                    index += 1;
                }

                // Fix up the parent
                if (leaf.p && leaf.p.c) {
                    leaf.p.r = leaf.p.r || new RefMap();
                    leaf.p.r.set(leaf.k, m);
                    leaf.p.c.delete(leaf.k);
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

const regExpEscapeChars = /([\[\]\\,:{}*])/;
const regExTrailingComma = /,(\}|\n)/g;

function escapeChar(char: string): string {
    return char.replace(regExpEscapeChars, '\\$1');
}

function trieToExportString(node: TrieNode, base: number): Sequence<string> {
    function* walk(node: TrieRefNode): IterableIterator<string> {
        if (node.f) {
            yield '*';
        }
        if (node.r) {
            const refs = [...node.r].sort((a, b) => a[0] < b[0] ? -1 : 1);
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
    const header = [
        '#!/usr/bin/env cspell-trie reader',
        'TrieXv1',
        'base=' + base,
    ]
    .concat(comment
        ? comment.split('\n').map(a => '# ' + a)
        : []
    )
    .concat([
        '# Data:'
    ]);
    return genSequence(header)
        .map(a => a + '\n');
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
export function serializeTrie(root: TrieNode, options: ExportOptions | number = 16): Sequence<string> {
    options = typeof options === 'number' ? { base: options } : options;
    const { base = 16, comment = '' } = options;
    const radix = base > 36 ? 36 : base < 10 ? 10 : base;
    const rows = flattenToReferences(root)
        .map(node => {
            const row = [
                ...trieToExportString(node, radix),
                '\n',
            ]
            .join('').replace(regExTrailingComma, '$1');
            return row;
        });

    return generateHeader(radix, comment)
        .concat(rows);
}


export function importTrieRx(lines: Rx.Observable<string>): Rx.Observable<TrieNode> {
    const headerLines = new Rx.Subject<string>();

    let radix = 16;
    const comment = /^\s*#/;

    headerLines
        .filter(a => !!a.trim())
        .filter(a => !comment.test(a))
        .take(2)
        .map(a => a.trim())
        .toArray()
        .subscribe(headerRows => {
            const header = headerRows.join('\n');
            const headerReg = /^TrieXv1\nbase=(\d+)$/;
            if (!headerReg.test(header)) throw new Error('Unknown file format');
            radix = Number.parseInt(header.replace(headerReg, '$1'), 10);
        });

    interface ReduceResults {
        lines: number;
        nodes: TrieNode[];
        root: TrieNode;
    }

    const regNotEscapedCommas = /(^|[^\\]),/g;
    const regUnescapeCommas = /__COMMA__/g;
    const regUnescape = /[\\](.)/g;

    function splitLine(line: string) {
        const pattern = '$1__COMMA__';
        return line
            .replace(regNotEscapedCommas, pattern)
            .split(regUnescapeCommas)
            .map(a => a.replace(regUnescape, '$1'));
    }

    function decodeLine(line: string, nodes: TrieNode[]): TrieNode {
        const isWord = line[0] === '*';
        line = isWord ? line.slice(1) : line;
        const flags = isWord ? { f: FLAG_WORD } : {};
        const children: [string, TrieNode][] = splitLine(line)
            .filter(a => !!a)
            .map<[string, number]>(a => [
                a[0],
                Number.parseInt((a.slice(1) || '0'), radix),
            ])
            .map<[string, TrieNode]>(([k, i]) => [k, nodes[i]]);
        const cNode = children.length ? { c: new ChildMap(children) } : {};
        return {...cNode, ...flags};
    }

    const r = lines
        .do<string>(headerLines)
        .map(a => a.trim())
        .skipWhile(line => line !== '*')
        .filter(a => !!a)
        .reduce<string, ReduceResults>((acc, line) => {
            const { lines, nodes } = acc;
            const root = decodeLine(line, nodes);
            nodes[lines] = root;
            return { lines: lines + 1, root, nodes };
        }, { lines: 0, nodes: [], root: {} })
        .map(r => r.root)
        ;

    return r;
}
