import { opAppend, pipe } from '@cspell/cspell-pipe/sync';

import { trieNodeToRoot } from '../TrieNode/trie-util.js';
import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.js';
import { FLAG_WORD } from '../TrieNode/TrieNode.js';
import { bufferLines } from '../utils/bufferLines.js';
import { getGlobalPerfTimer, startTimer } from '../utils/timer.js';

const EOW = '$'; // End of word
const BACK = '<'; // Move up the tree
const EOL = '\n'; // End of Line (ignored)
const LF = '\r'; // Line Feed (ignored)
const REF = '#'; // Start of Reference
const EOR = ';'; // End of Reference
const ESCAPE = '\\';

const specialCharacters = stringToCharSet(
    [EOW, BACK, EOL, REF, EOR, ESCAPE, LF, '0123456789', '`~!@#$%^&*()_-+=[]{};:\'"<>,./?\\|'].join('')
);

const specialCharacterMap = new Map([
    ['\n', '\\n'],
    ['\r', '\\r'],
    ['\\', '\\\\'],
]);
const characterMap = new Map([...specialCharacterMap].map((a) => [a[1], a[0]]));

const specialPrefix = stringToCharSet('~!');

const WORDS_PER_LINE = 20;

export const DATA = '__DATA__';

function generateHeader(base: number, comment: string): Iterable<string> {
    const header = ['#!/usr/bin/env cspell-trie reader', 'TrieXv3', 'base=' + base]
        .concat(comment ? comment.split('\n').map((a) => '# ' + a) : [])
        .concat(['# Data:', DATA]);
    return header.map((a) => a + '\n');
}

export interface ExportOptions {
    base?: number;
    comment?: string;
    /**
     * This will reduce the size of the `.trie` file by removing references to short suffixes.
     * But it does increase the size of the trie when loaded into memory.
     */
    optimizeSimpleReferences?: boolean;
    /**
     * To improve diffs, an EOL is added before each double letter prefix.
     * @default true
     */
    addLineBreaksToImproveDiffs?: boolean;
}

/**
 * Serialize a TrieRoot.
 */
export function serializeTrie(root: TrieRoot, options: ExportOptions | number = 16): Iterable<string> {
    options = typeof options === 'number' ? { base: options, addLineBreaksToImproveDiffs: false } : options;
    const { base = 16, comment = '', addLineBreaksToImproveDiffs: addBreaks = true } = options;
    const radix = base > 36 ? 36 : base < 10 ? 10 : base;
    const cache = new Map<TrieNode, number>();
    const cacheShouldRef = new Map<TrieNode, boolean>();
    let count = 0;
    const backBuffer = { last: '', count: 0, words: 0, eol: false };
    const optimizeSimpleReferences = options.optimizeSimpleReferences ?? false;
    const wordChars: string[] = [];

    function ref(n: number): string {
        return '#' + n.toString(radix) + ';';
    }

    function escape(s: string): string {
        return s in specialCharacters ? ESCAPE + (specialCharacterMap.get(s) || s) : s;
    }

    function* flush() {
        while (backBuffer.count) {
            const n = Math.min(9, backBuffer.count);
            yield n > 1 ? backBuffer.last + n : backBuffer.last;
            backBuffer.last = BACK;
            backBuffer.count -= n;
        }
        if (backBuffer.eol) {
            yield EOL;
            backBuffer.eol = false;
            backBuffer.words = 0;
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
                break;
            case EOL:
                backBuffer.eol = true;
                break;
            default:
                if (backBuffer.words >= WORDS_PER_LINE) {
                    backBuffer.eol = true;
                }
                yield* flush();
                if (s.startsWith(REF)) {
                    backBuffer.words++;
                }
                yield s;
        }
    }

    function* walk(node: TrieNode, depth: number): Generator<string> {
        const r = cache.get(node);
        if (r !== undefined && (!optimizeSimpleReferences || !shouldSimpleRef(node))) {
            yield* emit(ref(r));
            return;
        }
        if (node.c) {
            if (addBreaks && depth > 0 && depth <= 2) {
                yield* emit(EOL);
            }
            cache.set(node, count++);
            const c = Object.entries(node.c).sort((a, b) => (a[0] < b[0] ? -1 : 1));
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
        if (addBreaks && (depth === 2 || (depth === 3 && wordChars[0] in specialPrefix))) {
            yield* emit(EOL);
        }
    }

    function* serialize(node: TrieNode): Generator<string> {
        yield* walk(node, 0);
        yield* flush();
    }

    function _calcShouldSimpleRef(node: TrieNode): boolean {
        if (!node.c) return false;
        const values = Object.values(node.c);
        if (values.length !== 1) return false;
        const n = values[0];
        return !!n.f && (!n.c || !Object.values(n.c).length);
    }

    function shouldSimpleRef(node: TrieNode): boolean {
        const r = cacheShouldRef.get(node);
        if (r !== undefined) return r;
        const rr = _calcShouldSimpleRef(node);
        cacheShouldRef.set(node, rr);
        return rr;
    }

    return pipe(generateHeader(radix, comment), opAppend(bufferLines(serialize(root), 1200, '')));
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

export function importTrie(linesX: string[] | Iterable<string> | string): TrieRoot {
    const timer = getGlobalPerfTimer();
    const timerStart = timer.start('importTrieV3');
    const dataLines: string[] =
        typeof linesX === 'string' ? linesX.split('\n') : Array.isArray(linesX) ? linesX : [...linesX];

    const root: TrieRoot = trieNodeToRoot({}, {});

    let radix = 16;
    const comment = /^\s*#/;

    function parseHeaderRows(headerRows: string[]) {
        const header = headerRows.slice(0, 2).join('\n');
        const headerReg = /^TrieXv3\nbase=(\d+)$/;
        /* istanbul ignore if */
        if (!headerReg.test(header)) throw new Error('Unknown file format');
        radix = Number.parseInt(header.replace(headerReg, '$1'), 10);
    }

    function findStartOfData(data: string[]): number {
        for (let i = 0; i < data.length; ++i) {
            const line = data[i];
            if (line.includes(DATA)) {
                return i;
            }
        }
        return -1;
    }

    function readHeader(data: string[]) {
        const headerRows: string[] = [];
        for (const hLine of data) {
            const line = hLine.trim();
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

    const startOfData = findStartOfData(dataLines);
    if (startOfData < 0) {
        throw new Error('Unknown file format');
    }

    readHeader(dataLines.slice(0, startOfData));

    let node: ReduceResults = {
        nodes: [root],
        root,
        stack: [{ node: root, s: '' }],
        parser: undefined,
    };

    const parser = parseStream(radix);

    const timerParse = timer.start('importTrieV3.parse');

    for (let i = startOfData + 1; i < dataLines.length; ++i) {
        const line = dataLines[i];
        for (let j = 0; j < line.length; ++j) {
            node = parser(node, line[j]);
        }
    }
    timerParse();
    timerStart();

    return node.root;
}

function parseStream(radix: number): Reducer {
    const eow: TrieNode = Object.freeze({ f: 1 });

    function parseReference(acc: ReduceResults, _: string): ReduceResults {
        let ref = '';

        function parser(acc: ReduceResults, s: string): ReduceResults {
            if (s === EOR) {
                const { root, nodes, stack } = acc;
                const r = parseInt(ref, radix);
                const top = stack[stack.length - 1];
                const p = stack[stack.length - 2].node;
                p.c && (p.c[top.s] = nodes[r]);
                return { root, nodes, stack, parser: undefined };
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
                s = characterMap.get(prev + s) || s;
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

    function parseCharacter(acc: ReduceResults, s: string): ReduceResults {
        const parser = undefined;
        const { root, nodes, stack } = acc;
        const top = stack[stack.length - 1];
        const node = top.node;
        const c = node.c ?? Object.create(null);
        node.c = c;
        const n = { f: undefined, c: undefined, n: nodes.length };
        c[s] = n;
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
            p.c && (p.c[top.s] = eow);
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

    const parsers = new Map<string, Reducer>([
        [EOW, parseEOW],
        [BACK, parseBack],
        [REF, parseReference],
        [ESCAPE, parseEscapeCharacter],
        [EOL, parseIgnore],
        [LF, parseIgnore],
    ]);

    function parserMain(acc: ReduceResults, s: string): ReduceResults {
        const parser = acc.parser ?? parsers.get(s) ?? parseCharacter;
        return parser(acc, s);
    }
    return parserMain;
}

function stringToCharSet(values: string): Record<string, boolean | undefined> {
    const set: Record<string, boolean | undefined> = Object.create(null);
    const len = values.length;
    for (let i = 0; i < len; ++i) {
        set[values[i]] = true;
    }
    return set;
}
