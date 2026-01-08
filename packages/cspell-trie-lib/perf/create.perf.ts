import { suite } from 'perf-insight';

import { buildITrieFromWords, parseDictionaryLines } from '../src/lib/index.ts';
import { createTrieBlobFromTrieRoot } from '../src/lib/TrieBlob/createTrieBlob.ts';
import { insertWordsIntoTrieBlobBuilderUsingCursor, TrieBlobBuilder } from '../src/lib/TrieBlob/TrieBlobBuilder.ts';
import { sortNodes } from '../src/lib/TrieBlob/TrieBuilderUtils.ts';
import { createTrieRootFromList } from '../src/lib/TrieNode/trie-util.ts';
import { readFixtureFile } from '../src/test/samples.ts';

suite('TrieBlobBuilder sortNodes', async (test) => {
    const words = await getWords();
    const builder = new TrieBlobBuilder();
    builder.insertWords(words);
    const nodes = builder.copyNodes();
    console.error('Info: %o', {
        wordsSize: words.length,
        numberOfNodes: nodes.length,
        fastTrieSmallSize: TrieBlobBuilder.fromWordList(words.slice(-1000)).size,
    });

    test.prepare(() => builder.copyNodes()).test('sortNodes number[][]', (nodes) => {
        sortNodes(nodes, 0xff);
    });

    test.prepare(() => builder.copyNodes().map((n) => Uint32Array.from(n))).test('sortNodes Uint32Array[]', (nodes) => {
        sortNodes(nodes, 0xff);
    });
});

suite('trie insert', async (test) => {
    const words = await getWords();
    const wordsSorted = [...words].sort();
    console.error('Info: %o', { wordsLength: words.length });

    test('TrieBlobBuilder.insert', () => {
        const builder = new TrieBlobBuilder();
        builder.insert(words);
    });

    test('TrieBlobBuilder.insertWords', () => {
        const builder = new TrieBlobBuilder();
        builder.insertWords(words);
    });

    test('TrieBlobBuilder.insertWords sorted', () => {
        const builder = new TrieBlobBuilder();
        builder.insertWords(wordsSorted);
    });

    test('TrieBlobBuilder.insertWordsCursor', () => {
        const builder = new TrieBlobBuilder();
        insertWordsIntoTrieBlobBuilderUsingCursor(builder, wordsSorted);
    });

    test('TrieRoot createTrieRootFromList', () => {
        createTrieRootFromList(words);
    });
});

suite('trie create', async (test) => {
    const words = await getWords();
    const wordsSorted = [...words].sort();
    const trie = createTrieRootFromList(words);
    const trieBlob = TrieBlobBuilder.fromWordList(words);
    console.error('Info: %o', {
        wordsSize: words.length,
        TrieBlobSize: trieBlob.size,
        fastTrieSmallSize: TrieBlobBuilder.fromWordList(words.slice(-1000)).size,
    });

    test('TrieBlobBuilder.insert.build', () => {
        const builder = new TrieBlobBuilder();
        builder.insert(words);
        builder.build();
    });

    test('TrieBlobBuilder.insertWords.build', () => {
        const builder = new TrieBlobBuilder();
        builder.insertWords(words);
        builder.build();
    });

    test('TrieBlobBuilder.insertWords.build wordsSorted', () => {
        const builder = new TrieBlobBuilder();
        builder.insertWords(wordsSorted);
        builder.build();
    });

    test('TrieBlobBuilder.insertWordsCursor.build', () => {
        const builder = new TrieBlobBuilder();
        insertWordsIntoTrieBlobBuilderUsingCursor(builder, wordsSorted);
        builder.build();
    });

    test('ITrie buildITrieFromWords', () => {
        buildITrieFromWords(words);
    });

    test('TrieBlobBuilder.fromWordList', () => {
        TrieBlobBuilder.fromWordList(words);
    });

    test('TrieBlobBuilder.fromTrieRoot', () => {
        TrieBlobBuilder.fromTrieRoot(trie);
    });

    test('TrieRoot createTrieRootFromList', () => {
        createTrieRootFromList(words);
    });

    test('TrieBlob createTrieBlobFromTrieRoot', () => {
        createTrieBlobFromTrieRoot(trie);
    });
});

let pWords: Promise<string[]> | undefined = undefined;

function getWords(): Promise<string[]> {
    if (pWords) return pWords;
    pWords = readWordsFromFile();
    return pWords;
}

async function readWordsFromFile(): Promise<string[]> {
    const content = await readFixtureFile('dictionaries/companies/companies.txt');
    const words = [...parseDictionaryLines(content)];
    return words;
}

// cspell:ignore tion aeiou
