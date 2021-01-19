import { TextOffset } from './text';
import {
    regExWordsAndDigits,
    regExSplitWords,
    regExSplitWords2,
    regExPossibleWordBreaks,
    regExEscapeCharacters,
    regExDanglingQuote,
    regExTrailingEndings,
} from './textRegex';
import { SortedQueue } from './SortedQueue';
import { escapeRegEx } from './regexHelper';

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

export interface LineSegment {
    line: TextOffset;
    relStart: number;
    relEnd: number;
}

export interface TextOffsetWithValid extends TextOffset {
    isFound: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SplitOptions extends WordBreakOptions {}

export function split(
    line: TextOffset,
    offset: number,
    isValidWord: IsValidWordFn,
    options: SplitOptions = {}
): SplitResult {
    const relWordToSplit = findNextWordText({ text: line.text, offset: offset - line.offset });
    const lineOffset = line.offset;
    const requested = new Map<number, Map<string, boolean>>();

    if (!relWordToSplit.text) {
        const text = rebaseTextOffset(relWordToSplit);
        return {
            line,
            offset,
            text: text,
            words: [],
            endOffset: text.offset + text.text.length,
        };
    }

    const lineSegment: LineSegment = {
        line,
        relStart: relWordToSplit.offset,
        relEnd: relWordToSplit.offset + relWordToSplit.text.length,
    };

    const possibleBreaks = generateWordBreaks(lineSegment, options);
    if (!possibleBreaks.length) {
        const text = rebaseTextOffset(relWordToSplit);
        return {
            line,
            offset,
            text: text,
            words: [{ ...text, isFound: isValidWord(text) }],
            endOffset: text.offset + text.text.length,
        };
    }

    function rebaseTextOffset<T extends TextOffset>(relText: T): T {
        return {
            ...relText,
            offset: relText.offset + lineOffset,
        };
    }

    function has(word: TextOffset): boolean {
        let a = requested.get(word.offset);
        const b = a?.get(word.text);
        if (b !== undefined) return b;
        if (!a) {
            a = new Map<string, boolean>();
            requested.set(word.offset, a);
        }
        const r = isValidWord(rebaseTextOffset(word));
        a.set(word.text, r);
        return r;
    }

    // Add a dummy break at the end to avoid needing to check for last break.
    possibleBreaks.push({
        offset: lineSegment.relEnd,
        breaks: [ignoreBreak],
    });

    const result: SplitResult = {
        line,
        offset,
        text: rebaseTextOffset(relWordToSplit),
        words: splitIntoWords(lineSegment, possibleBreaks, has).map(rebaseTextOffset),
        endOffset: lineOffset + lineSegment.relEnd,
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

interface WordBreakOptions {
    optionalWordBreakCharacters?: string;
}

function generateWordBreaks(line: LineSegment, options: WordBreakOptions): SortedBreaks {
    const camelBreaks = genWordBreakCamel(line);
    const symbolBreaks = genSymbolBreaks(line);
    const optionalBreaks = genOptionalWordBreaks(line, options.optionalWordBreakCharacters);
    return mergeSortedBreaks(...camelBreaks, ...symbolBreaks, ...optionalBreaks);
}

function offsetRegEx(reg: RegExp, offset: number) {
    const r = new RegExp(reg);
    r.lastIndex = offset;
    return r;
}

function genWordBreakCamel(line: LineSegment): SortedBreaks[] {
    const breaksCamel1: SortedBreaks = [];
    const text = line.line.text.slice(0, line.relEnd);

    // lower,Upper: camelCase -> camel|Case
    for (const m of text.matchAll(offsetRegEx(regExSplitWords, line.relStart))) {
        if (m.index === undefined) break;
        const i = m.index + 1;
        breaksCamel1.push({
            offset: m.index,
            breaks: [[i, i], ignoreBreak],
        });
    }

    const breaksCamel2: SortedBreaks = [];

    // cspell:ignore ERRORC
    // Upper,Upper,lower: ERRORCodes -> ERROR|Codes, ERRORC|odes
    for (const m of text.matchAll(offsetRegEx(regExSplitWords2, line.relStart))) {
        if (m.index === undefined) break;
        const i = m.index + m[1].length;
        const j = i + 1;
        breaksCamel2.push({
            offset: m.index,
            breaks: [[i, i], [j, j], ignoreBreak],
        });
    }

    return [breaksCamel1, breaksCamel2];
}

function calcBreaksForRegEx(
    line: LineSegment,
    reg: RegExp,
    calcBreak: (m: RegExpMatchArray) => PossibleWordBreak | undefined
): SortedBreaks {
    const sb: SortedBreaks = [];
    const text = line.line.text.slice(0, line.relEnd);
    for (const m of text.matchAll(offsetRegEx(reg, line.relStart))) {
        const b = calcBreak(m);
        if (b) {
            sb.push(b);
        }
    }
    return sb;
}

function genOptionalWordBreaks(line: LineSegment, optionalBreakCharacters: string | undefined): SortedBreaks[] {
    function calcBreaks(m: RegExpMatchArray): PossibleWordBreak | undefined {
        const i = m.index;
        if (i === undefined) return;
        const j = i + m[0].length;

        return {
            offset: i,
            breaks: [
                [i, j], // Remove the characters
                ignoreBreak,
            ],
        };
    }

    const breaks: SortedBreaks[] = [
        calcBreaksForRegEx(line, regExDanglingQuote, calcBreaks),
        calcBreaksForRegEx(line, regExTrailingEndings, calcBreaks),
    ];

    if (optionalBreakCharacters) {
        const regex = new RegExp(`[${escapeRegEx(optionalBreakCharacters)}]`, 'gu');
        breaks.push(calcBreaksForRegEx(line, regex, calcBreaks));
    }

    return breaks;
}

function genSymbolBreaks(line: LineSegment): SortedBreaks[] {
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

    return [
        calcBreaksForRegEx(line, regExPossibleWordBreaks, calcBreaks),
        calcBreaksForRegEx(line, /\d+/g, calcBreaks),
        calcBreaksForRegEx(line, regExEscapeCharacters, calcBreaks),
    ];
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
    /** the extracted text */
    text: TextOffsetWithValid | undefined;
}

interface CandidateWithText extends Candidate {
    text: TextOffsetWithValid;
}

function splitIntoWords(
    lineSeg: LineSegment,
    breaks: SortedBreaks,
    has: (word: TextOffset) => boolean
): TextOffsetWithValid[] {
    const maxIndex = lineSeg.relEnd;

    /**
     * Create a set of possible candidate to consider
     * @param p - prev candidate that lead to this one
     * @param i - offset within the string
     * @param bi - current index into the set of breaks
     * @param currentCost - current cost accrued
     */
    function makeCandidates(p: Candidate | undefined, i: number, bi: number, currentCost: number): Candidate[] {
        const len = maxIndex;
        while (bi < breaks.length && breaks[bi].offset < i) {
            bi += 1;
        }
        if (bi >= breaks.length) {
            return [];
        }
        const br = breaks[bi];
        function c(bp: BreakPairs): Candidate {
            const d = bp.length < 2 ? len - i : (bp[0] - i) * 0.5 + len - bp[1];
            const ec = currentCost + d;
            return {
                p,
                i,
                bi,
                bp,
                c: currentCost,
                ec,
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
            isFound: valid,
        };
    }

    function compare(a: Candidate, b: Candidate): number {
        return a.ec - b.ec || b.i - a.i;
    }

    const results: TextOffsetWithValid[] = [];
    let bestPath: CandidateWithText | undefined = undefined;
    let maxCost = lineSeg.relEnd - lineSeg.relStart;
    const candidates = new SortedQueue<Candidate>(compare);
    const text = lineSeg.line.text;
    candidates.concat(makeCandidates(undefined, lineSeg.relStart, 0, 0));

    while (candidates.length) {
        /** Best Candidate Index */
        const best = candidates.dequeue();
        if (!best || best.c >= maxCost) {
            continue;
        }
        // Does it have a split?
        if (best.bp.length) {
            // yes
            const i = best.bp[0];
            const j = best.bp[1];
            const t = i > best.i ? toTextOffset(text.slice(best.i, i), best.i) : undefined;
            const cost = !t || t.isFound ? 0 : t.text.length;
            const mc = maxIndex - j;
            best.c += cost;
            best.ec = best.c + mc;
            best.text = t;
            if (best.c < maxCost) {
                const c = makeCandidates(t ? best : best.p, j, best.bi + 1, best.c);
                candidates.concat(c);
            }
        } else {
            // It is a pass through
            const c = makeCandidates(best.p, best.i, best.bi + 1, best.c);
            candidates.concat(c);
            if (!c.length) {
                const t = maxIndex > best.i ? toTextOffset(text.slice(best.i, maxIndex), best.i) : undefined;
                const cost = !t || t.isFound ? 0 : t.text.length;
                best.c += cost;
                best.ec = best.c;
                best.text = t;
                if (!bestPath || bestPath.c > best.c) {
                    const segText = t || best.p?.text || toTextOffset('', best.i);
                    if (t) {
                        bestPath = { ...best, text: segText };
                    } else {
                        bestPath = { ...best, ...best.p, text: segText };
                    }
                    maxCost = best.c;
                    if (!maxCost) {
                        break;
                    }
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

function mergeSortedBreaks(...maps: SortedBreaks[]): SortedBreaks {
    return ([] as SortedBreaks).concat(...maps).sort((a, b) => a.offset - b.offset);
}

export const __testing__ = {
    generateWordBreaks,
};
