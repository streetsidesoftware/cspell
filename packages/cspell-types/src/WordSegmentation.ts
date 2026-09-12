export interface WordSegmentationSettings {
    /**
     * Enables locale-sensitive text segmentation to support languages like Japanese, Chinese, Thai, Lao, Khmer, Myanmar, etc.
     * The locale used for the segmentation is based on the {@link language} setting.
     *
     * @since 10.2.0
     */
    useIntlWordSegmentation?: boolean;

    /**
     * Defines a set of word break rules that can be used for text segmentation.
     *
     * Soft word breaks are done through injecting soft-hyphens at the appropriate positions in the text before spell checking.
     *
     * This allows for word breaks that might not be captured by the camel case detection.
     *
     * Note: soft-hyphens are removed before checking the word against the dictionaries.
     *
     * For example, if there is a soft-hyphen (represented by a `|`) injected between `error` and `code`
     * `error|code`, the following words would be checked against
     * the dictionaries: `errorcode`, `error`, and `code`.
     *
     * @since 10.3.1
     */
    softWordBreakDefinitions?: SoftWordBreakDefinitions;

    /**
     * Allows enabling or disabling soft word break rules by name.
     *
     * @since 10.3.1
     */
    softWordBreaks?: SoftWordBreaks;
}

/**
 * Represents a regular expression used for word break rules.
 *
 * The matching string will be prefixed and suffixed with a soft-hyphen.
 * If the matching string is zero length, only a single soft-hyphen will be inserted.
 * It is best to use lookahead and lookbehind assertions to ensure correct word break positions.
 *
 * Examples:
 * - `/(?<=\bptr)/` -- The break would occur after the `ptr`, helping with pointer definitions starting with `ptr`, such as `ptrvalue`.
 * - `/(?<=\bI)(?=[A-Z])/` -- The break would occur before an uppercase letter following an `I` at a word boundary, helping with interface definitions like `IError`.
 *
 * @since 10.3.1
 * @note Hidden to prevent it from being exposed in the json-schema.
 * @hidden
 */
export type SoftWordBreakRegExp = RegExp;

/**
 * Represents a regular expression used for word break rules.
 *
 * The matching string will be prefixed and suffixed with a soft-hyphen.
 * If the matching string is zero length, only a single soft-hyphen will be inserted.
 * It is best to use lookahead and lookbehind assertions to ensure correct word break positions.
 *
 * Examples:
 * - `"/(?<=\\bptr)/"` -- The break would occur after the `ptr`, helping with pointer definitions starting with `ptr`, such as `ptrvalue`.
 * - `"/(?<=\\bI)(?=[A-Z])/"` -- The break would occur before an uppercase letter following an `I` at a word boundary, helping with interface definitions like `IError`.
 *
 * @since 10.3.1
 */
export type SoftWordBreakRegExpString = string;

// cspell:ignore ptrvalue

/**
 * Defines a word break rule based on a string.
 *
 * Format:
 * - `"before|after"` -- Matches a word break between `before` and `after`
 * - `"before|after$"` -- Matches a word break between `before` and `after` at the end of a word
 * - `"^before|after"` -- Matches a word break between `before` at the start of a word and `after`
 * - `"^before|after$"` -- Matches a word break between `before` at the start of a word and `after` at the end of a word
 * - `"before|"` -- Matches a word break after `before`
 * - `"^before|"` -- Matches a word break after `before` at the start of a word
 * - `"|after"` -- Matches a word break before `after`
 * - `"|after$"` -- Matches a word break before `after` at the end of a word
 *
 *
 * Where `before` is the text before the word break and `after` is the text after the word break.
 *
 * Special characters like `|`, `^`, and `$` have specific meanings.
 * - `|` -- Represents the position of the word break
 * - `^` -- Indicates the start of a word
 * - `$` -- Indicates the end of a word
 *
 * For more complicated word break rules, consider using regular expressions with the {@link SoftWordBreakRegExp} type.
 *
 * Examples:
 * - `"^ptr|"` -- Would help with pointer definitions starting with `ptr`, such as `ptrvalue`.
 * - `"^I|"` -- Would help with interface definitions starting with `I`, such as `IERROR`.
 *
 * @since 10.3.1
 */
export type SoftWordBreakPattern = string;

export type SoftWordBreakRule = SoftWordBreak | SoftWordBreak[];

export type SoftWordBreak = SoftWordBreakRegExpString | SoftWordBreakPattern | SoftWordBreakRegExp;

/**
 * Defines a set of word break rules that can be used for text segmentation.
 *
 * Soft word breaks are done through injecting soft-hyphens at the appropriate positions in the text before spell checking.
 *
 * This allows for word breaks that might not be captured by the camel case detection.
 *
 * Note: soft-hyphens are removed before checking the word against the dictionaries.
 *
 * For example, if there is a soft-hyphen (represented by a `|`) injected between `error` and `code`
 * `error|code`, the following words would be checked against
 * the dictionaries: `errorcode`, `error`, and `code`.
 *
 * @since 10.3.1
 */
export interface SoftWordBreakDefinitions {
    /**
     * A named set of soft word break rules.
     */
    [name: string]: SoftWordBreakRule;
}

/**
 * Allows enabling or disabling soft word break rules by name.
 */
export interface SoftWordBreaks {
    [name: string]: boolean;
}
