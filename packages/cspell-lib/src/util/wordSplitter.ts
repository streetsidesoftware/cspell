import { TextOffset, regExWordsAndDigits, regExSplitWords, regExSplitWords2, regExPossibleWordBreaks } from './text';
import { SortedQueue } from './SortedQueue';

const ignoreBreak: readonly number[] = Object.freeze([] as number[]);

export type IsValidWordFn = (word: TextOffset) => boolean;

export interface SplitResult {
    /** Original line passed to the split function */
    line: TextOffset;
    /** Starting point of processing - Original offset passed to the split function */
    offset: number;
    /** The span of text that was split */
    text: TextOffset;
    /** The collection of words that `text` was split into */
    words: TextOffsetWithValid[];
    /** the offset at which the split stopped */
    endOffset: number;
}

export interface TextOffsetWithValid extends TextOffset {
    valid: boolean;
}

export function split(line: TextOffset, offset: number, isValidWord: IsValidWordFn): SplitResult {
    const text = findNextWordText({ text: line.text, offset: offset - line.offset });
    text.offset = line.offset + text.offset;
    const textOffset = text.offset;

    if (!text.text) {
        return {
            line,
            offset,
            text,
            words: [],
            endOffset: textOffset,
        };
    }

    const possibleBreaks = generateWordBreaks(text.text);
    if (!possibleBreaks.length) {
        return {
            line,
            offset,
            text,
            words: [{ ...text, valid: isValidWord(text) }],
            endOffset: textOffset + text.text.length,
        };
    }

    function rebaseTextOffset<T extends TextOffset>(relText: T): T {
        return {
            ...relText,
            offset: relText.offset + textOffset,
        };
    }

    function has(word: TextOffset): boolean {
        return isValidWord(rebaseTextOffset(word));
    }

    possibleBreaks.push({
        offset: text.text.length,
        breaks: [ignoreBreak],
    });

    const result: SplitResult = {
        line,
        offset,
        text,
        words: splitIntoWords(text.text, possibleBreaks, has).map(rebaseTextOffset),
        endOffset: textOffset + text.text.length,
    };

    return result;
}

function findNextWordText({ text, offset }: TextOffset): TextOffset {
    const reg = new RegExp(regExWordsAndDigits);
    reg.lastIndex = offset;
    const m = reg.exec(text);
    if (!m) {
        return {
            text: '',
            offset: offset + text.length,
        };
    }

    return {
        text: m[0],
        offset: m.index,
    };
}

function extractBreaks(pwb: PossibleWordBreak[]): number[] {
    const r: number[] = [];
    for (const b of pwb) {
        const br = b.breaks[0];
        if (br) {
            r.splice(r.length, 0, ...br);
        }
    }
    return r;
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

type BreakPairs = readonly number[];

interface PossibleWordBreak {
    /** offset from the start of the string */
    offset: number;
    /**
     * break pairs (start, end)
     * (the characters between the start and end are removed)
     * With a pure break, start === end.
     */
    breaks: BreakPairs[];
}

export type SortedBreaks = PossibleWordBreak[];

function generateWordBreaks(text: string): SortedBreaks {
    const camelBreaks = genWordBreakCamel(text);
    const symbolBreaks = genSymbolBreaks(text);
    return [...mergeSortedBreakMap(camelBreaks, symbolBreaks).values()];
}

function genWordBreakCamel(text: string): SortedBreaks {
    const breaksCamel1: SortedBreaks = [];

    // lower,Upper: camelCase -> camel|Case
    for (const m of text.matchAll(regExSplitWords)) {
        if (m.index === undefined) continue;
        const code = text.charCodeAt(m.index);
        const i = m.index + (code < 0xd800 || code > 0xdfff ? 1 : 2);
        breaksCamel1.push({
            offset: m.index,
            breaks: [[i, i], ignoreBreak],
        });
    }

    const breaksCamel2: SortedBreaks = [];

    // cspell:ignore ERRORC
    // Upper,Upper,lower: ERRORCodes -> ERROR|Codes, ERRORC|odes
    for (const m of text.matchAll(regExSplitWords2)) {
        if (m.index === undefined) continue;
        const code = text.charCodeAt(m.index);
        const i = m.index + (code < 0xd800 || code > 0xdfff ? 1 : 2);
        const code2 = text.charCodeAt(i);
        const j = i + (code2 < 0xd800 || code2 > 0xdfff ? 1 : 2);
        breaksCamel2.push({
            offset: m.index,
            breaks: [[i, i], [j, j], ignoreBreak],
        });
    }

    return mergeSortedBreakMap(breaksCamel1, breaksCamel2);
}

function genSymbolBreaks(text: string): SortedBreaks {
    function calcBreaks(m: RegExpMatchArray): PossibleWordBreak | undefined {
        const i = m.index;
        if (i === undefined) return;
        const j = i + m[0].length;

        return {
            offset: i,
            breaks: [
                [i, j], // Remove the characters
                [i, i], // keep characters with word to right
                [j, j], // keep characters with word to left
                ignoreBreak,
            ],
        };
    }

    function calcBreaksForRegEx(reg: RegExp): SortedBreaks {
        const sb: SortedBreaks = [];
        for (const m of text.matchAll(reg)) {
            const b = calcBreaks(m);
            if (b) {
                sb.push(b);
            }
        }
        return sb;
    }

    return mergeSortedBreakMap(calcBreaksForRegEx(regExPossibleWordBreaks), calcBreaksForRegEx(/\d+/g));
}

function mergeSortedBreakMap(...maps: SortedBreaks[]): SortedBreaks {
    if (maps.length !== 2) {
        if (maps.length === 1) return maps[0];
        if (!maps.length) return [];
        const m = Math.floor(maps.length / 2);
        return mergeSortedBreakMap(mergeSortedBreakMap(...maps.slice(0, m)), mergeSortedBreakMap(...maps.slice(m)));
    }

    const result: SortedBreaks = [];

    const mapA = maps[0];
    const mapB = maps[1];
    const iA = mapA.values();
    const iB = mapB.values();
    let vA = iA.next();
    let vB = iB.next();

    while (!vA.done && !vB.done) {
        if (vA.value.offset < vB.value.offset) {
            result.push(vA.value);
            vA = iA.next();
        } else if (vA.value.offset > vB.value.offset) {
            result.push(vB.value);
            vB = iB.next();
        } else {
            result.push({
                offset: vA.value.offset,
                breaks: vA.value.breaks.concat(vB.value.breaks),
            });
            vA = iA.next();
            vB = iB.next();
        }
    }
    while (!vA.done) {
        result.push(vA.value);
        vA = iA.next();
    }
    while (!vB.done) {
        result.push(vB.value);
        vB = iB.next();
    }

    return result;
}

interface Candidate {
    /** parent candidate in the chain */
    p: Candidate | undefined;
    /** offset in text */
    i: number;
    /** index within Possible Breaks */
    bi: number;
    /** current break pair */
    bp: BreakPairs;
    /** cost */
    c: number;
    /** expected cost */
    ec: number;
    /** max cost */
    mc: number;
    /** the extracted text */
    text: TextOffsetWithValid | undefined;
}

interface CandidateWithText extends Candidate {
    text: TextOffsetWithValid;
}

function splitIntoWords(text: string, breaks: SortedBreaks, has: (word: TextOffset) => boolean): TextOffsetWithValid[] {
    function makeCandidates(p: Candidate | undefined, i: number, bi: number, currentCost: number): Candidate[] {
        const len = text.length;
        while (bi < breaks.length && breaks[bi].offset < i) {
            bi += 1;
        }
        if (bi >= breaks.length) {
            return [];
        }
        const br = breaks[bi];
        function c(bp: BreakPairs): Candidate {
            const d = bp.length < 2 ? len - i : bp[0] - i + len - bp[1];
            const mc = currentCost + d;
            const ec = currentCost + d / 2;
            return {
                p,
                i,
                bi,
                bp,
                c: currentCost,
                ec,
                mc,
                text: undefined,
            };
        }
        return br.breaks.map(c);
    }

    function toTextOffset(text: string, offset: number): TextOffsetWithValid {
        const valid = has({ text, offset });
        return {
            text,
            offset,
            valid,
        };
    }

    function compare(a: Candidate, b: Candidate): number {
        return a.ec - b.ec || a.mc - b.mc;
    }

    const results: TextOffsetWithValid[] = [];
    let bestPath: CandidateWithText | undefined = undefined;
    let maxCost = text.length;
    const candidates = new SortedQueue<Candidate>(compare);
    candidates.concat(makeCandidates(undefined, 0, 0, 0));

    while (candidates.length) {
        /** Best Candidate Index */
        const best = candidates.dequeue();
        if (!best || best.c >= maxCost) {
            break;
        }
        // Does it have a split?
        if (best.bp.length) {
            // yes
            const i = best.bp[0];
            const j = best.bp[1];
            const t = toTextOffset(text.slice(best.i, i), best.i);
            const cost = has(t) ? 0 : t.text.length;
            const mc = text.length - j;
            best.c += cost;
            best.ec = best.c + mc / 2;
            best.mc = best.c + mc;
            best.text = t;
            if (best.c < maxCost) {
                const c = makeCandidates(best, j, best.bi + 1, best.c);
                candidates.concat(c);
            }
        } else {
            // It is a pass through
            const c = makeCandidates(best.p, best.i, best.bi + 1, best.c);
            candidates.concat(c);
            if (!c.length) {
                const t = toTextOffset(text.slice(best.i), best.i);
                const cost = has(t) ? 0 : t.text.length;
                best.c += cost;
                best.ec = best.c;
                best.mc = best.c;
                best.text = t;
                if (!bestPath || bestPath.c > best.c) {
                    bestPath = { ...best, text: t };
                    maxCost = best.c;
                }
            }
        }
    }

    for (let p: Candidate | undefined = bestPath; p; p = p.p) {
        if (p.text) {
            results.push(p.text);
        }
    }

    return results.reverse();
}

export const __testing__ = {
    applyWordBreaks,
    generateWordBreaks,
    extractBreaks,
};
