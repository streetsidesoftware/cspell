// cSpell:ignore jpegs outing dirs lcode outring outrings

import { expect } from 'chai';
import { lineToWords, compileWordList, compileTrie } from './wordListCompiler';
import { normalizeWords, normalizeWordsToTrie } from './wordListCompiler';
import * as fsp from 'fs-extra';
import * as Trie from 'cspell-trie-lib';
import * as path from 'path';
import { genSequence } from 'gensequence';
import { readFile } from 'cspell-io';
import { streamWordsFromFile } from './iterateWordsFromFile';

const UTF8: BufferEncoding = 'utf8';

describe('Validate the wordListCompiler', () => {
    test('tests splitting lines', () => {
        const line = 'AppendIterator::getArrayIterator';
        expect(lineToWords(line).filter(distinct()).toArray()).to.deep.equal([
            'append',
            'iterator',
            'get',
            'array',
        ]);
        expect(lineToWords('Austin Martin').toArray()).to.deep.equal([
            'austin martin', 'austin', 'martin'
        ]);
        expect(lineToWords('JPEGsBLOBs').filter(distinct()).toArray()).to.deep.equal(['jpegs', 'blobs']);
        expect(lineToWords('CURLs CURLing').filter(distinct()).toArray()).to.deep.equal(['curls curling', 'curls', 'curling']);
        expect(lineToWords('DNSTable Lookup').filter(distinct()).toArray()).to.deep.equal(['dns', 'table', 'lookup']);
        expect(lineToWords('OUTRing').filter(distinct()).toArray()).to.deep.equal(['outring']);
        expect(lineToWords('OUTRings').filter(distinct()).toArray()).to.deep.equal(['outrings']);
        expect(lineToWords('DIRs').filter(distinct()).toArray()).to.deep.equal(['dirs']);
        expect(lineToWords('AVGAspect').filter(distinct()).toArray()).to.deep.equal(['avg', 'aspect']);
        expect(lineToWords('New York').filter(distinct()).toArray()).to.deep.equal(['new york', 'new', 'york']);
        expect(lineToWords('Namespace DNSLookup').filter(distinct()).toArray()).to.deep.equal(['namespace', 'dns', 'lookup']);
        expect(lineToWords('well-educated').filter(distinct()).toArray()).to.deep.equal(['well', 'educated']);
        // Sadly we cannot do this one correctly
        expect(lineToWords('CURLcode').filter(distinct()).toArray()).to.deep.equal(['cur', 'lcode']);
        expect(lineToWords('kDNSServiceErr_BadSig').filter(distinct()).toArray()).to.deep.equal([
            'k',
            'dns',
            'service',
            'err',
            'bad',
            'sig',
        ]);
        expect(lineToWords('apd_get_active_symbols').filter(distinct()).toArray()).to.deep.equal([
            'apd',
            'get',
            'active',
            'symbols',
        ]);
    });

    test('test reading and normalizing a file', async () => {
        const sourceName = await streamWordsFromFile(path.join(__dirname, '..', '..', 'Samples', 'cities.txt'), {});
        const destName = path.join(__dirname, '..', '..', 'temp', 'cities.txt');
        await compileWordList(sourceName, destName, { splitWords: true, sort: true });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).to.be.equal(citiesResultSorted);
    });

    test('test compiling to a file without split', async () => {
        const sourceName = await streamWordsFromFile(path.join(__dirname, '..', '..', 'Samples', 'cities.txt'), {});
        const destName = path.join(__dirname, '..', '..', 'temp', 'cities2.txt');
        await compileWordList(sourceName, destName, { splitWords: false, sort: true })
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).to.be.equal(citiesSorted.toLowerCase());
    });

    test('tests normalized to a trie', () => {
        const words = citiesResult.split('\n');
        const nWords = normalizeWords(genSequence(words)).toArray();
        const tWords = [...genSequence([normalizeWordsToTrie(genSequence(words))])
            .concatMap(node => Trie.iteratorTrieWords(node))];
        expect(tWords.sort()).to.be.deep.equal([...(new Set(nWords.sort()))]);
    });

    test('test reading and normalizing to a trie file', async () => {
        const sourceName = await streamWordsFromFile(path.join(__dirname, '..', '..', 'Samples', 'cities.txt'), {});
        const destName = path.join(__dirname, '..', '..', 'temp', 'cities.trie');
        await compileTrie(sourceName, destName, {});
        const srcWords = (await fsp.readFile(destName, 'utf8')).split('\n');
        const node = Trie.importTrie(srcWords);
        const expected = citiesResult.split('\n').filter(a => !!a).sort();
        const words = [...Trie.iteratorTrieWords(node)].sort();
        expect(words).to.be.deep.equal(expected);
    });

    test('test reading and normalizing to a trie gz file', async () => {
        const sourceName = await streamWordsFromFile(path.join(__dirname, '..', '..', 'Samples', 'cities.txt'), {});
        const destName = path.join(__dirname, '..', '..', 'temp', 'cities.trie.gz');
        await compileTrie(sourceName, destName, {});
        const resultFile = await readFile(destName, UTF8);
        const srcWords = resultFile.split('\n');
        const node = Trie.importTrie(srcWords);
        const expected = citiesResult.split('\n').filter(a => !!a).sort();
        const words = [...Trie.iteratorTrieWords(node)].sort();
        expect(words).to.be.deep.equal(expected);
    });

    test('test a simple hunspell dictionary depth 0', async () => {
        const sourceName = await streamWordsFromFile(path.join(__dirname, '..', '..', 'Samples', 'hunspell', 'example.dic'), { maxDepth: 0});
        const destName = path.join(__dirname, '..', '..', 'temp', 'example0.txt');
        await compileWordList(sourceName, destName, { splitWords: false, sort: true });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).to.be.equal('hello\ntry\nwork\n');
    });

    test('test a simple hunspell dictionary depth 1', async () => {
        const sourceName = await streamWordsFromFile(path.join(__dirname, '..', '..', 'Samples', 'hunspell', 'example.dic'), { maxDepth: 1});
        const destName = path.join(__dirname, '..', '..', 'temp', 'example0.txt');
        await compileWordList(sourceName, destName, { splitWords: false, sort: true });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output.split('\n')).to.be.deep.equal(['hello', 'rework', 'tried', 'try', 'work', 'worked', '']);
    });
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
