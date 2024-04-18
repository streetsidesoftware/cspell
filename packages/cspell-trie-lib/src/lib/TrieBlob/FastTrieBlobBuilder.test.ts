import { describe, expect, test } from 'vitest';

import type { BuilderCursor } from '../Builder/index.js';
import { insertWordsAtCursor } from '../Builder/index.js';
import { consolidate } from '../consolidate.js';
import { defaultTrieInfo } from '../constants.js';
import { createTrieRoot, insert } from '../TrieNode/trie-util.js';
import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

describe('FastTrieBlobBuilder', () => {
    test('insert', () => {
        const words = ['one', 'two', 'three', 'four', 'houses', 'house'];
        const builder = new FastTrieBlobBuilder();
        builder.insert(words);
        const ft = builder.build();
        expect([...ft.words()].sort()).toEqual([...words].sort());
    });

    test('insert word list', () => {
        const words = [...new Set(sampleWords())].sort();
        const builder = new FastTrieBlobBuilder();
        builder.insert(words);
        expect(builder.has('😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉')).toBe(true);
        const ft = builder.build();
        expect([...ft.words()]).toEqual([...words]);
    });

    test('setOptions', () => {
        const builder = new FastTrieBlobBuilder();
        expect(builder.options).toEqual(defaultTrieInfo);
        builder.setOptions({});
        expect(builder.options).toEqual(defaultTrieInfo);
        builder.setOptions({ compoundCharacter: '&' });
        expect(builder.options).toEqual({ ...defaultTrieInfo, compoundCharacter: '&' });
    });

    test('cursor', () => {
        const builder = new FastTrieBlobBuilder();
        const cursor = builder.getCursor();
        [...'hello'].forEach((letter) => cursor.insertChar(letter));
        cursor.markEOW();
        cursor.backStep(5);
        const t = builder.build();
        expect([...t.words()]).toEqual(['hello']);
    });

    test.each`
        word
        ${'hello'}
        ${'😀😎'}
    `('cursor insertChar split $word', ({ word }: { word: string }) => {
        const builder = new FastTrieBlobBuilder();
        const cursor = builder.getCursor();
        const chars = [...word];
        chars.forEach((letter) => cursor.insertChar(letter));
        cursor.markEOW();
        cursor.backStep(chars.length);
        const t = builder.build();
        expect([...t.words()]).toEqual([word]);
    });

    test('cursor with word list', () => {
        const builder = new FastTrieBlobBuilder();
        const cursor = builder.getCursor();
        const words = sampleWords();
        // console.log('words %o', words.sort());
        // console.log('Unique Letters: %o', new Set(words.join('')));
        const sortedUnique = [...new Set(words)].sort();
        insertWordsAtCursor(cursor, words);
        const t = builder.build();
        expect([...t.words()].sort()).toEqual(sortedUnique);
    });

    test('cursor with word list - non-optimized', () => {
        const builder = new FastTrieBlobBuilder();
        const cursor = builder.getCursor();
        const words = sampleWords();
        const sortedUnique = [...new Set(words)].sort();
        for (const word of words) {
            const chars = [...word];
            chars.forEach((letter) => cursor.insertChar(letter));
            cursor.markEOW();
            cursor.backStep(chars.length);
        }
        const t = builder.build();
        expect([...t.words()].sort()).toEqual(sortedUnique);
    });

    test('insertFromOptimizedTrie', () => {
        const builder = new FastTrieBlobBuilder();
        const cursor = builder.getCursor();
        const words = sampleWords();
        const sortedUnique = [...new Set(words)].sort();
        insertFromOptimizedTrie(cursor, words);
        const t = builder.build();
        expect([...t.words()].sort()).toEqual(sortedUnique);
    });

    test('should be able to correctly preserve referenced nodes.', () => {
        const extraWords = 'reds greens blues yellows oranges purples'.split(' ');
        const builder = new FastTrieBlobBuilder();
        const cursor = builder.getCursor();
        const words = sampleWords();
        const sortedUnique = [...new Set(words), ...extraWords].sort();
        insertFromOptimizedTrie(cursor, words);
        // Add more words to make sure it works.
        insertWordsAtCursor(cursor, extraWords);
        const t = builder.build();
        expect([...t.words()].sort()).toEqual(sortedUnique);
    });
});

function sampleWords() {
    return (
        'Here are a few words to use as a dictionary. They just need to be split. ' +
        'walk walked walking walker ' +
        'talk talked talking talker ' +
        'play played playing player ' +
        'red green blue yellow orange ' +
        'on the first day of ' +
        'on a dark and ' +
        // cspell:disable
        `"ትግርኛ",
         "አማርኛ",
         "ພາສາລາວ",
         "ꦧꦱꦗꦮ",
         "ᐃᓄᒃᑎᑐᑦ",
         "ᐊᓂᔑᓈᐯᒧᐎᓐ",
         "ᓀᐦᐃᔭᐍᐏᐣ"
         😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉
         😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎
         🥸🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺
         😢😭😤😠😡🤬🤯😳🥵🥶😶‍🌫️😱😨😰😥😓
         🤗🤔🫣🤭🫢🫡🤫🫠🤥😶🫥😐🫤😑🫨😬
         🙄😯😦😧😮😲🥱😴🤤😪😮‍💨😵😵‍💫🤐🥴🤢
         🤮🤧😷🤒🤕🤑🤠😈 ` + // cspell:enable
        genWords(8, 'A', 'z').join(' ') +
        genWords(8, '\u1F00', '\u1FFF').join(' ') +
        ' '
    )
        .normalize('NFC')
        .split(/[\s\p{P}]/gu)
        .filter((a) => !!a);
}

function insertFromOptimizedTrie(cursor: BuilderCursor, words: string[]) {
    const trie = buildTrie(words);
    const nodeToRef = new Map<TrieNode, number>();
    let count = 0;

    function walk(node: TrieNode) {
        const found = nodeToRef.get(node);
        if (found) {
            cursor.reference(found);
            cursor.backStep(1);
            return;
        }
        if (node.c) {
            nodeToRef.set(node, ++count);
            for (const [k, n] of Object.entries(node.c)) {
                cursor.insertChar(k);
                walk(n);
            }
        }
        if (node.f) {
            cursor.markEOW();
        }
        if (node !== trie) cursor.backStep(1);
    }

    walk(trie);
}

function buildTrie(words: string[], optimize = true): TrieRoot {
    const root = createTrieRoot({});
    insertWords(root, words);
    return optimize ? consolidate(root) : root;
}

function insertWords(root: TrieRoot, words: string[]) {
    for (const word of words) {
        if (word.length) {
            insert(word, root);
        }
    }
}

function genWords(len: number, startLetter: string, endLetter: string): string[] {
    const words: string[] = [];
    const start = startLetter.codePointAt(0) || 0;
    const end = endLetter.codePointAt(0) || 0;
    let word = '';
    for (let p = start; p <= end; ++p) {
        word += String.fromCodePoint(p);
        if (p % len === 0) {
            words.push(word);
            word = '';
        }
    }
    return words;
}
