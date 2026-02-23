import type { Issue, TextOffset as TextOffset } from '@cspell/cspell-types';

export interface ValidationResult
    extends
        Omit<TextOffset, 'length'>,
        Pick<Issue, 'message' | 'issueType' | 'hasPreferredSuggestions' | 'hasSimpleSuggestions'> {
    length?: number | undefined;
    line: TextOffset;
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
}

/**
 * The ValidationResultRPC is used for RPC communication. It is a subset of ValidationResult that can be serialized.
 *
 * The URI, document, row, and column information are not included in the RPC version of ValidationResult
 * because they can be calculated from the offset and the document text.
 */
export interface ValidationResultRPC extends Pick<
    ValidationResult,
    | 'text'
    | 'length'
    | 'offset'
    | 'message'
    | 'issueType'
    | 'hasPreferredSuggestions'
    | 'hasSimpleSuggestions'
    | 'isFlagged'
    | 'isFound'
> {
    /**
     * The line information is not included in the RPC version of ValidationResult because it can be calculated from the offset and the document text.
     */
    line?: undefined;
    /**
     * The context information is not included in the RPC version of ValidationResult because it can be calculated from the offset and the document text.
     */
    context?: undefined;
    uri?: undefined;
    doc?: undefined;
    row?: undefined;
    col?: undefined;
}
