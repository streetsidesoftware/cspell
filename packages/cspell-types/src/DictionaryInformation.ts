import { SuggestionCostsDefs } from './suggestionCostsDef';

/**
 * Use by dictionary authors to help improve the quality of suggestions
 * given from the dictionary.
 *
 * Added with `v5.16.0`.
 */
export interface DictionaryInformation {
    /**
     * The locale of the dictionary.
     * Example: `nl,nl-be`
     */
    locale?: string;

    /**
     * The alphabet to use.
     * @default "a-zA-Z"
     */
    alphabet?: CharacterSet | CharacterSetCosts[];

    /**
     * The accent characters
     * @default "\u0300-\u0341"
     */
    accents?: CharacterSet | CharacterSetCosts[];

    /**
     * Define edit costs.
     */
    costs?: EditCosts;

    /**
     * Used in making suggestions. The lower the value, the more likely the suggestion
     * will be near the top of the suggestion list.
     */
    suggestionEditCosts?: SuggestionCostsDefs | undefined;

    /**
     * Used by dictionary authors
     */
    hunspellInformation?: HunspellInformation;
}

export interface HunspellInformationParsed {
    /**
     * This is generally the alphabet used in the dictionary.
     * It stands for the characters to try using for substitutions
     * when looking for a suggestions.
     *
     * Example:
     * - Hunspell:
     *   ```hunspell
     *   TRY aeistlunkodmrvpgjhäõbüoöfcwzxðqþ`
     *   ```
     * - Use: yaml
     *   ```yaml
     *   tryChars: "aeistlunkodmrvpgjhäõbüoöfcwzxðqþ"
     *   ```
     * <!--- cspell:ignore aeistlunkodmrvpgjhäõbüoöfcwzxðqþ  --
     */
    tryChars?: string;

    /**
     * This defines characters that are good substitutes for each other.
     * - A `()` is need for multi character sequences like letters with multiple accents.
     * - Separate unrelated characters with `|` or `\n`
     *
     * Example:
     * - Hunspell:
     *   ```hunspell
     *   MAP aàâäAÀÂÄ
     *   MAP eéèêëEÉÈÊË
     *   MAP iîïyIÎÏY
     *   MAP oôöOÔÖ
     *   MAP (IJ)(Ĳ)
     *   ```
     * - Use:
     *   `yaml`
     *   ```yaml
     *   mapSets: |
     *     aàâäAÀÂÄ|eéèêëEÉÈÊË`
     *     eéèêëEÉÈÊË|iîïyIÎÏY
     *     oôöOÔÖ|(IJ)(Ĳ)
     *   ```
     * <!--- cspell:ignore aàâä eéèêë iîïy -->
     */
    mapSets?: string | string[];

    /**
     * This represents the layout of a common keyboard.
     * Used for adjacency mistakes.
     *
     * Hunspell:
     * ```hunspell
     * KEY qwertyuiop|asdfghjkl|zxcvbnm
     * ```
     * Use:
     * ```yaml
     * keyboard: qwertyuiop|asdfghjkl|zxcvbnm
     * ```
     * <!--- cspell:ignore asdfghjkl qwertyuiop zxcvbnm -->
     */
    keyboard?: string;

    /**
     * Output Conversions
     *
     */
    outConvert?: string | string[];
    inConvert?: string | string[];

    /**
     * Common Substitutions.
     * Special characters:
     * - `^` - matches the beginning of a word.
     * - `$` - matches the end of a word.
     *
     * Hunspell:
     * ```hunspell
     * REP c ss
     * REP e ĳ
     * REP é ee
     * REP g ch
     * REP ï ii
     * REP t d	# gebiest=>gebiesd
     * REP u ĳ
     * ```
     *
     * Use:
     * ```yaml
     * replace: |
     *   c ss
     *   e ĳ
     *   é ee
     *   g ch
     *   ï ii
     *   t d
     *   u ĳ
     * ```
     *
     * <!--- cspell:ignore gebiesd gebiest -->
     */
    replace?: string | string[];

    /** The costs to apply when using the hunspell settings */
    costs?: HunspellCosts;
}

export interface HunspellInformation {
    /**
     * Selected Hunspell AFF content.
     * The content must be UTF-8
     *
     * Sections:
     * - TRY
     * - MAP
     * - REP
     * - KEY
     * - ICONV
     * - OCONV
     *
     * Example:
     * ```hunspell
     * # Comment
     * TRY aeistlunkodmrvpgjhäõbüoöfcwzxðqþ`
     * MAP aàâäAÀÂÄ
     * MAP eéèêëEÉÈÊË
     * MAP iîïyIÎÏY
     * MAP oôöOÔÖ
     * MAP (IJ)(Ĳ)
     * ```
     */
    aff: HunspellAffContent;

    /** The costs to apply when using the hunspell settings */
    costs?: HunspellCosts;
}

// cspell:ignore OCONV
/**
 * Selected Hunspell AFF content.
 * The content must be UTF-8
 *
 * Sections:
 * - TRY
 * - NO-TRY
 * - MAP
 * - REP
 * - KEY
 * - ICONV
 * - OCONV
 *
 * Example:
 * ```hunspell
 * # Comment
 * TRY aeistlunkodmrvpgjhäõbüoöfcwzxðqþ`
 * NO-TRY -0123456789 # Discourage adding numbers and dashes.
 * MAP aàâäAÀÂÄ
 * MAP eéèêëEÉÈÊË
 * MAP iîïyIÎÏY
 * MAP oôöOÔÖ
 * MAP (IJ)(Ĳ)
 * ```
 */
type HunspellAffContent = string;

interface HunspellCosts extends EditCosts {
    /**
     * The cost of inserting / deleting / or swapping any `tryChars`
     * Defaults to `baseCosts`
     */
    tryCharCost?: number;

    /**
     * The cost of replacing or swapping any adjacent keyboard characters.
     *
     * This should be slightly cheaper than `tryCharCost`.
     * @default 99
     */
    keyboardCost?: number;

    /**
     * mapSet replacement cost is the cost to substitute one character with another from
     * the same set.
     *
     * Map characters are considered very similar to each other and are often
     * the cause of simple mistakes.
     *
     * @default 25
     */
    mapCost?: number;

    /**
     * The cost to convert between convert pairs.
     *
     * The value should be slightly higher than the mapCost.
     *
     * @default 30
     */
    ioConvertCost?: number;

    /**
     * The cost to substitute pairs found in the replace settings.
     *
     * @default 75
     */
    replaceCosts?: number;
}

/**
 *
 */
export interface EditCosts {
    /**
     * This is the base cost for making an edit.
     * @default 100
     */
    baseCost?: number;

    /**
     * This is the cost for characters not in the alphabet.
     * @default 110
     */
    nonAlphabetCosts?: number;

    /**
     * The extra cost incurred for changing the first letter of a word.
     * This value should be less than `100 - baseCost`.
     * @default 4
     */
    firstLetterPenalty?: number;

    /**
     * The cost to change capitalization.
     * This should be very cheap, it helps with fixing capitalization issues.
     * @default 1
     */
    capsCosts?: number;

    /**
     * The cost to add / remove an accent
     * This should be very cheap, it helps with fixing accent issues.
     * @default 1
     */
    accentCosts?: number;
}

/**
 * This is a set of characters that can include `-` or `|`
 * - `-` - indicates a range of characters: `a-c` => `abc`
 * - `|` - is a group separator, indicating that the characters on either side
 *    are not related.
 */
export type CharacterSet = string;

export interface CharacterSetCosts {
    /**
     * This is a set of characters that can include `-` or `|`
     * - `-` - indicates a range of characters: `a-c` => `abc`
     * - `|` - is a group separator, indicating that the characters on either side
     *    are not related.
     */
    characters: CharacterSet;

    /** the cost to insert / delete / replace / swap the characters in a group */
    cost: number;

    /**
     * The penalty cost to apply if the accent is used.
     * This is used to discourage
     */
    penalty?: number;
}
