export interface MatchRange {
    startPos: number;
    endPos: number;
}
export interface MatchRangeWithText extends MatchRange {
    text: string;
}
export declare function findMatchingRanges(pattern: string | RegExp, text: string): {
    startPos: number;
    endPos: number;
}[];
export declare function unionRanges(ranges: MatchRange[]): MatchRange[];
export declare function findMatchingRangesForPatterns(patterns: (string | RegExp)[], text: string): MatchRange[];
/**
 * Create a new set of positions that have the excluded position ranges removed.
 */
export declare function excludeRanges(includeRanges: MatchRange[], excludeRanges: MatchRange[]): MatchRange[];
