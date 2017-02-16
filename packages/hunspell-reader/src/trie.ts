import * as GS from 'gensequence';
import {Sequence} from 'gensequence';
import * as Rx from 'rxjs/Rx';

export const FLAG_WORD = 1;

export class RefMap extends Map<string, number> {};
export class ChildMap extends Map<string, TrieNode> {};

export interface TrieNode {
    h?: string; // hash
    f?: number; // flags
    c?: ChildMap;
}

export interface TrieRefNode extends TrieNode {
    r?: RefMap;
}

export function insert(text: string, node: TrieNode = {}): TrieNode {
    if (text.length) {
        const head = text[0];
        const tail = text.slice(1);
        node.c = node.c || new ChildMap();
        node.c.set(head, insert(tail, node.c.get(head)));
    } else {
        node.f = (node.f || 0) | FLAG_WORD;
    }
    return node;
}

/**
 * Sorts the nodes in a trie in place.
 */
export function orderTrie(node: TrieNode) {
    if (!node.c) return;

    const nodes = [...node.c].sort(([a], [b]) => a < b ? -1 : 1);
    node.c = new Map(nodes);
    for (const n of node.c) {
        orderTrie(n[1]);
    }
}

export interface YieldResult {
    text: string;
    node: TrieNode;
    depth: number;
}


/**
 * Generator an iterator that will walk the Trie parent then children in a depth first fashion that preserves sorted order.
 */
export function iterateTrie(node: TrieNode): Sequence<YieldResult> {
    function* iterate(node: TrieNode, text: string, depth: number): IterableIterator<YieldResult> {
        const r = { node, text, depth };
        yield r;
        if (node.c) {
            for (const n of node.c) {
                const [t, c] = n;
                yield* iterate(c, text + t, depth + 1);
            }
        }
    }

    return GS.genSequence(iterate(node, '', 0));
}


/**
 * Generate a Iterator that can walk a Trie and yield the words.
 */
export function iteratorTrieWords(node: TrieNode): Sequence<string> {
    return GS.genSequence(iterateTrie(node))
        .filter(r => ((r.node.f || 0) & FLAG_WORD) === FLAG_WORD)
        .map(r => r.text);
}

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

    return GS.genSequence(walk(node, ''));
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

    return GS.genSequence(walk());
}

const regExpEscapeChars = /([\[\]\\,:{}*])/;
const regExTrailingComma = /,(\}|\n)/g;

function escapeChar(char: string): string {
    return char.replace(regExpEscapeChars, '\\$1');
}

export function trieToExportString(node: TrieNode, base = 16): Sequence<string> {
    function* walk(node: TrieRefNode): IterableIterator<string> {
        if (node.f) {
            yield '*';
        }
        if (node.c) {
            yield '[';
            for (const n of node.c) {
                yield escapeChar(n[0]) + '[';
                yield* walk(n[1]);
                yield ']';
            }
            yield ']';
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

    return GS.genSequence(walk(node));
}


function generateHeader(base: number): Sequence<string> {
    const header = [
        'TrieXv1',
        'base=' + base,
    ];
    return GS.genSequence(header)
        .map(a => a + '\n');
}


export function exportTrie(node: TrieNode, base = 16): Sequence<string> {
    const rows = flattenToReferences(node)
        .map(node => {
            const row = [
                ...trieToExportString(node, base),
                '\n',
            ]
            .join('').replace(regExTrailingComma, '$1');
            return row;
        });

    return generateHeader(base)
        .concat(rows);
}


export function importTrieRx(lines: Rx.Observable<string>): Rx.Observable<TrieNode> {
    const headerLines = new Rx.Subject<string>();

    let radix = 16;

    headerLines
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
        .do(r => {
            console.log(r.lines);
        })
        .map(r => r.root)
        ;

    return r;
}
