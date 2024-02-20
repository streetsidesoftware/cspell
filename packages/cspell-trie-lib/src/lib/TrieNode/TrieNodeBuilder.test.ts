import { describe, expect, test } from 'vitest';

import type { BuilderCursor } from '../Builder/index.js';
import { insertWordsAtCursor } from '../Builder/index.js';
import { consolidate } from '../consolidate.js';
import { createTrieRoot, insert } from './trie-util.js';
import type { TrieNode, TrieRoot } from './TrieNode.js';
import { TrieNodeBuilder } from './TrieNodeBuilder.js';

describe('TrieNodeBuilder', () => {
    test('cursor', () => {
        const builder = new TrieNodeBuilder();
        const cursor = builder.getCursor();
        [...'hello'].forEach((letter) => cursor.insertChar(letter));
        cursor.markEOW();
        cursor.backStep(5);
        const t = builder.build();
        expect([...t.words()]).toEqual(['hello']);
    });

    test('cursor with word list', () => {
        const builder = new TrieNodeBuilder();
        const cursor = builder.getCursor();
        const words = sampleWords();
        const sortedUnique = [...new Set(words)].sort();
        insertWordsAtCursor(cursor, words);
        const t = builder.build();
        expect([...t.words()].sort()).toEqual(sortedUnique);
    });

    test('insertFromOptimizedTrie', () => {
        const builder = new TrieNodeBuilder();
        const cursor = builder.getCursor();
        const words = sampleWords();
        const sortedUnique = [...new Set(words)].sort();
        insertFromOptimizedTrie(cursor, words);
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
        'on a dark and '
    )
        .split(/[^a-zA-Z]/g)
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
