// cSpell:ignore jpegs outing dirs lcode outring outrings

import {
    legacyLineToWords,
    compileWordList,
    compileTrie,
    consolidate,
    legacyNormalizeWords,
    __testing__,
    CompileOptions,
} from './wordListCompiler';

import * as fsp from 'fs-extra';
import * as Trie from 'cspell-trie-lib';
import * as path from 'path';
import { genSequence, Sequence } from 'gensequence';
import { readFile } from 'cspell-io';
import { streamWordsFromFile } from './iterateWordsFromFile';
import { isCircular, iteratorTrieWords, serializeTrie, importTrie } from 'cspell-trie-lib';
import { uniqueFilter } from 'hunspell-reader/dist/util';

const testSuiteName = path.basename(__filename);
const UTF8: BufferEncoding = 'utf8';
const samples = path.join(__dirname, '..', '..', '..', 'Samples', 'dicts');
const sampleDictEnUS = path.join(samples, 'hunspell', 'en_US.dic');
const sampleDictEn = path.join(samples, 'en_US.txt');
const temp = path.join(__dirname, '..', '..', 'temp', testSuiteName);

describe('Validate the wordListCompiler', () => {
    test.each`
        line                                                           | expectedResult
        ${'hello'}                                                     | ${['hello']}
        ${'AppendIterator::getArrayIterator'}                          | ${['append', 'iterator', 'get', 'array']}
        ${'Austin Martin'}                                             | ${['austin martin', 'austin', 'martin']}
        ${'JPEGsBLOBs'}                                                | ${['jpegs', 'blobs']}
        ${'CURLs CURLing' /* Sadly we cannot do this one correctly */} | ${['curls curling', 'curls', 'curling']}
        ${'DNSTable Lookup'}                                           | ${['dns', 'table', 'lookup']}
        ${'OUTRing'}                                                   | ${['outring']}
        ${'OUTRings'}                                                  | ${['outrings']}
        ${'DIRs'}                                                      | ${['dirs']}
        ${'AVGAspect'}                                                 | ${['avg', 'aspect']}
        ${'New York'}                                                  | ${['new york', 'new', 'york']}
        ${'Namespace DNSLookup'}                                       | ${['namespace', 'dns', 'lookup']}
        ${'well-educated'}                                             | ${['well', 'educated']}
        ${'CURLcode'}                                                  | ${['cur', 'lcode']}
        ${'kDNSServiceErr_BadSig'}                                     | ${['k', 'dns', 'service', 'err', 'bad', 'sig']}
        ${'apd_get_active_symbols'}                                    | ${['apd', 'get', 'active', 'symbols']}
    `('test legacy splitting lines $line', ({ line, expectedResult }: { line: string; expectedResult: string[] }) => {
        expect(legacyLineToWords(line).filter(distinct()).toArray()).toEqual(expectedResult);
    });

    test.each`
        lines                                                          | expectedResult
        ${'hello'}                                                     | ${['hello']}
        ${'AppendIterator::getArrayIterator'}                          | ${['append', 'iterator', 'get', 'array']}
        ${'Austin Martin'}                                             | ${['austin martin', 'austin', 'martin']}
        ${'JPEGsBLOBs'}                                                | ${['jpegs', 'blobs']}
        ${'CURLs CURLing' /* Sadly we cannot do this one correctly */} | ${['curls curling', 'curls', 'curling']}
        ${'DNSTable Lookup'}                                           | ${['dns', 'table', 'lookup']}
        ${'OUTRing'}                                                   | ${['outring']}
        ${'OUTRings'}                                                  | ${['outrings']}
        ${'DIRs'}                                                      | ${['dirs']}
        ${'AVGAspect'}                                                 | ${['avg', 'aspect']}
        ${'New York'}                                                  | ${['new york', 'new', 'york']}
        ${'Namespace DNSLookup'}                                       | ${['namespace', 'dns', 'lookup']}
        ${'well-educated'}                                             | ${['well', 'educated']}
        ${'CURLcode'}                                                  | ${['cur', 'lcode']}
        ${'kDNSServiceErr_BadSig'}                                     | ${['k', 'dns', 'service', 'err', 'bad', 'sig']}
        ${'apd_get_active_symbols'}                                    | ${['apd', 'get', 'active', 'symbols']}
    `(
        'test normalizer uses legacy line splitting $lines',
        ({ lines, expectedResult }: { lines: string; expectedResult: string[] }) => {
            const normalizer = __testing__.createNormalizer({
                skipNormalization: false,
                splitWords: undefined,
                keepCase: false,
                sort: false,
            });
            const r = normalizer(genSequence(lines.split('\n'))).toArray();
            expect(r).toEqual(expectedResult);
        }
    );

    interface NormalizeTestCase extends Partial<CompileOptions> {
        lines: string;
        expectedResult: string[];
    }

    test.each`
        lines                                       | expectedResult                                  | splitWords | keepCase
        ${'hello'}                                  | ${['hello']}                                    | ${true}    | ${true}
        ${'AppendIterator::getArrayIterator'}       | ${['AppendIterator', 'getArrayIterator']}       | ${true}    | ${true}
        ${'Austin Martin'}                          | ${['Austin', 'Martin']}                         | ${true}    | ${true}
        ${'# cspell-tools:no-split\nAustin Martin'} | ${['# cspell-tools:no-split', 'Austin Martin']} | ${true}    | ${true}
        ${'Austin Martin # Proper name'}            | ${['# Proper name', 'Austin Martin']}           | ${false}   | ${true}
        ${'Austin Martin # Proper name '}           | ${['# Proper name', 'austin martin']}           | ${false}   | ${false}
        ${'Austin Martin # Proper name '}           | ${['# Proper name', 'austin', 'martin']}        | ${true}    | ${false}
        ${'JPEGsBLOBs'}                             | ${['JPEGsBLOBs']}                               | ${true}    | ${true}
        ${'CURLs CURLing'}                          | ${['CURLs', 'CURLing']}                         | ${true}    | ${true}
        ${'DNSTable Lookup'}                        | ${['DNSTable', 'Lookup']}                       | ${true}    | ${true}
        ${'OUTRing'}                                | ${['OUTRing']}                                  | ${true}    | ${true}
        ${'OUTRings'}                               | ${['OUTRings']}                                 | ${true}    | ${true}
        ${'DIRs'}                                   | ${['DIRs']}                                     | ${true}    | ${true}
        ${'AVGAspect'}                              | ${['AVGAspect']}                                | ${true}    | ${true}
        ${'New York'}                               | ${['New', 'York']}                              | ${true}    | ${true}
        ${'New York'}                               | ${['New York']}                                 | ${false}   | ${true}
        ${'Namespace DNSLookup'}                    | ${['Namespace', 'DNSLookup']}                   | ${true}    | ${true}
        ${'well-educated'}                          | ${['well', 'educated']}                         | ${true}    | ${true}
        ${'CURLcode'}                               | ${['CURLcode']}                                 | ${true}    | ${true}
        ${'kDNSServiceErr_BadSig'}                  | ${['kDNSServiceErr', 'BadSig']}                 | ${true}    | ${true}
        ${'apd_get_active_symbols'}                 | ${['apd', 'get', 'active', 'symbols']}          | ${true}    | ${true}
    `('test normalizer line splitting $lines $splitWords $keepCase', (testCase: NormalizeTestCase) => {
        const {
            skipNormalization = false,
            splitWords = false,
            keepCase = false,
            sort = false,
            lines,
            expectedResult,
        } = testCase;
        const normalizer = __testing__.createNormalizer({
            skipNormalization,
            splitWords,
            keepCase,
            sort,
        });
        const r = normalizer(genSequence(lines.split('\n'))).toArray();
        expect(r).toEqual(expectedResult);
    });

    test('reading and normalizing a file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.txt');
        await compileWordList(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            sort: true,
            keepCase: false,
        });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(citiesResultSorted);
    });

    test('compiling to a file without split', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities2.txt');
        await compileWordList(source, destName, {
            skipNormalization: false,
            splitWords: false,
            sort: true,
            keepCase: false,
        });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(citiesSorted.toLowerCase());
    });

    test('tests normalized to a trie', () => {
        const words = citiesResult.split('\n');
        const nWords = legacyNormalizeWords(genSequence(words)).toArray();
        const tWords = [
            ...genSequence([normalizeWordsToTrie(genSequence(words))]).concatMap((node) =>
                Trie.iteratorTrieWords(node)
            ),
        ];
        expect(tWords.sort()).toEqual([...new Set(nWords.sort())]);
    });

    test('reading and normalizing to a trie file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.trie');
        await compileTrie(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            keepCase: false,
            sort: false,
        });
        const srcWords = (await fsp.readFile(destName, 'utf8')).split(/\r?\n/g);
        const node = Trie.importTrie(srcWords);
        const expected = citiesResult
            .split('\n')
            .filter((a) => !!a)
            .sort();
        const words = [...Trie.iteratorTrieWords(node)].sort();
        expect(words).toEqual(expected);
    });

    test('reading and normalizing to a trie gz file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.trie.gz');
        await compileTrie(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            keepCase: false,
            sort: false,
        });
        const resultFile = await readFile(destName, UTF8);
        const srcWords = resultFile.split('\n');
        const node = Trie.importTrie(srcWords);
        const expected = citiesResult
            .split('\n')
            .filter((a) => !!a)
            .sort();
        const words = [...Trie.iteratorTrieWords(node)].sort();
        expect(words).toEqual(expected);
    });

    test('a simple hunspell dictionary depth 0', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'hunspell', 'example.dic'), {
            maxDepth: 0,
        });
        const destName = path.join(temp, 'example0.txt');
        await compileWordList(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            sort: true,
            keepCase: false,
        });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe('hello\ntry\nwork\n');
    });

    test('a simple hunspell dictionary depth 1', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'hunspell', 'example.dic'), {
            maxDepth: 1,
        });
        const destName = path.join(temp, 'example1.txt');
        await compileWordList(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            sort: true,
            keepCase: false,
        });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output.split('\n')).toEqual(['hello', 'rework', 'tried', 'try', 'work', 'worked', '']);
    });

    test.each`
        testCase                                        | line                                            | expectedResult
        ${'hello'}                                      | ${'hello'}                                      | ${['hello']}
        ${'array_intersect_assoc'}                      | ${'array_intersect_assoc'}                      | ${['array', 'intersect', 'assoc']}
        ${'AppendIterator::__construct'}                | ${'AppendIterator::__construct'}                | ${['AppendIterator', 'construct']}
        ${'db2_client_info'}                            | ${'db2_client_info'}                            | ${['db2', 'client', 'info']}
        ${"'db2_client_info'"}                          | ${"'db2_client_info'"}                          | ${['db2', 'client', 'info']}
        ${"don't"}                                      | ${"don't"}                                      | ${["don't"]}
        ${'New York'}                                   | ${'New York'}                                   | ${['New', 'York']}
        ${'MongoDB\\Driver\\Server::getLatency'}        | ${'MongoDB\\Driver\\Server::getLatency'}        | ${['MongoDB', 'Driver', 'Server', 'getLatency']}
        ${'socket.connect(options[, connectListener])'} | ${'socket.connect(options[, connectListener])'} | ${['socket', 'connect', 'options', 'connectListener']}
        ${"Event: 'SIGINT'"}                            | ${"Event: 'SIGINT'"}                            | ${['Event', 'SIGINT']}
    `('splitLine $testCase', ({ line, expectedResult }: { line: string; expectedResult: string[] }) => {
        const r = __testing__.splitLine(line);
        expect(r).toEqual(expectedResult);
    });
});

describe('Validate Larger Dictionary', () => {
    test('en_US hunspell', async () => {
        const source = await streamWordsFromFile(sampleDictEnUS, {});
        const words = source.take(5000).toArray();
        const trie = normalizeWordsToTrie(genSequence(words));
        expect(isCircular(trie)).toBe(false);
        const nWords = legacyNormalizeWords(genSequence(words)).toArray().sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort().filter(uniqueFilter(1000));
        expect(results).toEqual(nWords);
    }, 60000);

    test('en_US word list', async () => {
        const source = await streamWordsFromFile(sampleDictEn, {});
        const words = source.toArray();
        const trie = consolidate(normalizeWordsToTrie(genSequence(words)));
        expect(isCircular(trie)).toBe(false);
        const nWords = legacyNormalizeWords(genSequence(words)).toArray().sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort();
        expect(results).toEqual(nWords);
        const data = serializeTrie(trie, { base: 40 });
        const trie2 = importTrie(data);
        const results2 = iteratorTrieWords(trie2).toArray();
        expect(results2).toEqual(results);
    }, 60000);
});

function normalizeWordsToTrie(words: Sequence<string>): Trie.TrieRoot {
    return Trie.buildTrie(legacyNormalizeWords(words)).root;
}

function distinct(): (word: string) => boolean {
    const known = new Set<string>();
    return (a) => (known.has(a) ? false : (known.add(a), true));
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

const citiesResult = `\
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

const citiesResultSorted = `\
amsterdam
angeles
city
delhi
francisco
london
los
los angeles
mexico
mexico city
new
new amsterdam
new delhi
new york
paris
san
san francisco
york
`;
