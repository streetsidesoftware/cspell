import type { CharacterSet, ReplaceEntry, ReplaceMap } from '@cspell/cspell-types';
import { expandCharacterSet } from 'cspell-trie-lib';

import { escapeRegEx } from './regexHelper.js';
import { isDefined } from './util.js';

export type ReplaceMapper = (src: string) => string;

export function createMapper(repMap: ReplaceMap | undefined, ignoreCharset?: string): ReplaceMapper {
    if (!repMap && !ignoreCharset) return (a) => a;
    repMap = repMap || [];
    const charsetMap = charsetToRepMapRegEx(ignoreCharset);
    if (charsetMap) {
        repMap = repMap.concat(charsetMap);
    }

    const filteredMap = repMap.filter(([match, _]) => !!match);
    if (!filteredMap.length) {
        return (a) => a;
    }

    const regEx = createMapperRegExp(repMap);
    const values = repMap.filter(([match, _]) => !!match).map(([_, into]) => into);

    function resolve(m: string, ...matches: unknown[]) {
        const index = matches.findIndex((a) => !!a);
        return 0 <= index && index < values.length ? values[index] : m;
    }

    return function (s: string) {
        return s.replace(regEx, resolve);
    };
}

function charsetToRepMapRegEx(charset: CharacterSet | undefined, replaceWith = ''): ReplaceMap | undefined {
    if (!charset) return undefined;

    return charset
        .split('|')
        .map((chars) => `[${chars.replace(/[\][\\]/g, '\\$&')}]`)
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
                const r = s.match(/\(/) ? s.replace(/\((?=.*\))/g, '(?:').replace(/\(\?:\?/g, '(?') : s;
                new RegExp(r);
                s = r;
            } catch (_err) {
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

export function createRepMapper(repMap: ReplaceMap | undefined, ignoreCharset?: string): (word: string) => string[] {
    if (!repMap && !ignoreCharset) return (word) => [word];

    const trie = createTrie(repMap, ignoreCharset);

    // const root = createTrie(repMap, ignoreCharset);
    return (word) => {
        const edits = calcAllEdits(trie, word);
        return applyEdits(word, edits);
    };
}

function applyEdits(word: string, edits: Edit[]): string[] {
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
        for (const edit of le.edits) {
            const pfx = edit.r;
            const nSfx = letterEdits[edit.e].suffixes;
            for (const s of nSfx) {
                sfx.push(pfx + s);
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

export const __testing__ = {
    charsetToRepMap: charsetToRepMapRegEx,
    createMapperRegExp,
    createTrie,
    calcAllEdits,
    applyEdits,
};
