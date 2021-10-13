import { MatchingRule, NPatternBeginEnd } from '../grammarNormalized';
import { extractScope } from '../grammarNormalizer';
import { MatchSegment, segmentMatch } from '../matchResult';
import { ParsedText } from '../parser';
import { isDefined } from '../util';

/**
 * Apply the scopes to the line
 * @param line - line of text
 * @param rule - the matching rule
 */
export function applyCaptures(rule: MatchingRule): ParsedText[] {
    const { match, pattern } = rule;

    const bePattern = <NPatternBeginEnd>pattern;
    const scope = extractScope(rule);
    const text = match.match;
    const input = match.input;

    const captures = bePattern.beginCaptures ?? bePattern.captures;

    if (!captures) {
        const tokenized: ParsedText = {
            scope,
            text,
            offset: match.index,
        };
        return [tokenized];
    }

    const captureScopes = new Map(Object.entries(captures));

    const cap0 = captureScopes.get('0');

    // Handle the simple case.
    if (captureScopes.size === 1 && cap0) {
        const tokenized: ParsedText = {
            scope: [cap0].concat(scope),
            text,
            offset: match.index,
        };
        return [tokenized];
    }

    const min = match.index;
    const max = match.index + text.length;

    function trimSegment(seg: MatchSegment): MatchSegment | undefined {
        const { index, match } = seg;
        const right = match.length;
        if (index >= min && right <= max) return seg;
        if (index >= max || right < min) return undefined;
        const a = Math.max(index, min) - index;
        const b = Math.min(right, max) - index;
        const text = match.slice(a, b);
        return {
            ...seg,
            index: index + a,
            match: text,
        };
    }

    const segments = segmentMatch(match).map(trimSegment).filter(isDefined);

    interface SegmentChain {
        seg: MatchSegment;
        next?: SegmentChain;
    }

    interface Merge {
        a: number;
        b: number;
        s: SegmentChain;
        n?: Merge;
    }

    function processSegments(segments: MatchSegment[]): Merge {
        const base = segments[0];
        const root: Merge = {
            a: base.index,
            b: base.index + base.match.length,
            s: { seg: base },
        };

        let m: Merge | undefined;
        for (let i = 1; i < segments.length; ++i) {
            const seg = segments[i];
            const index = seg.index;
            const end = index + seg.match.length;
            m = m && m.a <= index ? m : root;
            while (m && m.b <= index) {
                m = m.n;
            }
            while (m && m.a < end) {
                if (m.a < index) {
                    const n = { ...m, a: index };
                    m.n = n;
                    m.b = index;
                    m = n;
                }
                if (m.b > end) {
                    const n = { ...m, a: end };
                    m.b = end;
                    m.n = n;
                }
                m.s = { seg, next: m.s };
                m = m.n;
            }
        }
        return root;
    }

    function segChainToScope(chain: SegmentChain | undefined): string[] {
        function* _chain(chain: SegmentChain | undefined): Generator<string, void, undefined> {
            while (chain) {
                const seg = chain.seg;
                if (seg.groupName) {
                    if (Array.isArray(seg.groupName)) {
                        yield* seg.groupName;
                    } else {
                        yield seg.groupName;
                    }
                }
                yield seg.groupNum.toString();
                chain = chain.next;
            }
        }

        return [..._chain(chain)]
            .map((cap) => captureScopes.get(cap))
            .filter(isDefined)
            .concat(scope);
    }

    const merged = processSegments(segments);

    function* emit(m: Merge | undefined): Generator<ParsedText> {
        while (m) {
            const t: ParsedText = {
                text: input.slice(m.a, m.b),
                offset: m.a,
                scope: segChainToScope(m.s),
            };
            yield t;
            m = m.n;
        }
    }

    const parsedText: ParsedText[] = [...emit(merged)];
    return parsedText;
}
