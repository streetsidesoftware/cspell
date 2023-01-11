import type { TextOffset as TextOffsetRW, Issue } from '@cspell/cspell-types';

export interface ValidationResult extends TextOffsetRW, Pick<Issue, 'message' | 'issueType'> {
    line: TextOffsetRW;
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
}
