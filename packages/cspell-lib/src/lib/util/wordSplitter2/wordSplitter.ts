import type { TextOffset } from '@cspell/cspell-types';

import { PairingHeap } from '../PairingHeap.js';
import { regExFirstUpper, regExNumericLiteral, regExWordsAndDigits } from '../textRegex.js';
import type { BreakPairs, LineSegment, SortedBreaks, WordBreakOptions } from './generateWordBreaks.js';
import { generateWordBreaks, ignoreBreak, softHyphen } from './generateWordBreaks.js';

const maxSkippedBreaks = 16; // Maximum number of breaks that can be skipped during word splitting.
const maxAttempts = 64_000; // Maximum number of attempts to split words.

// Quote/backtick characters that `regExWordsAndDigits` treats as word characters, so a quoted
// or templated string literal in source code gets scanned with its delimiters attached.
const regExLeadingTrimCharacters = /^['’`\\-]+/;
const regExTrailingTrimCharacters = /['’`\\-]+$/;

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

    function calcKey(start: number, end: number): number {
        const i = start;
        const j = end - start;
        const v = i + (j << 20);
        return i < 1 << 20 && j < 1 << 11 ? v : -1;
    }

    function checkTextRange(start: number, end: number): TextOffsetWithValid {
        const v = calcKey(start, end);
        const f = v >= 0 ? requested.get(v) : undefined;
        if (f) return f;
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
        // No more words found, return an empty text with offset at the end of the string within the document.
        return { text: '', offset: offset + text.length };
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

    /**
     * Map of known paths by their starting index in the text.
     * This helps in quickly finding previously computed paths to avoid redundant calculations.
     */
    const knownPathsByIndex = new Map<number, PathNode>();
    const terminalNode: PathNode = { n: undefined, i: maxIndex, j: maxIndex, c: 0, nc: 0, text: undefined };
    knownPathsByIndex.set(maxIndex, terminalNode);

    // Seed the search with the whole word treated as a single candidate. This guarantees a
    // correct fallback result (e.g. a whole word matched via ignoreWords/the dictionary, or
    // reporting the word as a single misspelling) even when the segmented search below never
    // finds a strictly cheaper split.
    let wholeWord = checkTextRange(lineSeg.relStart, maxIndex);
    if (!wholeWord.isFound) {
        // `regExWordsAndDigits` treats quote/backtick characters as word characters so that
        // things like `Tom's` or `n'cpp` are scanned as a single word; but it also means a
        // quoted/templated string literal in source code (e.g. `'ignoredWord'`) is scanned
        // including its delimiters. Retry against the span with that framing peeled off so a
        // whole word that is otherwise valid/ignored is still recognized as such.
        const raw = lineSeg.line.text.slice(lineSeg.relStart, maxIndex);
        const lead = raw.match(regExLeadingTrimCharacters)?.[0].length ?? 0;
        const tail = raw.slice(lead).match(regExTrailingTrimCharacters)?.[0].length ?? 0;
        if ((lead || tail) && lead + tail < raw.length) {
            wholeWord = checkTextRange(lineSeg.relStart + lead, maxIndex - tail);
        }
    }

    const wholeWordCost = wholeWord.isFound ? 0 : wholeWord.text.length;
    const wholeWordNode: PathNode = {
        n: terminalNode,
        i: lineSeg.relStart,
        j: maxIndex,
        c: wholeWordCost,
        nc: wholeWordCost,
        text: wholeWord,
    };
    knownPathsByIndex.set(lineSeg.relStart, wholeWordNode);

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
        function calcBreakCost(bp: BreakPairs): Candidate {
            if (bp === ignoreBreak) {
                // We are skipping this break pair.
                return { p, i, j: len, bi, bs, bp, c: currentCost, ec: currentCost + len - i, text: undefined };
            }
            const startOfBreak = bp[0];
            const endOfBreak = bp[1];
            // cost from the end of the segment to the end of the text
            // const costToEnd = knownPathsByIndex.get(endOfBreak)?.c ?? len - endOfBreak;
            const costToEnd = len - endOfBreak;
            // Guess the cost of the word.
            const costOfWord = (startOfBreak - i) * 0.5;
            const d = costOfWord + costToEnd;
            const ec = currentCost + d;
            return { p, i, j: endOfBreak, bi, bs, bp, c: currentCost, ec, text: undefined };
        }
        return br.breaks.map(calcBreakCost);
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

    // A candidate that only ties the whole-word fallback is still preferred over it, since it
    // represents a more granular split; ties between two genuine split candidates keep whichever
    // was found first. Allow the search to explore up to (and including) a tying cost by giving
    // maxCost one extra unit of slack above the seeded whole-word cost.
    function preferCandidate(candidate: PathNode, current: PathNode): boolean {
        if (candidate.c < current.c) return true;
        if (candidate.c > current.c) return false;
        return current === wholeWordNode && candidate !== wholeWordNode;
    }

    let maxCost = wholeWordCost + 1;
    const candidates = new PairingHeap<Candidate>(compare);
    candidates.append(makeCandidates(undefined, lineSeg.relStart, 0, 0, 0));
    let attempts = 0;
    let bestPath: PathNode = wholeWordNode;

    while (maxCost && candidates.length && attempts++ < maxAttempts) {
        /** Best Candidate Index */
        const best = candidates.dequeue();
        if (!best || best.c >= maxCost) {
            continue;
        }
        // Does it have a split?
        if (best.bp !== ignoreBreak) {
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
                bestPath = f && preferCandidate(f, bestPath) ? f : bestPath;
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
                bestPath = f && preferCandidate(f, bestPath) ? f : bestPath;
            }
        }
        // While the whole-word fallback is still the best known answer, keep one unit of
        // slack above its cost so a genuine split that only ties it can still be explored
        // to completion and preferred by preferCandidate. Once a real split has taken over,
        // tighten exactly like before.
        const slack = bestPath === wholeWordNode ? 1 : 0;
        if (bestPath.c + slack < maxCost) {
            maxCost = bestPath.c + slack;
        }
    }

    const result = pathToWords(bestPath);
    if (result.length === 2 && result.every((r) => !r.isFound) && regExFirstUpper.test(wholeWord.text)) {
        return [wholeWord];
    }
    return result;
}

export const __testing__: {
    findNextWordText: typeof findNextWordText;
} = {
    findNextWordText,
};
