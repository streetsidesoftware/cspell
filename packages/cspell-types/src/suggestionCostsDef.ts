// cspell:ignore aeiouy
/**
 * A WeightedMapDef enables setting weights for edits between related characters and substrings.
 *
 * Multiple groups can be defined using a `|`.
 * A multi-character substring is defined using `()`.
 *
 * For example, in some languages, some letters sound alike.
 *
 * ```yaml
 *   map: 'sc(sh)(sch)(ss)|t(tt)' # two groups.
 *   replace: 50    # Make it 1/2 the cost of a normal edit to replace a `t` with `tt`.
 * ```
 *
 * The following could be used to make inserting, removing, or replacing vowels cheaper.
 * ```yaml
 *   map: 'aeiouy'
 *   insDel: 50     # Make it is cheaper to insert or delete a vowel.
 *   replace: 45    # It is even cheaper to replace one with another.
 * ```
 *
 * Note: the default edit distance is 100.
 */
export type SuggestionCostMapDef = CostMapDefReplace | CostMapDefInsDel | CostMapDefSwap;

export type SuggestionCostsDefs = SuggestionCostMapDef[];

interface CostMapDefBase {
    /**
     * The set of substrings to map, these are generally single character strings.
     *
     * Multiple sets can be defined by using a `|` to separate them.
     *
     * Example: `"eéê|aåá"` contains two different sets.
     *
     * To add a multi-character substring use `()`.
     *
     * Example: `"f(ph)(gh)"` results in the following set: `f`, `ph`, `gh`.
     *
     * - To match the beginning of a word, use `^`: `"(^I)""`.
     * - To match the end of a word, use `$`: `"(e$)(ing$)"`.
     *
     */
    map: string;
    /** The cost to insert/delete one of the substrings in the map. Note: insert/delete costs are symmetrical. */
    insDel?: number;
    /**
     * The cost to replace of of the substrings in the map with another substring in the map.
     * Example: Map['a', 'i']
     * This would be the cost to substitute `a` with `i`: Like `bat` to `bit` or the reverse.
     */
    replace?: number;
    /**
     * The cost to swap two adjacent substrings found in the map.
     * Example: Map['e', 'i']
     * This represents the cost to change `ei` to `ie` or the reverse.
     */
    swap?: number;
    /**
     * A description to describe the purpose of the map.
     */
    description?: string;
    /**
     * Add a penalty to the final cost.
     * This is used to discourage certain suggestions.
     *
     * Example:
     * ```yaml
     * # Match adding/removing `-` to the end of a word.
     * map: "$(-$)"
     * replace: 50
     * penalty: 100
     * ```
     *
     * This makes adding a `-` to the end of a word more expensive.
     *
     * Think of it as taking the toll way for speed but getting the bill later.
     */
    penalty?: number;
}

export interface CostMapDefReplace extends CostMapDefBase {
    replace: number;
}

export interface CostMapDefInsDel extends CostMapDefBase {
    insDel: number;
}

export interface CostMapDefSwap extends CostMapDefBase {
    swap: number;
}
