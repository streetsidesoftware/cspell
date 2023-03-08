import type { Issue, TextOffset as TextOffsetRW } from '@cspell/cspell-types';

export interface ValidationResult extends TextOffsetRW, Pick<Issue, 'message' | 'issueType'> {
    line: TextOffsetRW;
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
}
