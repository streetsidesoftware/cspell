// cSpell:ignore jpegs outing dirs lcode outring outrings

import { lineToWords, compileWordList, compileTrie, consolidate } from './wordListCompiler';
import { normalizeWords, normalizeWordsToTrie } from './wordListCompiler';
import * as fsp from 'fs-extra';
import * as Trie from 'cspell-trie-lib';
import * as path from 'path';
import { genSequence } from 'gensequence';
import { readFile } from 'cspell-io';
import { streamWordsFromFile } from './iterateWordsFromFile';
import { isCircular, iteratorTrieWords, serializeTrie, importTrie } from 'cspell-trie-lib';
import { uniqueFilter } from 'hunspell-reader/dist/util';


const UTF8: BufferEncoding = 'utf8';
const samples = path.join(__dirname, '..', '..', '..', 'Samples', 'dicts');
const sampleDictEnUS = path.join(samples, 'hunspell', 'en_US.dic');
const sampleDictEn = path.join(samples, 'en_US.txt');
const temp = path.join(__dirname, '..', '..', 'temp');

describe('Validate the wordListCompiler', () => {
    test('tests splitting lines', () => {
        const line = 'AppendIterator::getArrayIterator';
        expect(lineToWords(line).filter(distinct()).toArray()).toEqual([
            'append',
            'iterator',
            'get',
            'array',
        ]);
        expect(lineToWords('Austin Martin').toArray()).toEqual([
            'austin martin', 'austin', 'martin'
        ]);
        expect(lineToWords('JPEGsBLOBs').filter(distinct()).toArray()).toEqual(['jpegs', 'blobs']);
        expect(lineToWords('CURLs CURLing').filter(distinct()).toArray()).toEqual(['curls curling', 'curls', 'curling']);
        expect(lineToWords('DNSTable Lookup').filter(distinct()).toArray()).toEqual(['dns', 'table', 'lookup']);
        expect(lineToWords('OUTRing').filter(distinct()).toArray()).toEqual(['outring']);
        expect(lineToWords('OUTRings').filter(distinct()).toArray()).toEqual(['outrings']);
        expect(lineToWords('DIRs').filter(distinct()).toArray()).toEqual(['dirs']);
        expect(lineToWords('AVGAspect').filter(distinct()).toArray()).toEqual(['avg', 'aspect']);
        expect(lineToWords('New York').filter(distinct()).toArray()).toEqual(['new york', 'new', 'york']);
        expect(lineToWords('Namespace DNSLookup').filter(distinct()).toArray()).toEqual(['namespace', 'dns', 'lookup']);
        expect(lineToWords('well-educated').filter(distinct()).toArray()).toEqual(['well', 'educated']);
        // Sadly we cannot do this one correctly
        expect(lineToWords('CURLcode').filter(distinct()).toArray()).toEqual(['cur', 'lcode']);
        expect(lineToWords('kDNSServiceErr_BadSig').filter(distinct()).toArray()).toEqual([
            'k',
            'dns',
            'service',
            'err',
            'bad',
            'sig',
        ]);
        expect(lineToWords('apd_get_active_symbols').filter(distinct()).toArray()).toEqual([
            'apd',
            'get',
            'active',
            'symbols',
        ]);
    });

    test('test reading and normalizing a file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.txt');
        await compileWordList(source, destName, { splitWords: true, sort: true });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(citiesResultSorted);
    });

    test('test compiling to a file without split', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities2.txt');
        await compileWordList(source, destName, { splitWords: false, sort: true });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(citiesSorted.toLowerCase());
    });

    test('tests normalized to a trie', () => {
        const words = citiesResult.split('\n');
        const nWords = normalizeWords(genSequence(words)).toArray();
        const tWords = [...genSequence([normalizeWordsToTrie(genSequence(words))])
            .concatMap(node => Trie.iteratorTrieWords(node))];
        expect(tWords.sort()).toEqual([...(new Set(nWords.sort()))]);
    });

    test('test reading and normalizing to a trie file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.trie');
        await compileTrie(source, destName, {});
        const srcWords = (await fsp.readFile(destName, 'utf8')).split('\n');
        const node = Trie.importTrie(srcWords);
        const expected = citiesResult.split('\n').filter(a => !!a).sort();
        const words = [...Trie.iteratorTrieWords(node)].sort();
        expect(words).toEqual(expected);
    });

    test('test reading and normalizing to a trie gz file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.trie.gz');
        await compileTrie(source, destName, {});
        const resultFile = await readFile(destName, UTF8);
        const srcWords = resultFile.split('\n');
        const node = Trie.importTrie(srcWords);
        const expected = citiesResult.split('\n').filter(a => !!a).sort();
        const words = [...Trie.iteratorTrieWords(node)].sort();
        expect(words).toEqual(expected);
    });

    test('test a simple hunspell dictionary depth 0', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'hunspell', 'example.dic'), { maxDepth: 0});
        const destName = path.join(temp, 'example0.txt');
        await compileWordList(source, destName, { splitWords: false, sort: true });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe('hello\ntry\nwork\n');
    });

    test('test a simple hunspell dictionary depth 1', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'hunspell', 'example.dic'), { maxDepth: 1});
        const destName = path.join(temp, 'example0.txt');
        await compileWordList(source, destName, { splitWords: false, sort: true });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output.split('\n')).toEqual(['hello', 'rework', 'tried', 'try', 'work', 'worked', '']);
    });
});

describe('Validate Larger Dictionary', () => {
    test('en_US hunspell', async () => {
        const source = await streamWordsFromFile(sampleDictEnUS, {});
        const words = source.take(5000).toArray();
        const trie = normalizeWordsToTrie(genSequence(words));
        expect(isCircular(trie)).toBe(false);
        const nWords = normalizeWords(genSequence(words)).toArray().sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort().filter(uniqueFilter(1000));
        expect(results).toEqual(nWords);
    }, 60000);

    test('en_US word list', async () => {
        const source = await streamWordsFromFile(sampleDictEn, {});
        const words = source.toArray();
        const trie = consolidate(normalizeWordsToTrie(genSequence(words)));
        expect(isCircular(trie)).toBe(false);
        const nWords = normalizeWords(genSequence(words)).toArray().sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort();
        expect(results).toEqual(nWords);
        const data = serializeTrie(trie, { base: 40 });
        const trie2 = importTrie(data);
        const results2 = iteratorTrieWords(trie2).toArray();
        expect(results2).toEqual(results);
    }, 60000);
});


function distinct(): (word: string) => boolean {
    const known = new Set<String>();
    return a => known.has(a) ? false : (known.add(a), true);
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
