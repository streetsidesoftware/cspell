import type { TextOffset } from '@cspell/cspell-types';

import { PairingHeap } from '../PairingHeap.js';
import { regExNumericLiteral, regExWordsAndDigits } from '../textRegex.js';
import type { BreakPairs, LineSegment, SortedBreaks, WordBreakOptions } from './generateWordBreaks.js';
import { generateWordBreaks } from './generateWordBreaks.js';

const ignoreBreak: BreakPairs = Object.freeze([]) as unknown as BreakPairs;

export const softHyphen = '\u00AD';

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

export interface TextOffsetWithOptionalValid extends TextOffset {
    length: number;
    isFound?: boolean;
}

export interface TextOffsetWithValid extends TextOffsetWithOptionalValid {
    isFound: boolean;
}

export interface SplitOptions extends WordBreakOptions {}

/**
 *
 * @param line - the line of text
 * @param offset - absolute offset, comparable to line.offset.
 * @param isValidWord - predicate function to test if a word is valid.
 * @param options - SplitOptions
 * @returns SplitResult
 */
export function split(
    line: TextOffset,
    offset: number,
    isValidWord: IsValidWordFn,
    options: SplitOptions = {},
): SplitResult {
    const relWordToSplit = findNextWordText({ text: line.text, offset: offset - line.offset });
    const hasSoftHyphen = relWordToSplit.text.includes(softHyphen);
    const lineOffset = line.offset;
    const requested = new Map<number, TextOffsetWithValid>();

    const regExpIgnoreSegment = /^[-.+\d_eE'`\\\s\u00AD]+$/;
    let count = 0;

    if (!relWordToSplit.text) {
        const text = rebaseTextOffsetToAbsolute(relWordToSplit);
        return {
            line,
            offset,
            text: text,
            words: [],
            endOffset: text.offset + (text.length ?? text.text.length),
        };
    }

    const lineSegment: LineSegment = {
        line,
        relStart: relWordToSplit.offset,
        relEnd: relWordToSplit.offset + relWordToSplit.text.length,
    };

    const possibleBreaks = generateWordBreaks(lineSegment, options);
    if (!possibleBreaks.length) {
        const text = rebaseTextOffsetToAbsolute(relWordToSplit);
        return {
            line,
            offset,
            text: text,
            words: [{ ...text, length: text.length || text.text.length, isFound: isValidWord(text) }],
            endOffset: text.offset + (text.length ?? text.text.length),
        };
    }

    function rebaseTextOffsetToAbsolute<T extends TextOffset>(relText: T): T {
        relText.offset += lineOffset;
        return relText;
    }

    function rebaseTextOffsetToRelative<T extends TextOffset>(relText: T): T {
        relText.offset -= lineOffset;
        return relText;
    }

    function createTextOffsetWithValid(start: number, end: number, isFound: boolean): TextOffsetWithValid {
        const word: TextOffsetWithValid = {
            offset: start,
            length: end - start,
            text: line.text.slice(start, end),
            isFound,
        };
        return word;
    }

    function checkTextRange(start: number, end: number): TextOffsetWithValid {
        const i = start;
        const j = end - start;
        let v = i + (j << 20);
        if (i < 1 << 20 && j < 1 << 11) {
            const b = requested.get(v);
            if (b !== undefined) return b;
        } else {
            v = -1;
        }
        const validated = createTextOffsetWithValid(start, end, false);
        if (regExpIgnoreSegment.test(validated.text)) {
            validated.isFound = true;
            if (v >= 0) {
                requested.set(v, validated);
            }
            return validated;
        }

        rebaseTextOffsetToAbsolute(validated);

        validated.isFound = isValidWord(validated);
        count++;
        console.log('Validation count: %d', count);
        console.log('Validated word: %o', validated);

        if (hasSoftHyphen && !validated.isFound && validated.text.includes(softHyphen)) {
            removeSoftHyphen(validated);
            validated.isFound = isValidWord(validated);
            console.log('Validated word2: %o', validated);
        }

        rebaseTextOffsetToRelative(validated);
        if (v >= 0) {
            requested.set(v, validated);
        }

        return validated;
    }

    // Add a dummy break at the end to avoid needing to check for last break.
    possibleBreaks.push({
        offset: lineSegment.relEnd,
        breaks: [ignoreBreak],
    });

    const result: SplitResult = {
        line,
        offset,
        text: rebaseTextOffsetToAbsolute(relWordToSplit),
        words: splitIntoWords(lineSegment, possibleBreaks, checkTextRange).map(rebaseTextOffsetToAbsolute),
        endOffset: lineOffset + lineSegment.relEnd,
    };

    return result;
}

function removeSoftHyphen(word: TextOffsetWithValid): TextOffsetWithValid {
    word.text = word.text.replaceAll(softHyphen, '');
    return word;
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

    // Skip numeric literals.
    if (regExNumericLiteral.test(m[0])) {
        return findNextWordText({ text, offset: offset + m[0].length });
    }

    return {
        text: m[0],
        offset: m.index,
    };
}

interface PathNode {
    /** Next Path Node or undefined if at the end */
    n: PathNode | undefined;
    /** offset in text */
    i: number;
    /** cost to the end of the path */
    c: number;
    /** the extracted text */
    text: TextOffsetWithValid | undefined;
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

function splitIntoWords(
    lineSeg: LineSegment,
    breaks: SortedBreaks,
    checkTextRange: (start: number, end: number) => TextOffsetWithValid,
): TextOffsetWithValid[] {
    const maxIndex = lineSeg.relEnd;
    const maxAttempts = 5000;

    const knownPathsByIndex = new Map<number, PathNode>();

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

    function compare(a: Candidate, b: Candidate): number {
        return a.ec - b.ec || b.i - a.i;
    }

    function pathToWords(node: PathNode | undefined): TextOffsetWithValid[] {
        const results: TextOffsetWithValid[] = [];

        for (let p = node; p; p = p.n) {
            if (p.text) {
                results.push(p.text);
            }
        }

        return results;
    }

    function addToKnownPaths(candidate: Candidate, path: PathNode | undefined) {
        for (let can: Candidate | undefined = candidate; can !== undefined; can = can.p) {
            const t = can.text;
            const i = can.i;
            const cost = (!t || t.isFound ? 0 : t.length) + (path?.c ?? 0);
            const exitingPath = knownPathsByIndex.get(i);
            // If a better-or-equal path is already known, reuse it and keep propagating
            // the (possibly cheaper) prefix back toward the start instead of abandoning it.
            if (exitingPath && exitingPath.c <= cost) {
                path = exitingPath;
                continue;
            }

            const node: PathNode = { n: path, i, c: cost, text: t };
            knownPathsByIndex.set(i, node);
            path = node;
        }
        return path;
    }

    let maxCost = lineSeg.relEnd - lineSeg.relStart;
    const candidates = new PairingHeap<Candidate>(compare);
    candidates.append(makeCandidates(undefined, lineSeg.relStart, 0, 0));
    let attempts = 0;
    let bestPath: PathNode | undefined;

    while (maxCost && candidates.length && attempts++ < maxAttempts) {
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
            const t = i > best.i ? checkTextRange(best.i, i) : undefined;
            const cost = !t || t.isFound ? 0 : t.length;
            const mc = maxIndex - j;
            best.c += cost;
            best.ec = best.c + mc;
            best.text = t;
            const possiblePath = knownPathsByIndex.get(j);
            if (possiblePath) {
                // We found a known apply to candidate
                const f = addToKnownPaths(best, possiblePath);
                bestPath = !bestPath || (f && f.c < bestPath.c) ? f : bestPath;
            } else if (best.c < maxCost) {
                const c = makeCandidates(t ? best : best.p, j, best.bi + 1, best.c);
                candidates.append(c);
            }
        } else {
            // It is a pass through
            const c = makeCandidates(best.p, best.i, best.bi + 1, best.c);
            candidates.append(c);
            if (!c.length) {
                const t = maxIndex > best.i ? checkTextRange(best.i, maxIndex) : undefined;
                const cost = !t || t.isFound ? 0 : t.length;
                best.c += cost;
                best.ec = best.c;
                best.text = t;
                const segText = t || best.p?.text || checkTextRange(best.i, best.i);
                const can = t ? { ...best, text: segText } : { ...best, ...best.p, text: segText };
                const f = addToKnownPaths(can, undefined);
                bestPath = !bestPath || (f && f.c < bestPath.c) ? f : bestPath;
            }
        }
        if (bestPath && bestPath.c < maxCost) {
            console.log('New best path with cost:', bestPath.c);
            maxCost = bestPath.c;
        }
    }

    return pathToWords(bestPath);
}

export const __testing__: {
    findNextWordText: typeof findNextWordText;
} = {
    findNextWordText,
};
