// cSpell:ignore jpegs outing dirs lcode outring outrings

import { opConcatMap, opTake, pipe, toArray } from '@cspell/cspell-pipe/sync';
import * as Trie from 'cspell-trie-lib';
import { importTrie, isCircular, iteratorTrieWords, serializeTrie } from 'cspell-trie-lib';
import * as fsp from 'fs-extra';
import { uniqueFilter } from 'hunspell-reader/dist/util';
import * as path from 'path';
import { spyOnConsole } from '../test/console';
import { createTestHelper } from '../test/TestHelper';
import { CompileOptions } from './CompileOptions';
import { streamWordsFromFile } from './iterateWordsFromFile';
import { legacyLineToWords } from './legacyLineToWords';
import { setLogger } from './logger';
import { ReaderOptions } from './Reader';
import { readTextFile } from './readTextFile';
import {
    compileTrie as _compileTrie,
    CompileTrieOptions,
    compileWordList as _compileWordList,
    __testing__,
} from './wordListCompiler';
import { normalizeTargetWords } from './wordListParser';

const testHelper = createTestHelper(__filename);

const samples = path.join(testHelper.packageRoot, '../Samples/dicts');
const sampleDictEnUS = path.join(samples, 'hunspell', 'en_US.dic');
const sampleDictEn = path.join(samples, 'en_US.txt');

const wordListHeader = __testing__.wordListHeader;

const { consoleOutput } = spyOnConsole();
setLogger(console.log);

const readOptions: ReaderOptions = {
    splitWords: false,
};

describe('Validate the wordListCompiler', () => {
    let temp = '.';
    beforeEach(() => {
        testHelper.cdToTempDir();
        temp = testHelper.resolveTemp();
        jest.resetAllMocks();
    });

    test.each`
        destFile
        ${'cities.txt'}
        ${'cities.txt.gz'}
    `('reading and normalizing to text file: $destFile', async ({ destFile }) => {
        const source = [...(await streamWordsFromFile(path.join(samples, 'cities.txt'), readOptions))];
        const destName = path.join(temp, destFile);
        await compileWordList(source, destName, compileOpt(false, false));
        const result = await readTextFile(destName);
        const expected = '\n# cspell-tools: keep-case no-split\n\n' + source.join('\n') + '\n';
        expect(result).toEqual(expected);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('compiling to a file without split', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), readOptions);
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
        const source = [...(await streamWordsFromFile(path.join(samples, 'cities.txt'), readOptions))];
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
        const source = await streamWordsFromFile(path.join(samples, 'hunspell', 'example.dic'), {
            ...readOptions,
            maxDepth: 0,
        });
        const destName = path.join(temp, 'example0.txt');
        await compileWordList(source, destName, compileOpt(false));
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(__testing__.wordListHeader + '\n' + 'hello\n~hello\ntry\n~try\nwork\n~work\n');
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('a simple hunspell dictionary depth 1', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'hunspell/example.dic'), {
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
    test('en_US hunspell', async () => {
        const source = await streamWordsFromFile(sampleDictEnUS, readOptions);
        const words = [...pipe(source, opTake(5000))];
        const trie = normalizeWordsToTrie(words);
        expect(isCircular(trie)).toBe(false);
        const nWords = toArray(legacyNormalizeWords(words)).sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort().filter(uniqueFilter(1000));
        expect(results).toEqual(nWords);
    }, 60000);

    test('en_US word list', async () => {
        const source = await streamWordsFromFile(sampleDictEn, readOptions);
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
        opConcatMap((line) => legacyLineToWords(line, true))
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
