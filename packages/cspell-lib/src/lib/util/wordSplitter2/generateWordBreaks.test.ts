import type { TextOffset } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import type { SortedBreaks } from './generateWordBreaks.js';
import { generateWordBreaks, ignoreBreak } from './generateWordBreaks.js';

describe('Validate wordSplitter', () => {
    interface TestApplyWordBreaks {
        text: string;
        expected: string[];
    }

    // cspell:ignore MOVSX UI
    test.each`
        text                | expected
        ${'hello'}          | ${['hello']}
        ${'hello'}          | ${['hello']}
        ${'well-educated'}  | ${['well', 'educated']}
        ${'ERRORCode'}      | ${['ERROR', 'Code']}
        ${'MOVSX_r_rm16'}   | ${['MOVSX', 'r', 'rm']}
        ${'32bit-checksum'} | ${['bit', 'checksum']}
        ${'camelCase'}      | ${['camel', 'Case']}
        ${'markUIAsReady'}  | ${['mark', 'UI', 'As', '', 'Ready']}
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
        ${'markUIAsReady'}  | ${['mark|UI|As|Ready']}
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
});

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
        if (br && br !== ignoreBreak) {
            r.push(...br);
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
            for (let x = 0; b !== ignoreBreak && x < b.length; x += 2) {
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
