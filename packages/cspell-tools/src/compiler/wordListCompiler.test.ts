// cSpell:ignore jpegs outing dirs lcode outring outrings

import { opConcatMap, opTake, pipe, toArray } from '@cspell/cspell-pipe/sync';
import * as Trie from 'cspell-trie-lib';
import { importTrie, isCircular, iteratorTrieWords, serializeTrie } from 'cspell-trie-lib';
import * as fsp from 'fs/promises';
import { uniqueFilter } from 'hunspell-reader';
import * as path from 'path';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { spyOnConsole } from '../test/console.js';
import { createTestHelper } from '../test/TestHelper.js';
import type { CompileOptions } from './CompileOptions.js';
import { legacyLineToWords } from './legacyLineToWords.js';
import { setLogger } from './logger.js';
import { readTextFile } from './readers/readTextFile.js';
import type { SourceReaderOptions } from './SourceReader.js';
import { streamSourceWordsFromFile } from './streamSourceWordsFromFile.js';
import type { CompileTrieOptions } from './wordListCompiler.js';
import { __testing__, compileTrie as _compileTrie, compileWordList as _compileWordList } from './wordListCompiler.js';
import { normalizeTargetWords } from './wordListParser.js';
import { defaultAllowedSplitWords } from './WordsCollection.js';

const testHelper = createTestHelper(import.meta.url);

const samples = path.join(testHelper.packageRoot, '../Samples/dicts');
const sampleDictEnUS = path.join(samples, 'hunspell', 'en_US.dic');
const sampleDictEn = path.join(samples, 'en_US.txt');

const wordListHeader = __testing__.wordListHeader;

const consoleSpy = spyOnConsole();
const consoleOutput = consoleSpy.consoleOutput;

const allowedSplitWords = defaultAllowedSplitWords;

const readOptions: SourceReaderOptions = {
    splitWords: false,
    allowedSplitWords,
};

describe('Validate the wordListCompiler', () => {
    let temp = '.';
    beforeEach(() => {
        temp = testHelper.resolveTemp();
        vi.resetAllMocks();
        consoleSpy.attach();
        setLogger(console.log);
    });

    test.each`
        destFile
        ${'cities.txt'}
        ${'cities.txt.gz'}
    `('reading and normalizing to text file: $destFile', async ({ destFile }) => {
        const source = [...(await streamSourceWordsFromFile(path.join(samples, 'cities.txt'), readOptions))];
        const destName = path.join(temp, destFile);
        await compileWordList(source, destName, compileOpt(false, false));
        const result = await readTextFile(destName);
        const expected = '\n# cspell-tools: keep-case no-split\n\n' + source.join('\n') + '\n';
        expect(result).toEqual(expected);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('compiling to a file without split', async () => {
        const source = await streamSourceWordsFromFile(path.join(samples, 'cities.txt'), readOptions);
        const destName = path.join(temp, 'cities2.txt');
        await compileWordList(source, destName, compileOpt(true));
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(
            wordListHeader +
                '\n' +
                citiesSorted +
                citiesSorted
                    .toLowerCase()
                    .split('\n')
                    .filter((a) => !!a)
                    .map((a) => '~' + a)
                    .join('\n') +
                '\n'
        );
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('tests normalized to a trie', () => {
        const words = citiesLegacyResult.split('\n');
        const nWords = toArray(legacyNormalizeWords(words));
        const tWords = [...Trie.iteratorTrieWords(normalizeWordsToTrie(words))];
        expect(tWords.sort()).toEqual([...new Set(nWords.sort())]);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test.each`
        destFile
        ${'cities.trie'}
        ${'cities.trie.gz'}
    `('reading and normalizing to $destFile', async ({ destFile }) => {
        const source = [...(await streamSourceWordsFromFile(path.join(samples, 'cities.txt'), readOptions))];
        const destName = path.join(temp, destFile);
        await compileTrie(source, destName, compileOpt(true));
        const resultFile = await readTextFile(destName);
        const resultLines = resultFile.split('\n');
        const node = Trie.importTrie(resultLines);
        const words = [...Trie.iteratorTrieWords(node)].filter((a) => !a.startsWith('~')).sort();
        expect(words).toEqual(source.concat().sort());
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('a simple hunspell dictionary depth 0', async () => {
        const source = await streamSourceWordsFromFile(path.join(samples, 'hunspell', 'example.dic'), {
            ...readOptions,
            maxDepth: 0,
        });
        const destName = path.join(temp, 'example0.txt');
        await compileWordList(source, destName, compileOpt(false));
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(__testing__.wordListHeader + '\n' + 'hello\ntry\nwork\n');
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('a simple hunspell dictionary depth 1', async () => {
        const source = await streamSourceWordsFromFile(path.join(samples, 'hunspell/example.dic'), {
            ...readOptions,
            maxDepth: 1,
        });
        const destName = path.join(temp, 'example1.txt');
        await compileWordList(source, destName, compileOpt(false, false));
        const output = await fsp.readFile(destName, 'utf8');
        expect(output.split('\n')).toEqual(
            `\

            # cspell-tools: keep-case no-split

            hello
            rework
            tried
            try
            work
            worked
        `
                .split('\n')
                .map((line) => line.trim())
        );
        expect(consoleOutput()).toMatchSnapshot();
    });
});

describe('Validate Larger Dictionary', () => {
    beforeEach(() => {
        consoleSpy.attach();
        setLogger(console.log);
    });

    test('en_US hunspell', async () => {
        const source = await streamSourceWordsFromFile(sampleDictEnUS, readOptions);
        const words = [...pipe(source, opTake(5000))];
        const trie = normalizeWordsToTrie(words);
        expect(isCircular(trie)).toBe(false);
        const nWords = toArray(legacyNormalizeWords(words)).sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort().filter(uniqueFilter(1000));
        expect(results).toEqual(nWords);
    }, 60000);

    test('en_US word list', async () => {
        const source = await streamSourceWordsFromFile(sampleDictEn, readOptions);
        const words = [...source];
        const trie = Trie.consolidate(normalizeWordsToTrie(words));
        expect(isCircular(trie)).toBe(false);
        const nWords = toArray(legacyNormalizeWords(words)).sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort();
        expect(results).toEqual(nWords);
        const data = serializeTrie(trie, { base: 40 });
        const trie2 = importTrie(data);
        const results2 = iteratorTrieWords(trie2).toArray();
        expect(results2).toEqual(results);
    }, 60000);
});

async function compileTrie(words: Iterable<string>, destFilename: string, options: CompileTrieOptions): Promise<void> {
    const normalizer = normalizeTargetWords(options);
    return _compileTrie(normalizer(words), destFilename, options);
}

async function compileWordList(
    lines: Iterable<string>,
    destFilename: string,
    options: CompileTrieOptions
): Promise<void> {
    const normalizer = normalizeTargetWords(options);
    return _compileWordList(normalizer(lines), destFilename, options);
}

function normalizeWordsToTrie(words: Iterable<string>): Trie.TrieRoot {
    return Trie.buildTrie(legacyNormalizeWords(words)).root;
}

function legacyNormalizeWords(lines: Iterable<string>): Iterable<string> {
    return pipe(
        lines,
        opConcatMap((line) => legacyLineToWords(line, true, allowedSplitWords))
    );
}

function compileOpt(sort: boolean, generateNonStrict = true): CompileOptions {
    return { sort, generateNonStrict };
}

// const cities = `\
// New York
// New Amsterdam
// Los Angeles
// San Francisco
// New Delhi
// Mexico City
// London
// Paris
// `;

const citiesSorted = `\
London
Los Angeles
Mexico City
New Amsterdam
New Delhi
New York
Paris
San Francisco
`;

const citiesLegacyResult = `\
new york
new
york
new amsterdam
amsterdam
los angeles
los
angeles
san francisco
san
francisco
new delhi
delhi
mexico city
mexico
city
london
paris
`;
