import type { TextOffset } from '@cspell/cspell-types';

import { PairingHeap } from '../PairingHeap.js';
import { regExNumericLiteral, regExWordsAndDigits } from '../textRegex.js';
import type { BreakPairs, LineSegment, SortedBreaks, WordBreakOptions } from './generateWordBreaks.js';
import { generateWordBreaks, softHyphen } from './generateWordBreaks.js';

const ignoreBreak: BreakPairs = Object.freeze([]) as unknown as BreakPairs;

const maxSkippedBreaks = 4;

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

        if (hasSoftHyphen && !validated.isFound && validated.text.includes(softHyphen)) {
            removeSoftHyphen(validated);
            validated.isFound = isValidWord(validated);
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
    /** end offset in text */
    j: number;
    /** cost to the end of the path */
    c: number;
    /** cost of the current node */
    nc: number;
    /** the extracted text */
    text: TextOffsetWithValid | undefined;
}

interface Candidate {
    /** parent candidate in the chain */
    p: Candidate | undefined;
    /** start offset in text */
    i: number;
    /** end offset in text */
    j: number;
    /** index within Possible Breaks */
    bi: number;
    /** starting index within Possible Breaks */
    bs: number;
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
    const maxAttempts = 1000;

    const knownPathsByIndex = new Map<number, PathNode>();
    knownPathsByIndex.set(maxIndex, { n: undefined, i: maxIndex, j: maxIndex, c: 0, nc: 0, text: undefined });

    function findNearestBreakIndex(offset: number, bi: number): number | undefined {
        while (bi < breaks.length && breaks[bi].offset < offset) {
            bi += 1;
        }
        return bi < breaks.length ? bi : undefined;
    }

    /**
     * Create a set of possible candidate to consider
     * @param p - prev candidate that lead to this one
     * @param i - offset within the string
     * @param bi - current index into the set of breaks
     * @param currentCost - current cost accrued
     */
    function makeCandidates(
        p: Candidate | undefined,
        i: number,
        bi: number,
        bs: number,
        currentCost: number,
    ): Candidate[] {
        const len = maxIndex;
        const nBi = findNearestBreakIndex(i, bi);
        const nBs = findNearestBreakIndex(i, bs);
        if (nBi === undefined || nBs === undefined) {
            return [];
        }
        bi = nBi;
        bs = nBs;
        if (bi - bs > maxSkippedBreaks) {
            return [];
        }

        const br = breaks[bi];
        function c(bp: BreakPairs): Candidate {
            const j = bp[1] ?? len;
            const cost = (bp.length > 2 ? knownPathsByIndex.get(j)?.c : undefined) ?? len - j;
            const d = bp.length < 2 ? len - i : (bp[0] - i) * 0.5 + cost;
            const ec = currentCost + d;
            return {
                p,
                i,
                j,
                bi,
                bs,
                bp,
                c: currentCost,
                ec,
                text: undefined,
            };
        }
        return br.breaks.map(c);
    }

    function compare(a: Candidate, b: Candidate): number {
        return a.bi - a.bs - (b.bi - b.bs) || a.ec - b.ec || b.i - a.i || a.j - b.j;
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

    function addToKnownPaths(candidate: Candidate) {
        let path = knownPathsByIndex.get(candidate.j);

        for (let can: Candidate | undefined = candidate; can !== undefined; can = can.p) {
            const t = can.text;
            const i = can.i;
            const j = can.j;
            const currentNode = knownPathsByIndex.get(i);
            const exitingPath = knownPathsByIndex.get(j);
            // If a better-or-equal path is already known, reuse it and keep propagating
            // the (possibly cheaper) suffix back toward the start instead of abandoning it.
            if (exitingPath && path && exitingPath.c <= path.c) {
                path = exitingPath;
            }

            const nc = !t || t.isFound ? 0 : t.length;
            const cost = nc + (path?.c || 0);
            const node: PathNode = { n: path, i, j, c: cost, nc, text: t };
            if (!currentNode || currentNode.c > cost) {
                knownPathsByIndex.set(i, node);
            }
            path = node;
        }
        return path;
    }

    let maxCost = lineSeg.relEnd - lineSeg.relStart;
    const candidates = new PairingHeap<Candidate>(compare);
    candidates.append(makeCandidates(undefined, lineSeg.relStart, 0, 0, 0));
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
            const parentPath = knownPathsByIndex.get(j);
            const parentCost = parentPath?.c || 0;

            if (parentCost + best.c >= maxCost) {
                continue;
            }

            const t = i > best.i ? checkTextRange(best.i, i) : undefined;
            const cost = !t || t.isFound ? 0 : t.length;
            const mc = maxIndex - j;
            best.c += cost;
            best.ec = best.c + mc;
            best.text = t;
            if (best.c >= maxCost) {
                continue;
            }
            if (parentPath) {
                // We found a known apply to candidate
                const f = addToKnownPaths(best);
                bestPath = !bestPath || (f && f.c < bestPath.c) ? f : bestPath;
            }
            const c = makeCandidates(t ? best : best.p, j, best.bi + 1, best.bs, best.c);
            candidates.append(c);
        } else {
            // It is a pass through
            const c = makeCandidates(best.p, best.i, best.bi + 1, best.bs, best.c);
            candidates.append(c);
            if (!c.length) {
                const j = maxIndex;
                const t = j > best.i ? checkTextRange(best.i, j) : undefined;
                const cost = !t || t.isFound ? 0 : t.length;
                best.c += cost;
                best.ec = best.c;
                best.text = t;
                if (best.c >= maxCost) {
                    continue;
                }
                const segText = t || best.p?.text || checkTextRange(best.i, best.i);
                const can: Candidate = t ? { ...best, text: segText } : { ...best, ...best.p, text: segText };
                can.j = j;
                const f = addToKnownPaths(can);
                bestPath = !bestPath || (f && f.c < bestPath.c) ? f : bestPath;
            }
        }
        if (bestPath && bestPath.c < maxCost) {
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
