export interface CSpellSettingsValidation {
    /**
     * Control which segments of text emitted by a parser are spell checked, based upon
     * the `tags` assigned to each segment (see `ParsedText.tags`).
     *
     * By default, all text emitted by a parser is validated.
     *
     * Tags are matched hierarchically by dot-separated segments -- a key like `comment.block`
     * also matches the more specific tag `comment.block.doc`, unless overridden by a more
     * specific key.
     *
     * The special key `*` sets the default for any tag not otherwise matched.
     *
     * A value of:
     * - `true` - validate (spell check) text with the matching tag.
     * - `false` - do not validate text with the matching tag.
     *
     * **Example: only validate string content**
     *
     * ```
     * { "*": false, "string": true }
     * ```
     *
     * **Example: only validate doc-block comments**
     *
     * ```
     * { "*": false, "comment.block.doc": true }
     * ```
     *
     * @default { "*": true }
     * @experimental
     * @since 10.4.0
     */
    validate?: ValidationTags;
}

/**
 * A pattern used to match validation tags.
 * This can be a specific tag like `comment.block.doc` or a wildcard pattern like `*`.
 * Examples:
 * - `comment.block.doc` - matches only the `comment.block.doc` tag.
 * - `comment.block.*` - matches any tag starting with `comment.block.`.
 * - `*` - matches any tag.
 * - `comment*` - matches any tag starting with `comment`.
 */
export type TagPattern = string;

export interface ValidationTags {
    /**
     * The default validation setting for any tag not otherwise matched.
     * @default true
     */
    '*'?: boolean;

    /**
     * Validation setting for the specific tag.
     *
     * If not specified, the default (`'*'`) will be used.
     */
    [tag: TagPattern]: boolean;
}
