import { MatchRuleResult, NCaptures, NPatternBeginEnd, Rule } from '../grammarNormalized';
import { extractScope } from '../grammarNormalizer';
import { segmentMatch } from '../matchResult';
import { Scope } from '../scope';
import type { MatchResult, MatchSegment, TokenizedText } from '../types';
import { isDefined } from '../util';

/**
 * Apply the scopes to the line
 * @param line - line of text
 * @param matchRuleResult - the matching rule
 */
export function applyCaptureToBeginOrMatch(matchRuleResult: MatchRuleResult): TokenizedText[] {
    const { match, rule } = matchRuleResult;

    const bePattern = <NPatternBeginEnd>rule.pattern;

    const captures = bePattern.beginCaptures ?? bePattern.captures;

    return applyCaptures(rule, match, captures);
}

/**
 * Apply the scopes to the line
 * @param line - line of text
 * @param rule - the matching rule
 */
export function applyCaptureToEnd(rule: Rule, match: MatchResult): TokenizedText[] {
    const { pattern } = rule;

    const bePattern = <NPatternBeginEnd>pattern;

    const captures = bePattern.beginCaptures ?? bePattern.captures;

    return applyCaptures(rule, match, captures);
}

/**
 * Apply the scopes to the line
 * @param line - line of text
 * @param rule - the matching rule
 */
export function applyCaptures(rule: Rule, match: MatchResult, captures: NCaptures | undefined): TokenizedText[] {
    const scope = extractScope(rule, false);
    const pool = rule.grammar.scopePool;
    const text = match.match;
    const input = match.input;
    // Do not emit empty captures.
    if (!text && !captures) return [];

    if (!captures) {
        const tokenized: TokenizedText = {
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
        const tokenized: TokenizedText = {
            scope: rule.grammar.scopePool.getScope(cap0, scope),
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

    function segChainToScope(chain: SegmentChain | undefined): Scope {
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

        const scopeValues = [..._chain(chain)]
            .map((cap) => captureScopes.get(cap))
            .filter(isDefined)
            .reverse();

        return scopeValues.reduce((s, v) => pool.getScope(v, s), scope);
    }

    const merged = processSegments(segments);

    function* emit(m: Merge | undefined): Generator<TokenizedText> {
        while (m) {
            const t: TokenizedText = {
                text: input.slice(m.a, m.b),
                offset: m.a,
                scope: segChainToScope(m.s),
            };
            yield t;
            m = m.n;
        }
    }

    const parsedText: TokenizedText[] = [...emit(merged)];
    return parsedText;
}
