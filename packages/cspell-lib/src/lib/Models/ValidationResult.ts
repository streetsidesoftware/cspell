import type { Issue, TextOffset as TextOffsetRW } from '@cspell/cspell-types';

export interface ValidationResult
    extends TextOffsetRW, Pick<Issue, 'message' | 'issueType' | 'hasPreferredSuggestions' | 'hasSimpleSuggestions'> {
    line: TextOffsetRW;
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
}
