import type { TextOffset } from '@cspell/cspell-types';

import type { SortedBreaks } from './wordSplitter';
import { __testing__, split } from './wordSplitter';

const generateWordBreaks = __testing__.generateWordBreaks;

const words = sampleWordSet();
const regHasLetters = /\p{L}/u;

describe('Validate wordSplitter', () => {
    interface TestApplyWordBreaks {
        text: string;
        expected: string[];
    }

    test('expensive split', () => {
        // cspell:disable
        // The following is an example of a very expensive split
        const randomText = 'token = "Usf3uVQOZ9m6uPfVonKR-EBXjPe7bjMbp3_Fq8MfsptgkkM1ojidN0BxYaT5HAEN1";';
        // cspell:enable

        const line = {
            text: randomText,
            offset: 0,
        };
        const result = split(line, 9, has);
        const words = result.words.map((w) => w.text).join('|');
        // cspell:ignore VQOZ Mfsptgkk ojid HAEN
        expect(words).toBe('Usf|u|VQOZ|m|u|Pf|Von|KR|EB|Xj|Pe|bj|Mbp|Fq|Mfsptgkk|M|ojid|N|Bx|Ya|T|HAEN');
        expect(result.words.filter((w) => !w.isFound).length).toBe(7);
    });

    // cspell:ignore MOVSX
    test.each`
        text                | expected
        ${'hello'}          | ${['hello']}
        ${'well-educated'}  | ${['well', 'educated']}
        ${'ERRORCode'}      | ${['ERROR', 'Code']}
        ${'MOVSX_r_rm16'}   | ${['MOVSX', 'r', 'rm']}
        ${'32bit-checksum'} | ${['bit', 'checksum']}
        ${'camelCase'}      | ${['camel', 'Case']}
    `('Extract word breaks to $text', ({ text, expected }: TestApplyWordBreaks) => {
        const line = {
            text,
            offset: 42,
        };
        const lineSeg = {
            line: line,
            relStart: 0,
            relEnd: text.length,
        };
        const posBreaks = generateWordBreaks(lineSeg, {});

        const breaks = extractBreaks(posBreaks);
        const r = applyWordBreaks(line, breaks);
        expect(r.map((t) => t.text)).toEqual(expected);
    });

    test.each`
        text                | expected
        ${'hello'}          | ${['hello']}
        ${'well-educated'}  | ${['well|educated', 'well|-educated', 'well-|educated', 'well-educated']}
        ${'MOVSX_r_rm16'}   | ${['MOVSX|r|rm']}
        ${'32bit-checksum'} | ${['bit|checksum']}
        ${'ERRORCode'}      | ${['ERROR|Code']}
        ${'camelCase'}      | ${['camel|Case', 'camelCase']}
    `('Extract all possible word breaks to $text', ({ text, expected }: TestApplyWordBreaks) => {
        const line = {
            text,
            offset: 42,
        };
        const lineSeg = {
            line: line,
            relStart: 0,
            relEnd: text.length,
        };

        const posBreaks = generateWordBreaks(lineSeg, {});
        const r = genAllPossibleResults(text, posBreaks);
        expect(r[0]).toEqual(expected[0]); // Expect the first candidate to be the one with the shortest words.
        expect(r).toEqual(expect.arrayContaining(expected));
        expect(r).toEqual(expect.arrayContaining([text])); // this assumes the original text is a candidate
        expect(r).toMatchSnapshot(); // Use snapshots to ensure all possible options are generated.
    });

    interface PartialTextOffsetWithIsFound {
        text: string;
        offset?: number;
        isFound?: boolean;
    }

    interface TestSplit {
        text: string;
        expectedWords: PartialTextOffsetWithIsFound[];
    }

    /** to PartialTextOffsetWithIsFound */
    function tov(p: PartialTextOffsetWithIsFound | string, defaultIsFound = true): PartialTextOffsetWithIsFound {
        if (typeof p === 'string') {
            p = { text: p };
        }
        const { isFound = defaultIsFound } = p;
        return { ...p, isFound };
    }

    function splitTov(t: string): PartialTextOffsetWithIsFound[] {
        if (!t) return [];
        const parts = t.split('|');
        return parts.map((p) => tov(p, has({ text: p, offset: 0 })));
    }

    // cspell:ignore CVTPD CVTSI CVTTSD words'separated'by errorcode
    // cspell:word Geschäft gescha
    test.each`
        text                                | expectedWords
        ${'hello'}                          | ${[tov({ text: 'hello', offset: 155 })]}
        ${'well-educated'}                  | ${[tov('well'), tov('educated')]}
        ${'MOVSX_r_rm16'}                   | ${splitTov('MOVSX_r_rm16')}
        ${'32bit-checksum'}                 | ${splitTov('bit|checksum')}
        ${'ERRORCode'}                      | ${splitTov('ERROR|Code')}
        ${'camelCase'}                      | ${splitTov('camel|Case')}
        ${'CVTPD2PS_x_xm'}                  | ${splitTov('CVTPD2PS|x|xm')}
        ${'CVTSI2SD_x_rm'}                  | ${splitTov('CVTSI|SD|x|rm')}
        ${'CVTTSD2SI_r_xm'}                 | ${splitTov('CVTTSD|SI|r|xm')}
        ${'error_code42_one_two'}           | ${splitTov('error|code42|one|two')}
        ${'_errorcode42_one_two'}           | ${splitTov('_errorcode42|one|two')}
        ${"words'separated'by_singleQuote"} | ${splitTov(`words|separated|by|singleQuote`)}
        ${"Tom's_hardware"}                 | ${splitTov("Tom's|hardware")}
        ${'Geschäft'}                       | ${splitTov('Geschäft')}
    `('split $text', ({ text, expectedWords }: TestSplit) => {
        const prefix = 'this is some';
        const line = {
            text: `${prefix} ${text} to split.`,
            offset: 142,
        };
        const offset = line.offset + prefix.length;
        const r = split(line, offset, has);
        expect(r.offset).toBe(offset);
        expect(r.endOffset).toBe(r.text.offset + r.text.text.length);
        expect(r.words).toEqual(expect.arrayContaining(expectedWords.map(expect.objectContaining)));
        expect(r.words).toHaveLength(expectedWords.length);
    });

    interface TestSplitWithCalls extends TestSplit {
        calls: number;
    }

    test.each`
        text                                | expectedWords                                 | calls
        ${'hello'}                          | ${[tov({ text: 'hello', offset: 142 })]}      | ${1}
        ${''}                               | ${[]}                                         | ${0}
        ${'#@()&*'}                         | ${[]}                                         | ${0}
        ${'well-educated'}                  | ${[tov('well'), tov('educated')]}             | ${2}
        ${'MOVSX_r_rm16'}                   | ${splitTov('MOVSX_r_rm16')}                   | ${8}
        ${'32bit-checksum'}                 | ${splitTov('bit|checksum')}                   | ${2}
        ${'ERRORCodesTwo'}                  | ${splitTov('ERROR|Codes|Two')}                | ${4}
        ${'camelCase'}                      | ${splitTov('camel|Case')}                     | ${2}
        ${'CVTPD2PS_x_xm'}                  | ${splitTov('CVTPD2PS|x|xm')}                  | ${6}
        ${'CVTSI2SD_x_rm'}                  | ${splitTov('CVTSI|SD|x|rm')}                  | ${10}
        ${'errCVTTSD2SI_r_xm'}              | ${splitTov('err|CVTTSD|SI|r|xm')}             | ${12}
        ${"words'separated'by_singleQuote"} | ${splitTov('words|separated|by|singleQuote')} | ${6}
        ${"Tom's_hardware"}                 | ${splitTov("Tom's|hardware")}                 | ${5}
    `('split edge cases `$text`', ({ text, expectedWords, calls }: TestSplitWithCalls) => {
        const line = {
            text,
            offset: 142,
        };
        const offset = line.offset;
        const h = jest.fn();
        const hasCalls: string[] = [];
        h.mockImplementation((t) => {
            hasCalls.push(t.text);
            return has(t);
        });
        const r = split(line, offset, h, { optionalWordBreakCharacters: `'` });
        // console.log(hasCalls);
        expect(r.offset).toBe(offset);
        expect(r.endOffset).toBe(r.text.offset + r.text.text.length);
        expect(r.words).toEqual(expect.arrayContaining(expectedWords.map(expect.objectContaining)));
        expect(r.words).toHaveLength(expectedWords.length);
        expect(h).toHaveBeenCalledTimes(calls);
    });

    interface TestSplit2 {
        text: string;
        expectedWords: string;
        calls: number;
    }

    // cspell:ignore nstatic techo n'cpp n'log refactor'd î
    test.each`
        text              | expectedWords      | calls
        ${'static'}       | ${'static'}        | ${1}
        ${'nstatic'}      | ${'static'}        | ${1}
        ${'techo'}        | ${'echo'}          | ${1}
        ${`n'cpp`}        | ${'cpp'}           | ${1}
        ${`î'cpp`}        | ${'î|cpp'}         | ${2}
        ${`îphoneStatic`} | ${'îphone|Static'} | ${2}
        ${`êphoneStatic`} | ${'êphone|Static'} | ${2}
        ${`geschäft`}     | ${'geschäft'}      | ${1}
        ${`n'log`}        | ${'log'}           | ${9}
        ${'64-bit'}       | ${'bit'}           | ${1}
        ${'128-bit'}      | ${'bit'}           | ${1}
        ${'256-sha'}      | ${'256-sha'}       | ${6}
        ${`REFACTOR'd`}   | ${'REFACTOR'}      | ${3}
        ${`dogs'`}        | ${`dogs'`}         | ${2}
        ${`planets’`}     | ${`planets’`}      | ${2}
    `('split `$text` in doc', ({ text, expectedWords, calls }: TestSplit2) => {
        const expectedWordSegments = splitTov(expectedWords);
        const doc = sampleText();
        const line = findLine(doc, text);
        const offset = line.offset + line.text.indexOf(text);
        expect(offset).toBeGreaterThan(0);
        const h = jest.fn();
        const hasCalls: string[] = [];
        h.mockImplementation((t) => {
            hasCalls.push(t.text);
            return has(t);
        });
        const r = split(line, offset, h);
        // console.log(hasCalls);
        expect(r.endOffset).toBe(r.text.offset + r.text.text.length);
        expect(r.words).toEqual(expect.arrayContaining(expectedWordSegments.map(expect.objectContaining)));
        expect(r.words).toHaveLength(expectedWordSegments.length);
        expect(h).toHaveBeenCalledTimes(calls);
    });
});

function has({ text }: TextOffset): boolean {
    const nfcText = text.normalize('NFC');
    return text.length < 3 || !regHasLetters.test(text) || words.has(nfcText) || words.has(nfcText.toLowerCase());
}

function applyWordBreaks(text: TextOffset, breaks: number[]): TextOffset[] {
    const a = text.offset;
    const t = text.text;
    const words: TextOffset[] = [];
    let i = 0;
    for (let p = 0; p < breaks.length; p += 2) {
        const start = breaks[p];
        const end = breaks[p + 1];
        if (i !== start) {
            words.push({
                text: t.slice(i, start),
                offset: a + i,
            });
        }
        i = end;
    }

    if (i < t.length) {
        words.push({
            text: t.slice(i),
            offset: a + i,
        });
    }

    return words;
}

function extractBreaks(pwb: SortedBreaks): number[] {
    const r: number[] = [];
    for (const b of pwb) {
        const br = b.breaks[0];
        if (br) {
            r.splice(r.length, 0, ...br);
        }
    }
    return r;
}

function genAllPossibleResults(text: string, breaks: SortedBreaks): string[] {
    function* genResults(i: number, bi: number): Iterable<string> {
        const br = breaks[bi];
        if (!br) {
            yield text.slice(i);
            return;
        }

        const emitted = new Set<string>();
        for (const b of br.breaks) {
            const parts: string[] = [];
            let p = i;
            for (let x = 0; x < b.length; x += 2) {
                const s = b[x];
                const e = b[x + 1];
                parts.push(text.slice(p, s));
                p = e;
            }
            const prefix = parts.join('|');
            const prefix2 = prefix + (prefix ? '|' : '');
            for (const r of genResults(p, bi + 1)) {
                const t = r ? prefix2 + r : prefix;
                if (!emitted.has(t)) {
                    emitted.add(t);
                    yield t;
                }
            }
        }
    }

    return [...genResults(0, 0)];
}

function findLine(doc: string, text: string): TextOffset {
    const index = doc.indexOf(text);
    let lastLine: RegExpMatchArray | undefined = undefined;
    for (const line of doc.matchAll(/.*/g)) {
        if ((line.index || 0) < index) {
            lastLine = line;
        }
    }
    if (lastLine && lastLine.index) {
        return {
            text: lastLine[0],
            offset: lastLine.index,
        };
    }
    return {
        text: '',
        offset: -1,
    };
}

function sampleWordSet() {
    const words = `
    _errorcode42
    2SD
    64-bit
    bit checksum
    camel case
    can't
    code42
    const
    cpp
    CVTPD2PS
    CVTTSD
    echo
    îphone
    êphone
    Geschäft
    error codes
    hello
    MOVSX_r_rm16
    one two
    static
    these are some sample words
    Tom's hardware
    well educated
    words separated by singleQuote
    256-sha
    dogs'
    leashes
    writers
    planets’
    `
        .split(/\s+/g)
        .map((a) => a.trim())
        .filter((a) => !!a);
    return new Set(words);
}

function sampleText() {
    return `
    static const char new_stub1_1[] = "\\techo"
    \\n'log' => 'text/plain'
	static const char new_stub2[] = "';\\nconst LEN = ";
    static const char new_stub3_0[] = ";\\n\\nstatic function go($return = false)\\n'cpp'"

    /* The escape was a back (or forward) reference. We keep the offset in
    order to give a more useful diagnostic for a bad forward reference. For
    references to groups numbered less than 10 we can't use more than two items
    in parsed_pattern because they may be just two characters in the input (and
    in a 64-bit world an offset may need two elements). So for them, the offset
    ERROR's
    REFACTOR'd
    of the first occurrent is held in a special vector. */

    256-sha

    - The dogs' leashes (multiple dogs).
    - The writers' desks (multiple writers).
    - The planets’ atmospheres (multiple planets).

    128-bit values

    î'cpp
    îphoneStatic

    geschäft

    êphoneStatic

`;
}

// cspell:ignore êphone îphone geschäft
