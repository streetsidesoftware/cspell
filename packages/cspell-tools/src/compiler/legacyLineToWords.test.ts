// cSpell:ignore jpegs outing dirs lcode outring outrings

import { opFilter, pipe } from '@cspell/cspell-pipe/sync';
import { legacyLineToWords } from './legacyLineToWords';

describe('Validate legacyLineToWords', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

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
    `('legacy splitting lines $line', ({ line, expectedResult }: { line: string; expectedResult: string[] }) => {
        expect([...pipe(legacyLineToWords(line), opFilter(distinct()))]).toEqual(expectedResult);
    });
});

function distinct(): (word: string) => boolean {
    const known = new Set<string>();
    return (a) => (known.has(a) ? false : (known.add(a), true));
}
