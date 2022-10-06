// cSpell:ignore jpegs outing dirs lcode outring outrings

import { opFilter, pipe, toArray } from '@cspell/cspell-pipe/sync';
import { CompileOptions, NormalizeOptions } from './CompileOptions';
import { createNormalizer, __testing__ } from './wordListParser';

const { splitLine, legacyLineToWords } = __testing__;

describe('Validate the wordListCompiler', () => {
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
        'normalizer uses legacy line splitting $lines',
        ({ lines, expectedResult }: { lines: string; expectedResult: string[] }) => {
            const normalizer = createNormalizer({
                skipNormalization: false,
                splitWords: undefined,
                keepRawCase: false,
                legacy: true,
            });
            const r = toArray(normalizer(lines.split('\n')));
            expect(r).toEqual(expectedResult.sort());
        }
    );

    interface NormalizeTestCase extends Partial<CompileOptions & NormalizeOptions> {
        text: string;
        expectedResult: string[];
    }

    // cspell:ignore niño

    test.each`
        text                                        | expectedResult                                | splitWords | keepRawCase
        ${'hello'}                                  | ${['hello']}                                  | ${true}    | ${true}
        ${'English'}                                | ${['English']}                                | ${true}    | ${true}
        ${'English'}                                | ${['English', '~english']}                    | ${true}    | ${false}
        ${'café'}                                   | ${['café', '~cafe']}                          | ${true}    | ${false}
        ${'AppendIterator::getArrayIterator'}       | ${['AppendIterator', 'getArrayIterator']}     | ${true}    | ${true}
        ${'Austin Martin'}                          | ${['Austin', 'Martin']}                       | ${true}    | ${true}
        ${'# cspell-tools:no-split\nAustin Martin'} | ${['Austin Martin']}                          | ${true}    | ${true}
        ${'Austin Martin # Proper name'}            | ${['Austin Martin']}                          | ${false}   | ${true}
        ${'Austin Martin # Proper name '}           | ${['Austin Martin', '~austin martin']}        | ${false}   | ${false}
        ${'Austin Martin # Proper name '}           | ${['Austin', '~austin', 'Martin', '~martin']} | ${true}    | ${false}
        ${'JPEGsBLOBs'}                             | ${['JPEGsBLOBs']}                             | ${true}    | ${true}
        ${'CURLs CURLing'}                          | ${['CURLs', 'CURLing']}                       | ${true}    | ${true}
        ${'DNSTable Lookup'}                        | ${['DNSTable', 'Lookup']}                     | ${true}    | ${true}
        ${'OUTRing'}                                | ${['OUTRing']}                                | ${true}    | ${true}
        ${'OUTRings'}                               | ${['OUTRings']}                               | ${true}    | ${true}
        ${'DIRs'}                                   | ${['DIRs']}                                   | ${true}    | ${true}
        ${'AVGAspect'}                              | ${['AVGAspect']}                              | ${true}    | ${true}
        ${'New York'}                               | ${['New', 'York']}                            | ${true}    | ${true}
        ${'New York'}                               | ${['New York']}                               | ${false}   | ${true}
        ${'Namespace DNSLookup'}                    | ${['Namespace', 'DNSLookup']}                 | ${true}    | ${true}
        ${'well-educated'}                          | ${['well-educated']}                          | ${true}    | ${true}
        ${'--abort-on-uncaught-exception'}          | ${['--abort-on-uncaught-exception']}          | ${true}    | ${true}
        ${'corner cafe\u0301\u0304'}                | ${['corner café\u0304']}                      | ${false}   | ${true}
        ${'corner café'}                            | ${['café', 'corner']}                         | ${true}    | ${true}
        ${'corner café'.normalize('NFD')}           | ${['café', 'corner']}                         | ${true}    | ${true}
        ${'corner café\u0304'.normalize('NFD')}     | ${['café\u0304', 'corner']}                   | ${true}    | ${true}
        ${'El Niño'}                                | ${['El', 'Niño']}                             | ${true}    | ${true}
        ${'El Nin\u0303o'}                          | ${['El', 'Niño']}                             | ${true}    | ${true}
        ${'CURLcode'}                               | ${['CURLcode']}                               | ${true}    | ${true}
        ${'kDNSServiceErr_BadSig'}                  | ${['kDNSServiceErr_BadSig']}                  | ${true}    | ${true}
        ${'apd_get_active_symbols'}                 | ${['apd_get_active_symbols']}                 | ${true}    | ${true}
    `('normalizer line splitting "$text" $splitWords $keepRawCase', (testCase: NormalizeTestCase) => {
        const { skipNormalization = false, splitWords = false, keepRawCase = false, text, expectedResult } = testCase;
        const normalizer = createNormalizer({
            skipNormalization,
            splitWords,
            keepRawCase,
            legacy: false,
        });
        const r = toArray(normalizer(text.split('\n')));
        expect(r).toEqual(expectedResult.sort());
    });

    test.each`
        testCase                                        | line                                                   | expectedResult
        ${'hello'}                                      | ${'hello'}                                             | ${['hello']}
        ${'array_intersect_assoc'}                      | ${'array_intersect_assoc'}                             | ${['array_intersect_assoc']}
        ${'AppendIterator::__construct'}                | ${'AppendIterator::__construct'}                       | ${['AppendIterator', '__construct']}
        ${'db2_client_info'}                            | ${'db2_client_info'}                                   | ${['db2_client_info']}
        ${"'db2_client_info'"}                          | ${"'db2_client_info'"}                                 | ${['db2_client_info']}
        ${"don't"}                                      | ${"don't"}                                             | ${["don't"]}
        ${'New York'}                                   | ${'New York'}                                          | ${['New', 'York']}
        ${'MongoDB\\Driver\\Server::getLatency'}        | ${'MongoDB\\Driver\\Server::getLatency'}               | ${['MongoDB', 'Driver', 'Server', 'getLatency']}
        ${'socket.connect(options[, connectListener])'} | ${'socket.connect(options[, connectListener])'}        | ${['socket', 'connect', 'options', 'connectListener']}
        ${"Event: 'SIGINT'"}                            | ${"Event: 'SIGINT'"}                                   | ${['Event', 'SIGINT']}
        ${'Rav4'}                                       | ${'Rav4'}                                              | ${['Rav4']}
        ${'Numbers 128 0x0 0o37 65001'}                 | ${'Numbers 128 0x0 0o37 65001 \\u00E9 U+1F436 \\x0F '} | ${['Numbers']}
    `('splitLine $testCase', ({ line, expectedResult }: { line: string; expectedResult: string[] }) => {
        const r = splitLine(line);
        expect(r).toEqual(expectedResult);
    });
});

function distinct(): (word: string) => boolean {
    const known = new Set<string>();
    return (a) => (known.has(a) ? false : (known.add(a), true));
}
