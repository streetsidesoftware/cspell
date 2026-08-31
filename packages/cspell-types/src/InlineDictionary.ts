export interface InlineDictionary {
    /**
     * List of words to be considered correct.
     */
    words?: string[];

    // cspell:ignore colour color canot incase avocado Avocado
    /**
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
     *
     * Case Sensitivity:
     *
     * Matching against `flagWords` is case-sensitive based on how each entry is written:
     * - An entry written in **all lowercase** (e.g. `avocado`) flags that word in any casing found in the
     *   document — `avocado`, `Avocado`, and `AVOCADO` are all flagged.
     * - An entry containing **any uppercase letter** (e.g. `Avocado`) only flags that exact casing, plus the
     *   all-uppercase form of the word (`AVOCADO`) — it does not flag `avocado` or other mixed-case variants.
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
