// cSpell:ignore jpegs outing dirs lcode outring outrings

import { opFilter, pipe } from '@cspell/cspell-pipe/sync';

import { resolvePathToFixture } from '../test/TestHelper';
import { createAllowedSplitWordsFromFiles } from './createWordsCollection';
import { legacyLineToWords } from './legacyLineToWords';
import { defaultAllowedSplitWords } from './WordsCollection';

const allowed = defaultAllowedSplitWords;

describe('Validate legacyLineToWords', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each`
        line                                                           | expectedResult
        ${'hello'}                                                     | ${['hello']}
        ${'AppendIterator::getArrayIterator'}                          | ${['append', 'iterator', 'get', 'array']}
        ${'Austin Martin'}                                             | ${['austin', 'martin']}
        ${'JPEGsBLOBs'}                                                | ${['jpegs', 'blobs']}
        ${'CURLs CURLing' /* Sadly we cannot do this one correctly */} | ${['curls', 'curling']}
        ${'DNSTable Lookup'}                                           | ${['dns', 'table', 'lookup']}
        ${'OUTRing'}                                                   | ${['outring']}
        ${'OUTRings'}                                                  | ${['outrings']}
        ${'DIRs'}                                                      | ${['dirs']}
        ${'AVGAspect'}                                                 | ${['avg', 'aspect']}
        ${'New York'}                                                  | ${['new', 'york']}
        ${'Namespace DNSLookup'}                                       | ${['namespace', 'dns', 'lookup']}
        ${'well-educated'}                                             | ${['well', 'educated']}
        ${'CURLcode'}                                                  | ${['cur', 'lcode']}
        ${'kDNSServiceErr_BadSig'}                                     | ${['k', 'dns', 'service', 'err', 'bad', 'sig']}
        ${'apd_get_active_symbols'}                                    | ${['apd', 'get', 'active', 'symbols']}
    `('legacy splitting lines $line', ({ line, expectedResult }: { line: string; expectedResult: string[] }) => {
        expect([...pipe(legacyLineToWords(line, false, allowed), opFilter(distinct()))]).toEqual(expectedResult);
    });

    test.each`
        line                                  | expectedResult
        ${'hello'}                            | ${['hello']}
        ${'AppendIterator::getArrayIterator'} | ${['AppendIterator', 'getArrayIterator']}
        ${'Namespace DNSLookup'}              | ${['Namespace', 'DNSLookup']}
        ${'well-educated'}                    | ${['well', 'educated']}
        ${'CURLcode'}                         | ${['CURLcode']}
        ${'RedGreen'}                         | ${['red', 'green']}
        ${'kDNSServiceErr_BadSig'}            | ${['kDNSServiceErr', 'bad', 'sig']}
        ${'apd_get_active_symbols'}           | ${['apd', 'get', 'active', 'symbols']}
    `('legacy splitting lines $line', async ({ line, expectedResult }: { line: string; expectedResult: string[] }) => {
        const allowed = await createAllowedSplitWordsFromFiles([resolvePathToFixture('dicts/colors.trie')]);
        expect([...pipe(legacyLineToWords(line, false, allowed), opFilter(distinct()))]).toEqual(expectedResult);
    });
});

function distinct(): (word: string) => boolean {
    const known = new Set<string>();
    return (a) => (known.has(a) ? false : (known.add(a), true));
}
