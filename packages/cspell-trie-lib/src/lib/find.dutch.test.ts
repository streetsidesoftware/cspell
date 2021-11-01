import { findWord, PartialFindOptions, FindFullResult } from './find';

import * as fs from 'fs-extra';
import * as zlib from 'zlib';
import { importTrie } from './importExport';
import { TrieNode } from './TrieNode';
import * as path from 'path';
import { normalizeWordToLowercase } from './util';

const dutchDictionary = path.join(__dirname, ...'../../../Samples/dicts/nl_compound_trie3.trie.gz'.split('/'));

describe('Validate findWord', () => {
    const pTrie = readTrie(dutchDictionary);

    test('find exact words preserve case', async () => {
        const trie = await pTrie;

        // cspell:ignore aanvaardbaard
        // Code is not allowed as a full word.
        expect(
            findWord(trie, 'aanvaardbaard', {
                matchCase: true,
                compoundMode: 'none',
            })
        ).toEqual({ ...frFound(false), forbidden: true });

        expect(findWord(trie, 'code', { matchCase: true, compoundMode: 'none' })).toEqual({
            found: 'code',
            compoundUsed: false,
            forbidden: false,
            caseMatched: true,
        });

        expect(
            findWord(trie, 'code', {
                matchCase: true,
                compoundMode: 'compound',
            })
        ).toEqual(frFound('code'));
    });

    const tests: [string, PartialFindOptions, FindFullResult][] = [
        ['Code', { matchCase: true, compoundMode: 'none' }, frNotFound({ forbidden: false })],
        ['code', { matchCase: true, compoundMode: 'none' }, frFound('code', { forbidden: false })],
        ['cafe', { matchCase: true, compoundMode: 'none' }, frNotFound({ forbidden: false })],
        [
            'cafe',
            { matchCase: false, compoundMode: 'none' },
            frFound('cafe', { caseMatched: false, forbidden: undefined }),
        ],

        // Compounding enabled, but matching whole words (compounding not used).
        ['Code', { matchCase: true, compoundMode: 'compound' }, frFound(false)],
        ['code', { matchCase: true, compoundMode: 'compound' }, frFound('code')],
        ['cafe', { matchCase: true, compoundMode: 'compound' }, frFound(false)],
        ['cafe', { matchCase: false, compoundMode: 'compound' }, frFound('cafe', { caseMatched: false })],

        // compound words
        testCompound('buurtbewoner'), // cspell:ignore buurtbewoner
        testCompound('buurtbewoners'), // cspell:ignore buurtbewoners

        // forbidden compounds
        [
            'aanvaardbaard',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound('aanvaardbaard', { forbidden: true }),
        ],
    ];

    test.each(tests)('%s %j %j', async (word, options, exResult) => {
        const trie = await pTrie;
        expect(findWord(trie, word, options)).toEqual(exResult);
    });

    test.each(sampleWords())('Find Word: %s', async (word) => {
        const trie = await pTrie;
        const word2 = word[0].toLowerCase() + word.slice(1);
        const r1 = findWord(trie, word, {
            matchCase: true,
            compoundMode: 'compound',
        });
        const r2 =
            r1.found || word === word2
                ? r1
                : ((word = word2),
                  findWord(trie, word, {
                      matchCase: true,
                      compoundMode: 'compound',
                  }));
        expect(r2.found).toEqual(word);
        expect(r2.forbidden).toBeFalsy();
    });

    test.each(sampleWords())('Find Word case insensitive: %s', async (word) => {
        const trie = await pTrie;
        const r = findWord(trie, normalizeWordToLowercase(word), {
            matchCase: false,
            compoundMode: 'compound',
        });
        expect(r.found).toEqual(normalizeWordToLowercase(word));
        expect(r.forbidden).toBeFalsy();
    });

    test.each(sampleMisspellings())(`Check misspelled words: %s`, async (word) => {
        const trie = await pTrie;
        const word2 = word[0].toLowerCase() + word.slice(1);
        const r1 = findWord(trie, word, {
            matchCase: true,
            compoundMode: 'compound',
        });
        const r2 =
            r1.found || word === word2
                ? r1
                : ((word = word2),
                  findWord(trie, word, {
                      matchCase: true,
                      compoundMode: 'compound',
                  }));
        expect(r2.found).toEqual(false);
        expect(r2.forbidden).toBeFalsy();
    });

    test.each(sampleMisspellings())(`Check misspelled words case insensitive: %s`, async (word) => {
        const trie = await pTrie;
        const r = findWord(trie, normalizeWordToLowercase(word), {
            matchCase: false,
            compoundMode: 'compound',
        });
        expect(r.found).toEqual(false);
        expect(r.forbidden).toBeFalsy();
    });
});

function sampleMisspellings(): string[] {
    // cspell:disable
    const text = `
    nieuwjaarnacht
    burgersmeester
    buurtsbewoners
    herdenkingbijeenkomst
    pankoekhuis
    blauwetram
    `;
    // cspell:enable
    return processText(text);
}

function sampleWords(): string[] {
    // cspell:disable
    const text = `
    Arnhem basisschool    burgemeester    buurtbewoners    haarvaten    herdenkingsbijeenkomst
    nabestaanden    onmenselijke    slachtoffers    uitgebrande    verdachten    voorbereiden
    exposé

    De Australische marine heeft honderden inwoners en toeristen uit de kustplaats geëvacueerd
    zo'n mensen vluchtten maandagavond naar het strand toen bosbranden het dorp deels in de as legden en de
    vluchtwegen blokkeerden.

    In het zuidoosten van Australië zijn meer dan 200 brandhaarden.
    De autoriteiten vrezen dat de situatie alleen maar erger wordt door de hoge
    temperaturen en harde wind die voor dit weekend worden verwacht.
    In de deelstaat New Zuid Wales, waar Sydney ligt, geldt de noodtoestand.
    Het Nederlandse ministerie van Buitenlandse Zaken adviseert in het gebied alleen noodzakelijke reizen te maken.

    Nooit eerder waren de jaarlijkse bosbranden in Australië zo ernstig.
    Tot nu toe is een gebied groter dan Nederland afgebrand en zijn meer dan 1400 huizen verwoest.
    Ten minste negentien mensen kwamen om en er zijn tientallen vermisten.

    Verdachten flatbrand Arnhem hebben ook levenslang, zegt Kinderombudsman

    Lange woorden:
    Kindercarnavalsoptochtenvoorbereidingswerkzaamheden
    Meervoudige persoonlijkheidsstoornissen
    Zandzeep mineraalwatersteenstralen
    Randjongerenhangplekkenbeleidsambtenarensalarisbesprekingsafspraken
    Invaliditeitsuitkeringshoofdkwartiervestigingsgebouwfundamentenblauwdruk
    Hottentottententententoonstellingsterrein
    Vervoerdersaansprakelijkheidsverzekering
    Bestuurdersaansprakelijkheidsverzekering
    Overeenstemmingsbeoordelingsprocedures
    `;
    // cspell:enable
    return processText(text);
}

function processText(text: string): string[] {
    return [
        ...new Set(
            text
                .replace(/[.0-9,"“():]/g, ' ')
                .split(/\s+/)
                .sort()
                .filter((a) => !!a)
        ),
    ];
}

function testCompound(word: string, found = true): [string, PartialFindOptions, FindFullResult] {
    return [word, { matchCase: true, compoundMode: 'compound' }, frCompoundFound(found && word, { forbidden: false })];
}

type PartialFindFullResult = Partial<FindFullResult>;

function fr({
    found = false,
    forbidden = undefined,
    compoundUsed = false,
    caseMatched = true,
}: PartialFindFullResult): FindFullResult {
    return {
        found,
        forbidden,
        compoundUsed,
        caseMatched,
    };
}

function frNotFound(r: PartialFindFullResult = {}): FindFullResult {
    const { found = false } = r;
    return fr({ ...r, found });
}

function frFound(found: string | false, r: PartialFindFullResult = {}): FindFullResult {
    return fr({
        ...r,
        found,
    });
}

function frCompoundFound(found: string | false, r: PartialFindFullResult = {}): FindFullResult {
    const { compoundUsed = true } = r;
    return frFound(found, { ...r, compoundUsed });
}

async function readTrie(filename: string): Promise<TrieNode> {
    const lines = await readTextFile(filename);
    return importTrie(lines);
}

function readTextFile(filename: string): Promise<string[]> {
    const lines = fs
        .readFile(filename)
        .then((buffer) => (/\.gz$/.test(filename) ? zlib.gunzipSync(buffer) : buffer))
        .then((buffer) => buffer.toString('utf8'))
        .then((content) => content.split(/\r?\n/g));
    return lines;
}
