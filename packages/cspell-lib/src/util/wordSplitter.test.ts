import { TextOffset } from './text';
import { SortedBreaks, split, __testing__ } from './wordSplitter';

const generateWordBreaks = __testing__.generateWordBreaks;

const words = sampleWordSet();
const regHasLetters = /\p{L}/u;

describe('Validate wordSplitter', () => {
    interface TestApplyWordBreaks {
        text: string;
        expected: string[];
    }

    // cspell:ignore MOVSX
    test.each`
        text                | expected
        ${'hello'}          | ${['hello']}
        ${'well-educated'}  | ${['well', 'educated']}
        ${'ERRORCode'}      | ${['ERROR', 'Code']}
        ${'MOVSX_r_rm16'}   | ${['MOVSX', 'r', 'rm']}
        ${'32bit-checksum'} | ${['bit', 'checksum']}
        ${'camelCase'}      | ${['camel', 'Case']}
    `('Apply word breaks to $text', ({ text, expected }: TestApplyWordBreaks) => {
        const textOffset = {
            text,
            offset: 42,
        };
        const posBreaks = generateWordBreaks(text);

        const breaks = extractBreaks(posBreaks);
        const r = applyWordBreaks(textOffset, breaks);
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
    `('Apply word breaks to $text', ({ text, expected }: TestApplyWordBreaks) => {
        const posBreaks = generateWordBreaks(text);
        const r = genAllPossibleResults(text, posBreaks);
        expect(r[0]).toEqual(expected[0]); // Expect the first candidate to be the one with the shortest words.
        expect(r).toEqual(expect.arrayContaining(expected));
        expect(r).toEqual(expect.arrayContaining([text])); // this assumes the original text is a candidate
        expect(r).toMatchSnapshot(); // Use snapshots to ensure all possible options are generated.
    });

    interface PartialTextOffsetWithValid {
        text: string;
        offset?: number;
        isFound?: boolean;
    }

    interface TestSplit {
        text: string;
        expectedWords: PartialTextOffsetWithValid[];
    }

    function tov(p: PartialTextOffsetWithValid | string, isValid = true): PartialTextOffsetWithValid {
        if (typeof p === 'string') {
            p = { text: p };
        }
        const { isFound = isValid } = p;
        return { ...p, isFound };
    }

    function splitTov(t: string): PartialTextOffsetWithValid[] {
        const parts = t.split('|');
        return parts.map((p) => tov(p, has({ text: p, offset: 0 })));
    }

    // cspell:ignore CVTPD CVTSI CVTTSD words'separated'by errorcode
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
        ${"words'separated'by_singleQuote"} | ${splitTov('words|separated|by|singleQuote')}
        ${"Tom's_hardware"}                 | ${splitTov("Tom's|hardware")}
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
        ${'camelCase'}                      | ${splitTov('camel|Case')}                     | ${2}
        ${'hello'}                          | ${[tov({ text: 'hello', offset: 142 })]}      | ${1}
        ${''}                               | ${[]}                                         | ${0}
        ${'#@()&*'}                         | ${[]}                                         | ${0}
        ${'well-educated'}                  | ${[tov('well'), tov('educated')]}             | ${2}
        ${'MOVSX_r_rm16'}                   | ${splitTov('MOVSX_r_rm16')}                   | ${10}
        ${'32bit-checksum'}                 | ${splitTov('bit|checksum')}                   | ${2}
        ${'ERRORCodesTwo'}                  | ${splitTov('ERROR|Codes|Two')}                | ${4}
        ${'camelCase'}                      | ${splitTov('camel|Case')}                     | ${2}
        ${'CVTPD2PS_x_xm'}                  | ${splitTov('CVTPD2PS|x|xm')}                  | ${9}
        ${'CVTSI2SD_x_rm'}                  | ${splitTov('CVTSI|SD|x|rm')}                  | ${13}
        ${'errCVTTSD2SI_r_xm'}              | ${splitTov('err|CVTTSD|SI|r|xm')}             | ${15}
        ${"words'separated'by_singleQuote"} | ${splitTov('words|separated|by|singleQuote')} | ${6}
        ${"Tom's_hardware"}                 | ${splitTov("Tom's|hardware")}                 | ${7}
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
        const r = split(line, offset, h);
        // console.log(hasCalls);
        expect(r.offset).toBe(offset);
        expect(r.endOffset).toBe(r.text.offset + r.text.text.length);
        expect(r.words).toEqual(expect.arrayContaining(expectedWords.map(expect.objectContaining)));
        expect(r.words).toHaveLength(expectedWords.length);
        expect(h).toHaveBeenCalledTimes(calls);
    });
});

function sampleWordSet() {
    const words = `
    these are some sample words
    hello
    words separated by singleQuote
    Tom's hardware
    one two
    code42
    _errorcode42
    error codes
    well educated
    bit checksum
    camel case
    MOVSX_r_rm16
    CVTPD2PS
    CVTTSD
    2SD

    `
        .split(/\s+/g)
        .map((a) => a.trim())
        .filter((a) => !!a);
    return new Set(words);
}

function has({ text }: TextOffset): boolean {
    return text.length < 3 || !regHasLetters.test(text) || words.has(text) || words.has(text.toLowerCase());
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
