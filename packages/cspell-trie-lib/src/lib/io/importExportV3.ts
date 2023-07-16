import { opAppend, pipe } from '@cspell/cspell-pipe/sync';

import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.js';
import { bufferLines } from '../utils/bufferLines.js';
import { BACK, EOL, EOR, EOW, ESCAPE, LF, REF } from './constants.js';
import { importTrieV3AsTrieRoot } from './importV3.js';

const specialCharacters = stringToCharSet(
    [EOW, BACK, EOL, REF, EOR, ESCAPE, LF, '0123456789', '`~!@#$%^&*()_-+=[]{};:\'"<>,./?\\|'].join(''),
);

const specialCharacterMap = new Map([
    ['\n', '\\n'],
    ['\r', '\\r'],
    ['\\', '\\\\'],
]);

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

export function importTrie(srcLines: string[] | Iterable<string> | string): TrieRoot {
    const trie = importTrieV3AsTrieRoot(srcLines);
    return trie.root;
}

function stringToCharSet(values: string): Record<string, boolean | undefined> {
    const set: Record<string, boolean | undefined> = Object.create(null);
    const len = values.length;
    for (let i = 0; i < len; ++i) {
        set[values[i]] = true;
    }
    return set;
}
