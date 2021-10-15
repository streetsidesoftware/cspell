import type { MatchResult, MatchSegment } from './types';

/**
 * Try to assign group names and numbers to segments of the matching text.
 * Note: this is NOT a perfect match. It tries its best given limited information.
 * For example, it will give back the wrong indexes for the following RegExp and text:
 * `/.+(a(?=p)).+/g.exec('bad apple')`. Group 1 will be the `a` in `bad`, not the `a` in apple.
 * @param mr - match result
 * @returns a list of matching segments in group number order.
 */
export function segmentMatch(mr: MatchResult): MatchSegment[] {
    const { matches, index, groups, input } = mr;
    const segments: MatchSegment[] = [];

    let p = index;
    for (let groupNum = 0; groupNum < matches.length; ++groupNum) {
        const m = matches[groupNum];
        if (!m) continue;
        // Look forwards for the next best match.
        const idx0 = input.indexOf(m, p);
        // try looking backwards if forwards does not work.
        const idx = idx0 >= p ? idx0 : input.lastIndexOf(m, p);
        if (idx < 0) continue;
        segments.push({ match: m, index: idx, groupNum, groupName: undefined });
        p = idx;
    }

    const textToSeg = new Map(segments.map((s) => [s.match, s]));

    for (const [name, value] of Object.entries(groups)) {
        const s = value && textToSeg.get(value);
        if (!s) continue;
        s.groupName = s.groupName
            ? Array.isArray(s.groupName)
                ? s.groupName.concat([name])
                : [s.groupName, name]
            : name;
    }

    return segments;
}

export function createMatchResult(r: RegExpExecArray): MatchResult {
    const groups: MatchResult['groups'] = Object.create(null);
    r.groups && Object.assign(groups, r.groups);
    const matches = r;
    const match = r[0];

    return { index: r.index, input: r.input, match, matches, groups };
}

export function createSimpleMatchResult(match: string, input: string, index: number): MatchResult {
    const groups: MatchResult['groups'] = Object.create(null);
    return { index, input, match, matches: [match], groups };
}
