/* eslint-disable no-irregular-whitespace */
/**
 * Trie file format v4
 *
 * Trie format v4 is very similar to v3. The v4 reader can even read v3 files.
 * The motivation behind v4 is to reduce the cost of storing `.trie` files in git.
 * When a word is added in v3, nearly the entire file is changed due to the absolute
 * references. V4 adds an index sorted by the most frequently used reference to the least.
 * Because git diff is line based, it is important to add line breaks at logical points.
 * V3 added line breaks just to make sure the lines were not too long, V4 takes a different
 * approach. Line breaks are added at two distinct points. First, at the start of each two
 * letter prefix and second after approximately 50 words have been emitted.
 *
 * To improve readability and git diff, at the beginning of each two letter prefix,
 * a comment is emitted.
 *
 * Example:
 *
 * ```
 * /* ab *​/
 * ```
 */

import { opConcatMap, opFilter, pipeSync as pipe } from '@cspell/cspell-pipe';
import { genSequence, Sequence } from 'gensequence';
import { trieNodeToRoot } from '../trie-util';
import { FLAG_WORD, TrieNode, TrieRoot } from '../TrieNode';
import { bufferLines } from '../utils/bufferLines';

const EOW = '$'; // End of word
const BACK = '<'; // Move up the tree
const EOL = '\n'; // End of Line (ignored)
const LF = '\r'; // Line Feed (ignored)
const REF = '#'; // Start absolute of Reference
const REF_REL = '@'; // Start indexed of Reference
const EOR = ';'; // End of Reference
const ESCAPE = '\\';
const REF_INDEX_BEGIN = '[';
const REF_INDEX_END = ']';
const INLINE_DATA_COMMENT_LINE = '/';

const specialCharacters = stringToCharSet(
    [EOW, BACK, EOL, REF, REF_REL, EOR, ESCAPE, LF, REF_INDEX_BEGIN, REF_INDEX_END, INLINE_DATA_COMMENT_LINE]
        .concat('0123456789'.split(''))
        .concat('`~!@#$%^&*()_-+=[]{};:\'"<>,./?\\|'.split(''))
        .join('')
);

const SPECIAL_CHARACTERS_MAP = [
    ['\n', '\\n'],
    ['\r', '\\r'],
    ['\\', '\\\\'],
] as const;

const specialCharacterMap = stringToCharMap(SPECIAL_CHARACTERS_MAP);
const characterMap = stringToCharMap(SPECIAL_CHARACTERS_MAP.map((a) => [a[1], a[0]]));

const WORDS_PER_LINE = 50;

export const DATA = '__DATA__';

function generateHeader(base: number, comment: string): string {
    const comments = comment
        .split('\n')
        .map((a) => '# ' + a.trimEnd())
        .join('\n');

    return `\
#!/usr/bin/env cspell-trie reader
TrieXv4
base=${base}
${comments}
# Data:
${DATA}
`;
}

export interface ExportOptions {
    base?: number;
    comment?: string;
    /**
     * This will reduce the size of the `.trie` file by removing references to short suffixes.
     * But it does increase the size of the trie when loaded into memory.
     */
    optimizeSimpleReferences?: boolean;
}

/**
 * Serialize a TrieRoot.
 */
export function serializeTrie(root: TrieRoot, options: ExportOptions | number = 16): Sequence<string> {
    options = typeof options === 'number' ? { base: options } : options;
    const { base = 10, comment = '' } = options;
    const radix = base > 36 ? 36 : base < 10 ? 10 : base;
    const cache = new Map<TrieNode, number>();
    const refMap = buildReferenceMap(root, base);
    const nodeToIndexMap = new Map(refMap.refCounts.map(([node], index) => [node, index]));
    let count = 0;
    const backBuffer = { last: '', count: 0, words: 0 };
    const wordChars: string[] = [];

    function ref(n: number, idx: number | undefined): string {
        const r = idx === undefined || n < idx ? REF + n.toString(radix) : REF_REL + idx.toString(radix);
        return radix === 10 ? r : r + ';';
    }

    function escape(s: string): string {
        return s in specialCharacters ? ESCAPE + (specialCharacterMap[s] || s) : s;
    }

    function* flush() {
        while (backBuffer.count) {
            const n = Math.min(9, backBuffer.count);
            yield n > 1 ? backBuffer.last + n : backBuffer.last;
            backBuffer.last = BACK;
            backBuffer.count -= n;
        }
    }

    function* emit(s: string): Generator<string> {
        switch (s) {
            case EOW:
                yield* flush();
                backBuffer.last = EOW;
                backBuffer.count = 0;
                backBuffer.words++;
                break;
            case BACK:
                backBuffer.count++;
                backBuffer.words++;
                break;
            default:
                yield* flush();
                if (backBuffer.words >= WORDS_PER_LINE) {
                    backBuffer.words = 0;
                    yield '\n';
                }
                yield s;
        }
    }

    function* walk(node: TrieNode, depth: number): Generator<string> {
        const nodeNumber = cache.get(node);
        const refIndex = nodeToIndexMap.get(node);
        if (nodeNumber !== undefined) {
            yield* emit(ref(nodeNumber, refIndex));
            return;
        }
        if (node.c) {
            if (depth > 0 && depth <= 2) {
                const chars = wordChars.slice(0, depth).map(escape).join('');
                yield* emit(`${EOL}${INLINE_DATA_COMMENT_LINE}* ${chars} *${INLINE_DATA_COMMENT_LINE}${EOL}`);
                backBuffer.words = 0;
            }
            cache.set(node, count++);
            const c = [...node.c].sort((a, b) => (a[0] < b[0] ? -1 : 1));
            for (const [s, n] of c) {
                wordChars[depth] = s;
                yield* emit(escape(s));
                yield* walk(n, depth + 1);
                yield* emit(BACK);
                if (depth === 0) yield* emit(EOL);
            }
        }
        // Output EOW after children so it can be optimized on read
        if (node.f) {
            yield* emit(EOW);
        }
        if (depth === 2) {
            yield* emit(EOL);
            backBuffer.words = 0;
        }
    }

    function* serialize(node: TrieNode): Generator<string> {
        yield* walk(node, 0);
        yield* flush();
    }

    const lines = [...bufferLines(serialize(root), 1000, '')];

    const resolvedReferences = refMap.refCounts.map(([node]) => cache.get(node) || 0);

    // const r = refMap.refCounts.slice(0, 200).map(([node, c]) => ({ n: cache.get(node) || 0, c }));
    // console.log('First 100: %o \n %o', r.slice(0, 100), r.slice(100, 200));

    const reference =
        '[\n' +
        resolvedReferences
            .map((n) => n.toString(radix))
            .join(',')
            .replace(/.{110,130}[,]/g, '$&\n') +
        '\n]\n';

    return genSequence([generateHeader(radix, comment), reference]).concat(lines);
}

interface ReferenceMap {
    /**
     * An array of references to nodes.
     * The most frequently referenced is first in the list.
     * A node must be reference by other nodes to be included.
     */
    refCounts: (readonly [TrieNode, number])[];
}

function buildReferenceMap(root: TrieRoot, base: number): ReferenceMap {
    interface Ref {
        c: number; // count
        n: number; // node number;
    }
    const refCount = new Map<TrieNode, Ref>();
    let nodeCount = 0;

    function walk(node: TrieNode) {
        const ref = refCount.get(node);
        if (ref) {
            ref.c++;
            return;
        }
        refCount.set(node, { c: 1, n: nodeCount++ });
        if (!node.c) return;
        for (const child of node.c.values()) {
            walk(child);
        }
    }

    walk(root);
    // sorted highest to lowest
    const refCountAndNode = [
        ...pipe(
            refCount,
            opFilter(([_, ref]) => ref.c >= 2)
        ),
    ].sort((a, b) => b[1].c - a[1].c || a[1].n - b[1].n);

    let adj = 0;
    const baseLogScale = 1 / Math.log(base);
    const refs = refCountAndNode
        .filter(([_, ref], idx) => {
            const i = idx - adj;
            const charsIdx = Math.ceil(Math.log(i) * baseLogScale);
            const charsNode = Math.ceil(Math.log(ref.n) * baseLogScale);
            const savings = ref.c * (charsNode - charsIdx) - charsIdx;
            const keep = savings > 0;
            adj += keep ? 0 : 1;
            return keep;
        })
        .map(([n, ref]) => [n, ref.c] as const);

    return { refCounts: refs };
}

interface Stack {
    node: TrieNode;
    s: string;
}

interface ReduceResults {
    stack: Stack[];
    nodes: TrieNode[];
    root: TrieRoot;
    parser: Reducer | undefined;
}

type Reducer = (acc: ReduceResults, s: string) => ReduceResults;

export function importTrie(linesX: Iterable<string> | string): TrieRoot {
    linesX = typeof linesX === 'string' ? linesX.split(/(?<=\n)/) : linesX;
    let radix = 10;
    const comment = /^\s*#/;
    const iter = tapIterable(
        pipe(
            linesX,
            opConcatMap((a) => a.split(/(?<=\n)(?!$)/))
        )
    );

    function parseHeaderRows(headerRows: string[]) {
        const header = headerRows.slice(0, 2).join('\n');
        const headerReg = /^TrieXv[34]\nbase=(\d+)$/;
        /* istanbul ignore if */
        if (!headerReg.test(header)) throw new Error('Unknown file format');
        radix = Number.parseInt(header.replace(headerReg, '$1'), 10);
    }

    function readHeader(iter: Iterable<string>) {
        const headerRows: string[] = [];
        for (const value of iter) {
            const line = value.trim();
            if (!line || comment.test(line)) continue;
            if (line === DATA) break;
            headerRows.push(line);
        }
        parseHeaderRows(headerRows);
    }

    readHeader(iter);

    const root = parseStream(radix, iter);
    return root;
}

const numbersSet = stringToCharSet('0123456789');

function parseStream(radix: number, iter: Iterable<string>): TrieRoot {
    const eow: TrieNode = Object.freeze({ f: 1 });
    let refIndex: number[] = [];
    const root: TrieRoot = trieNodeToRoot({}, {});

    function parseReference(acc: ReduceResults, s: string): ReduceResults {
        const isIndexRef = s === REF_REL;
        let ref = '';

        function parser(acc: ReduceResults, s: string): ReduceResults {
            if (s === EOR || (radix === 10 && !(s in numbersSet))) {
                const { root, nodes, stack } = acc;
                const r = parseInt(ref, radix);
                const top = stack[stack.length - 1];
                const p = stack[stack.length - 2].node;
                const n = isIndexRef ? refIndex[r] : r;
                p.c?.set(top.s, nodes[n]);
                const rr = { root, nodes, stack, parser: undefined };
                return s === EOR ? rr : parserMain(rr, s);
            }
            ref = ref + s;
            return acc;
        }

        const { nodes } = acc;
        nodes.pop();
        return { ...acc, nodes, parser };
    }

    function parseEscapeCharacter(acc: ReduceResults, _: string): ReduceResults {
        let prev = '';
        const parser = function (acc: ReduceResults, s: string): ReduceResults {
            if (prev) {
                s = characterMap[prev + s] || s;
                return parseCharacter({ ...acc, parser: undefined }, s);
            }
            if (s === ESCAPE) {
                prev = s;
                return acc;
            }
            return parseCharacter({ ...acc, parser: undefined }, s);
        };
        return { ...acc, parser };
    }

    function parseComment(acc: ReduceResults, s: string): ReduceResults {
        const endOfComment = s;

        function parser(acc: ReduceResults, s: string): ReduceResults {
            if (s === endOfComment) {
                return { ...acc, parser: undefined };
            }
            return acc;
        }
        return { ...acc, parser };
    }

    function parseCharacter(acc: ReduceResults, s: string): ReduceResults {
        const parser = undefined;
        const { root, nodes, stack } = acc;
        const top = stack[stack.length - 1];
        const node = top.node;
        node.c = node.c ?? new Map<string, TrieNode>();
        const n = { f: undefined, c: undefined, n: nodes.length };
        node.c.set(s, n);
        stack.push({ node: n, s });
        nodes.push(n);
        return { root, nodes, stack, parser };
    }

    function parseEOW(acc: ReduceResults, _: string): ReduceResults {
        const parser = parseBack;
        const { root, nodes, stack } = acc;
        const top = stack[stack.length - 1];
        const node = top.node;
        node.f = FLAG_WORD;
        if (!node.c) {
            top.node = eow;
            const p = stack[stack.length - 2].node;
            p.c?.set(top.s, eow);
            nodes.pop();
        }
        stack.pop();
        return { root, nodes, stack, parser };
    }

    const charactersBack = stringToCharSet(BACK + '23456789');
    function parseBack(acc: ReduceResults, s: string): ReduceResults {
        if (!(s in charactersBack)) {
            return parserMain({ ...acc, parser: undefined }, s);
        }
        let n = s === BACK ? 1 : parseInt(s, 10) - 1;
        const { stack } = acc;
        while (n-- > 0) {
            stack.pop();
        }
        return { ...acc, parser: parseBack };
    }

    function parseIgnore(acc: ReduceResults, _: string): ReduceResults {
        return acc;
    }

    const parsers = createStringLookupMap([
        [EOW, parseEOW],
        [BACK, parseBack],
        [REF, parseReference],
        [REF_REL, parseReference],
        [ESCAPE, parseEscapeCharacter],
        [EOL, parseIgnore],
        [LF, parseIgnore],
        [INLINE_DATA_COMMENT_LINE, parseComment],
    ]);

    function parserMain(acc: ReduceResults, s: string): ReduceResults {
        const parser = acc.parser ?? parsers[s] ?? parseCharacter;
        return parser(acc, s);
    }

    const charsetSpaces = stringToCharSet(' \r\n\t');

    function parseReferenceIndex(acc: ReduceResults, s: string): ReduceResults {
        let json = '';

        function parserStart(acc: ReduceResults, s: string): ReduceResults {
            if (s === REF_INDEX_BEGIN) {
                json = json + s;
                return { ...acc, parser };
            }
            if (s in charsetSpaces) {
                return acc;
            }
            // A Reference Index was not found.
            return parserMain({ ...acc, parser: undefined }, s);
        }

        function parser(acc: ReduceResults, s: string): ReduceResults {
            json = json + s;
            if (s === REF_INDEX_END) {
                refIndex = JSON.parse(json) as number[];
                return { ...acc, parser: undefined };
            }
            return acc;
        }
        return parserStart({ ...acc, parser: parserStart }, s);
    }

    genSequence(iter)
        .concatMap((a) => a.split(''))
        .reduce(parserMain, {
            nodes: [root],
            root,
            stack: [{ node: root, s: '' }],
            parser: parseReferenceIndex,
        });

    return root;
}

function stringToCharSet(values: string): Record<string, boolean | undefined> {
    const set: Record<string, boolean | undefined> = Object.create(null);
    const len = values.length;
    for (let i = 0; i < len; ++i) {
        set[values[i]] = true;
    }
    return set;
}

function stringToCharMap(values: readonly (readonly [string, string])[]): Record<string, string | undefined> {
    return createStringLookupMap(values);
}

function createStringLookupMap<T>(values: readonly (readonly [string, T])[]): Record<string, T | undefined> {
    const map: Record<string, T | undefined> = Object.create(null);
    const len = values.length;
    for (let i = 0; i < len; ++i) {
        map[values[i][0]] = values[i][1];
    }
    return map;
}

/**
 * Allows an iterable to be shared by multiple consumers.
 * Each consumer takes from the iterable.
 * @param iterable - the iterable to share
 */
function tapIterable<T>(iterable: Iterable<T>): Iterable<T> {
    let lastValue: IteratorResult<T>;
    let iter: Iterator<T> | undefined;

    function getNext(): IteratorResult<T> {
        if (lastValue && lastValue.done) {
            return { ...lastValue };
        }
        iter = iter || iterable[Symbol.iterator]();
        lastValue = iter.next();
        return lastValue;
    }

    function* iterableFn() {
        let next: IteratorResult<T>;
        while (!(next = getNext()).done) {
            yield next.value;
        }
    }

    return {
        [Symbol.iterator]: iterableFn,
    };
}

export const __testing__ = {
    buildReferenceMap,
};
