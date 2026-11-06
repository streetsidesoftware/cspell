import type { CharacterSet, ReplaceEntry, ReplaceMap } from '@cspell/cspell-types';

import { isDefined } from './isDefined.ts';
import { escapeRegEx } from './regexHelper.ts';
import { expandCharacterSet } from './text.ts';

/**
 * Replaces each match in a word with a single replacement.
 */
export interface ReplaceMapper {
    /** Matches a word that has something to replace. */
    test?: RegExp;
    /** Returns the word with its matches replaced. */
    fn: (src: string) => string;
}

/**
 * Create a mapper that gives one result for each word.
 * @param repMap - the replacements to make.
 * @param ignoreCharset - characters to remove.
 * @returns the mapper, or `undefined` when there is nothing to replace.
 */
export function createMapper(repMap: ReplaceMap | undefined, ignoreCharset?: string): ReplaceMapper | undefined {
    if (!repMap && !ignoreCharset) return undefined;

    repMap = repMap || [];
    const charsetMap = charsetToRepMapRegEx(ignoreCharset);
    if (charsetMap) {
        repMap = [...repMap, ...charsetMap];
    }

    const filteredMap = repMap.filter(([match, _]) => !!match);
    if (!filteredMap.length) {
        return undefined;
    }

    const regEx = createMapperRegExp(repMap);
    const values = repMap.filter(([match, _]) => !!match).map(([_, into]) => into);

    function resolve(m: string, ...matches: unknown[]) {
        const index = matches.findIndex((a) => !!a);
        return 0 <= index && index < values.length ? values[index] : m;
    }

    function fn(s: string) {
        return s.replace(regEx, resolve);
    }

    return {
        test: regexpRemoveFlags(regEx, 'gm'),
        fn,
    };
}

function charsetToRepMapRegEx(charset: CharacterSet | undefined, replaceWith = ''): ReplaceMap | undefined {
    if (!charset) return undefined;

    return charset
        .split('|')
        .map((chars) => `[${chars.replaceAll(/[\][\\]/g, '\\$&')}]`)
        .map((map) => [map, replaceWith]);
}
function charsetToRepMap(charset: undefined, replaceWith?: string): undefined;
function charsetToRepMap(charset: CharacterSet, replaceWith?: string): ReplaceMap;
function charsetToRepMap(charset: CharacterSet | undefined, replaceWith?: string): ReplaceMap | undefined;
function charsetToRepMap(charset: CharacterSet | undefined, replaceWith = ''): ReplaceMap | undefined {
    if (!charset) return undefined;

    return charset
        .split('|')
        .flatMap((chars) => [...expandCharacterSet(chars)])
        .map((char) => [char, replaceWith]);
}

function expandReplaceMap(repMap: ReplaceMap): ReplaceMap {
    return repMap.flatMap(([from, replaceWith]) => from.split('|').map((w) => [w, replaceWith] as ReplaceEntry));
}

function createMapperRegExp(repMap: ReplaceMap): RegExp {
    const filteredMap = repMap.filter(([match, _]) => !!match);
    if (!filteredMap.length) {
        return /$^/;
    }
    const regExStr = filteredMap
        .map(([from, _]) => from)
        // make sure it compiles into a regex
        .map((s) => {
            try {
                // fix up any nested ()
                const r = /\(/.test(s) ? s.replaceAll(/\((?=.*\))/g, '(?:').replaceAll('(?:?', '(?') : s;
                new RegExp(r);
                s = r;
            } catch {
                return escapeRegEx(s);
            }
            return s;
        })
        .map((s) => `(${s})`)
        .join('|');

    const regEx = new RegExp(regExStr, 'g');

    return regEx;
}

interface RepTrieNode {
    rep?: string[];
    children?: Record<string, RepTrieNode>;
}

interface Edit {
    b: number;
    e: number;
    r: string;
}

/**
 * Generates the replacement forms of a word.
 */
export interface RepMapper {
    /** Matches a word that has something to replace. */
    test: RegExp;
    /** Returns the word and its replacement forms. The number of forms is limited. */
    fn: (word: string) => string[];
}

/**
 * Create a mapper that gives every combination of replacements, up to a limit.
 * @param repMap - the replacements to make.
 * @param ignoreCharset - characters to remove.
 * @returns the mapper, or `undefined` when there is nothing to replace.
 */
export function createRepMapper(repMap: ReplaceMap | undefined, ignoreCharset?: string): RepMapper | undefined {
    if (!repMap?.length && !ignoreCharset) return undefined;

    let tRepMap = repMap || [];
    const charsetMap = charsetToRepMapRegEx(ignoreCharset);
    if (charsetMap) {
        tRepMap = [...tRepMap, ...charsetMap];
    }

    const regEx = createMapperRegExp(tRepMap);

    const trie = createTrie(repMap, ignoreCharset);

    // const root = createTrie(repMap, ignoreCharset);
    return {
        test: regexpRemoveFlags(regEx, 'gm'),
        fn: (word) => {
            const edits = calcAllEdits(trie, word);
            return applyEdits(word, edits);
        },
    };
}

const defaultMaxSubWordEdits = 256;

function applyEdits(word: string, edits: Edit[], maxEdits: number = defaultMaxSubWordEdits): string[] {
    if (!edits.length) return [word];

    // Prepare
    const letterEdits: { edits: Edit[]; suffixes: string[] }[] = [];
    for (let i = 0; i < word.length; ++i) {
        letterEdits[i] = { edits: [{ b: i, e: i + 1, r: word[i] }], suffixes: [] };
    }
    letterEdits[word.length] = { edits: [], suffixes: [''] };

    // Add edits
    for (const edit of edits) {
        const le = letterEdits[edit.b];
        le.edits.push(edit);
    }

    // Apply edits in reverse
    for (let i = word.length - 1; i >= 0; --i) {
        const le = letterEdits[i];
        const sfx = le.suffixes;
        const maxPerEdit = Math.max(1, Math.floor(maxEdits / le.edits.length));
        for (const edit of le.edits) {
            if (sfx.length >= maxEdits) break;
            const pfx = edit.r;
            const nSfx = letterEdits[edit.e].suffixes;
            const step = Math.max(1, Math.ceil(nSfx.length / maxPerEdit));
            const startLen = sfx.length;
            for (let j = 0; j < nSfx.length && sfx.length < maxEdits; j += step) {
                sfx.push(pfx + nSfx[j]);
            }
            if (step > 1 && sfx.length - startLen > 1) {
                sfx[sfx.length - 1] = pfx + nSfx[nSfx.length - 1];
            }
        }
    }

    const results = new Set(letterEdits[0].suffixes);

    return [...results];
}

function calcAllEdits(root: RepTrieNode, word: string): Edit[] {
    const edits: Edit[] = [];

    function walk(node: RepTrieNode, b: number, e: number) {
        if (node.rep) {
            node.rep.forEach((r) => edits.push({ b, e, r }));
        }
        if (e === word.length || !node.children) return;
        const n = node.children[word[e]];
        if (!n) return;
        walk(n, b, e + 1);
    }

    for (let i = 0; i < word.length; ++i) {
        walk(root, i, i);
    }

    return edits;
}

function createTrie(repMap: ReplaceMap | undefined, ignoreCharset?: string): RepTrieNode {
    const combined = [repMap, charsetToRepMap(ignoreCharset)].filter(isDefined).flat();
    const expanded = expandReplaceMap(combined);

    const trieRoot: RepTrieNode = Object.create(null);

    expanded.forEach(([match, replaceWith]) => addToTrie(trieRoot, match, replaceWith));
    return trieRoot;
}

function addToTrie(node: RepTrieNode, match: string, replaceWith: string) {
    while (match) {
        const children: Record<string, RepTrieNode> = node.children || (node.children = Object.create(null));
        const k = match[0];
        const childNode = children[k] || (children[k] = Object.create(null));
        node = childNode;
        match = match.slice(1);
    }
    const s = new Set(node.rep || []);
    s.add(replaceWith);
    node.rep = [...s];
}

function regexpRemoveFlags(re: RegExp, flagsToRemove: string): RegExp {
    const toRemove = new Set(flagsToRemove);
    const flags = [...re.flags].filter((f) => !toRemove.has(f)).join('');
    return new RegExp(re.source, flags);
}

// eslint-disable-next-line no-control-regex
const isAsciiRange = /^[\u0000-\u007F]*$/;

export function* outerWordForms(word: string, repMapper: RepMapper | undefined): Iterable<string> {
    // Only generate the needed forms.
    const sent = new Set<string>();
    let w = word;
    const ww = w;
    yield w;

    // this function is called for every word lookup, so needs to be efficient.
    // Check to see if it is a pure ascii word.
    if (!isAsciiRange.test(w)) {
        sent.add(w);
        w = word.normalize('NFC');
        if (w !== ww) {
            yield w;
            sent.add(w);
        }
        w = word.normalize('NFD');
        if (w !== ww && !sent.has(w)) {
            yield w;
            sent.add(w);
        }
    }

    if (!repMapper) return;
    const mapWord = repMapper.fn;

    // nothing was added to the set, just do the map.
    if (!sent.size) {
        if (!repMapper.test.test(ww)) return;
        for (const m of mapWord(ww)) {
            if (m !== ww && !sent.has(m)) {
                yield m;
                sent.add(m);
            }
        }
        return;
    }

    const mapped = new Set<string>();
    for (const f of sent) {
        for (const m of mapWord(f)) {
            if (!sent.has(m) && !mapped.has(m)) {
                yield m;
                mapped.add(m);
            }
        }
    }
    return;
}

export const __testing__: {
    charsetToRepMap: typeof charsetToRepMapRegEx;
    createMapperRegExp: typeof createMapperRegExp;
    createTrie: typeof createTrie;
    calcAllEdits: typeof calcAllEdits;
    applyEdits: typeof applyEdits;
} = {
    charsetToRepMap: charsetToRepMapRegEx,
    createMapperRegExp,
    createTrie,
    calcAllEdits,
    applyEdits,
};
