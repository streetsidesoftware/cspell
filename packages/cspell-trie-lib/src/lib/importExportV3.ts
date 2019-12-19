import { TrieNode, FLAG_WORD } from './TrieNode';
import { Sequence, genSequence } from 'gensequence';
import { bufferLines } from './bufferLines';
import { IterableLike } from './IterableLike';

const EOW = '$';
const BACK = '<';
const EOL = '\n';
const LF = '\r';
const REF = '#';
const EOR = ';';
const ESCAPE = '\\';

const specialCharacters = new Set(
    [EOW, BACK, EOL, REF, EOR, ESCAPE, LF]
    .concat('0123456789'.split(''))
    .concat('`~!@#$%^&*()_-+=[]{};:\'"<>,./?\\|'.split(''))
);

const specialCharacterMap = new Map([
    ['\n', '\\n'], ['\r', '\\r'], ['\\', '\\\\'],
]);
const characterMap = new Map([...specialCharacterMap].map(a => [a[1], a[0]]));

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

    function escape(s: string): string {
        return (specialCharacters.has(s)) ? ESCAPE + (specialCharacterMap.get(s) || s) : s;
    }

    function *walk(node: TrieNode, depth: number): Generator<string> {
        const r = cache.get(node);
        if (r !== undefined) {
            // EOW is only possible if children are yielded first.
            // yield (node.f && !node.c) ? EOW : ref(r);
            yield ref(r);
            return;
        }
        cache.set(node, count++);
        if (node.c) {
            const c = [...node.c].sort((a, b) => a[0] < b[0] ? -1 : 1);
            for (const [s, n] of c) {
                yield  escape(s);
                yield *walk(n, depth + 1);
                yield BACK;
                if (depth === 0) yield EOL;
            }
        }
        // Output EOW after children so it can be optimized.
        if (node.f) {
            yield EOW;
            // yield EOL;
        }
    }

    return generateHeader(radix, comment)
        .concat(bufferLines(bufferLines(walk(root, 0), 120, '\n'), 10, ''));
}

function *toIterableIterator<T>(iter: IterableLike<T>): IterableIterator<T> {
    yield *iter;
}

interface Stack {
    node: TrieNode;
    s: string;
}

interface ReduceResults {
    stack: Stack[];
    nodes: TrieNode[];
    root: TrieNode;
    parser: Reducer | undefined;
}

type Reducer = (acc: ReduceResults, s: string) => ReduceResults;

const eow: TrieNode = Object.freeze({ f: 1 });

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
            const line = next.value.trim().replace(/\r|\n/g, '');
            if (!line || comment.test(line)) { continue; }
            if (line === DATA) { break; }
            headerRows.push(line);
        }
        parseHeaderRows(headerRows);
    }

    readHeader(iter);

    const root: TrieNode = {};

    const n = genSequence(iter)
        .concatMap(a => a.split(''))
        .reduce(
            parseStream(radix),
            { nodes: [ root ], root, stack: [{ node: root, s: '' }], parser: undefined  }
        );
    return n.root;
}

function parseStream(radix: number): Reducer {
    function parseReference(acc: ReduceResults, _: string): ReduceResults {
        let ref = '';

        function parser(acc: ReduceResults, s: string): ReduceResults {
            if (s === EOR) {
                const { root, nodes, stack } = acc;
                const r = parseInt(ref, radix);
                const top = stack[stack.length - 1];
                const p = stack[stack.length - 2].node;
                p.c?.set(top.s, nodes[r]);
                return { root, nodes, stack, parser: undefined };
            }
            ref = ref + s;
            return acc;
        }

        const { nodes } = acc;
        nodes.pop();
        return {...acc, nodes, parser};
    }

    function parseEscapeCharacter(acc: ReduceResults, _: string): ReduceResults {
        let prev = '';
        const parser = function (acc: ReduceResults, s: string): ReduceResults {
            if (prev) {
                s = characterMap.get(prev + s) || s;
                return parseCharacter({...acc, parser: undefined}, s);
            }
            if (s === ESCAPE) {
                prev = s;
                return acc;
            }
            return parseCharacter({...acc, parser: undefined}, s);
        };
        return {...acc, parser};
    }

    function parseCharacter(acc: ReduceResults, s: string): ReduceResults {
        const parser = undefined;
        const { root, nodes, stack } = acc;
        const top = stack[stack.length - 1];
        const node = top.node;
        node.c = node.c ?? new Map<string, TrieNode>();
        const n = { f: undefined, c: undefined };
        node.c.set(s, n);
        stack.push({ node: n, s });
        nodes.push(n);
        return { root, nodes, stack, parser };
    }

    function parseEOW(acc: ReduceResults, _: string): ReduceResults {
        const { root, nodes, stack, parser } = acc;
        const top = stack[stack.length - 1];
        const node = top.node;
        node.f = FLAG_WORD;
        if (!node.c) {
            top.node = eow;
        }
        return { root, nodes, stack, parser };
    }

    function parseBack(acc: ReduceResults, _: string): ReduceResults {
        const { stack } = acc;
        stack.pop();
        return acc;
    }

    function parseIgnore(acc: ReduceResults, _: string): ReduceResults {
        return acc;
    }

    const parsers = new Map<string, Reducer>([
        [EOW, parseEOW],
        [BACK, parseBack],
        [REF, parseReference],
        [ESCAPE, parseEscapeCharacter],
        [EOL, parseIgnore],
        [LF, parseIgnore],
    ]);

    return function (acc: ReduceResults, s: string): ReduceResults {
        const parser = acc.parser ?? parsers.get(s) ?? parseCharacter;
        return parser(acc, s);
    };
}
