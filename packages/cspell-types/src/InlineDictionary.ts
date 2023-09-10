export interface InlineDictionary {
    /**
     * List of words to be considered correct.
     */
    words?: string[];

    // cspell:ignore colour color canot
    /**
     * List of words to always be considered incorrect. Words found in `flagWords` override `words`.
     * @markdownDescription
     * List of words to always be considered incorrect. Words found in `flagWords` override `words`.
     *
     * Format of `flagWords`
     * - single word entry - `word`
     * - with suggestions - `word:suggestion` or `word->suggestion, suggestions`
     *
     * Example:
     * ```ts
     * "flagWords": [
     *   "color: colour",
     *   "incase: in case, encase",
     *   "canot->cannot",
     *   "cancelled->canceled"
     * ]
     * ```
     */
    flagWords?: string[];

    /**
     * List of words to be ignored. An ignored word will not show up as an error, even if it is
     * also in the `flagWords`.
     */
    ignoreWords?: string[];

    /**
     * A list of suggested replacements for words.
     * Suggested words provide a way to make preferred suggestions on word replacements.
     * To hint at a preferred change, but not to require it.
     *
     * @markdownDescription
     * A list of suggested replacements for words.
     * Suggested words provide a way to make preferred suggestions on word replacements.
     * To hint at a preferred change, but not to require it.
     *
     * Format of `suggestWords`
     * - Single suggestion (possible auto fix)
     *     - `word: suggestion`
     *     - `word->suggestion`
     * - Multiple suggestions (not auto fixable)
     *    - `word: first, second, third`
     *    - `word->first, second, third`
     */
    suggestWords?: string[];
}
