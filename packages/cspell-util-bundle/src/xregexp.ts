import XRegExpLib from 'xregexp';

/**
 * Match or replacement scope that will only match or replace the first occurrence.
 */
export type MatchScopeOne = 'one';

/**
 * Match or replacement scope that will match or replace all occurrence.
 */
export type MatchScopeAll = 'all';

/**
 * Valid match or replacement scopes for when doing a match or replace.
 */
export type MatchScope = MatchScopeOne | MatchScopeAll;

export type Pattern = RegExp | string;

/**
 * A matched substring, including named capture groups as properties, or the `groups` property
 * if the `namespacing` feature is installed.
 */
export interface MatchSubString extends String {
    /**
     * Named capture groups are accessible as properties when the `namespacing`
     * feature is not installed.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [propName: string]: any;

    /**
     * This is only present if the `namespacing` feature is installed
     * using the `XRegExp.install` method.
     */
    groups?: NamedGroupsArray;
}

/**
 * Represents a list of named capture groups. Only valid if the `namespacing` feature is turned on.
 */
export interface NamedGroupsArray {
    /**
     * Named capture groups are accessible as properties.
     */
    [key: string]: string;
}

/**
 *   Replacement functions are invoked with three or more arguments:
 *     - `{string}`        substring  - The matched substring (corresponds to `$&` above). Named backreferences are accessible as
 *       properties of this first argument if the `namespacing` feature is off.
 *     - `{string}`        args[1..n] - arguments, one for each backreference (corresponding to `$1`, `$2`, etc. above).
 *     - `{number}`        args[n+1]  - The zero-based index of the match within the total search string.
 *     - `{string}`        args[n+2]  - The total string being searched.
 *     - `{XRegExp.NamedGroups}` args[n+3]  - If the `namespacing` feature is turned on, the last parameter is the groups object. If the
 *       `namespacing` feature is off, then this argument is not present.
 */
export type ReplacementFunction = (
    substring: MatchSubString,
    ...args: Array<string | number | NamedGroupsArray>
) => string;

export type ReplacementValue = string | ReplacementFunction;

export interface XRegExp {
    (pattern: string, flags?: string): RegExp;
    (pattern: RegExp): RegExp;

    /**
     * Returns a new string with one or all matches of a pattern replaced. The pattern can be a string
     * or regex, and the replacement can be a string or a function to be called for each match. To
     * perform a global search and replace, use the optional `scope` argument or include flag g if using
     * a regex. Replacement strings can use `${n}` or `$<n>` for named and numbered backreferences.
     * Replacement functions can use named backreferences via `arguments[0].name`. Also fixes browser
     * bugs compared to the native `String.prototype.replace` and can be used reliably cross-browser.
     *
     * @param str - String to search.
     * @param search - Search pattern to be replaced.
     * @param replacement - Replacement string or a function invoked to create it.
     * @param scope - Use 'one' to replace the first match only, or 'all'. If not explicitly specified and using a regex with
     *        flag g, `scope` is 'all'.
     * @returns New string with one or all matches replaced.
     * @example
     * ```
     * // Regex search, using named backreferences in replacement string
     * const name = XRegExp('(?<first>\\w+) (?<last>\\w+)');
     * XRegExp.replace('John Smith', name, '$<last>, $<first>');
     * // -> 'Smith, John'
     *
     * // Regex search, using named backreferences in replacement function
     * XRegExp.replace('John Smith', name, (match) => `${match.last as string}, ${match.first as string}`);
     * // -> 'Smith, John'
     *
     * // String search, with replace-all
     * XRegExp.replace('RegExp builds RegExps', 'RegExp', 'XRegExp', 'all');
     * // -> 'XRegExp builds XRegExps'
     * ```
     */
    replace(str: string, search: Pattern, replacement: ReplacementValue, scope?: MatchScope): string;

    /**
     * Splits a string into an array of strings using a regex or string separator. Matches of the
     * separator are not included in the result array. However, if `separator` is a regex that contains
     * capturing groups, backreferences are spliced into the result each time `separator` is matched.
     * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
     * cross-browser.
     *
     * @param str - String to split.
     * @param separator - Regex or string to use for separating the string.
     * @param limit - Maximum number of items to include in the result array.
     * @returns Array of substrings.
     * @example
     * ```
     * // Basic use
     * XRegExp.split('a b c', ' ');
     * // -> ['a', 'b', 'c']
     *
     * // With limit
     * XRegExp.split('a b c', ' ', 2);
     * // -> ['a', 'b']
     *
     * // Backreferences in result array
     * XRegExp.split('..word1..', /([a-z]+)(\d+)/i);
     * // -> ['..', 'word', '1', '..']
     * ```
     */
    split(str: string, separator: Pattern, limit?: number): string[];
}

export const xregexp: XRegExp = XRegExpLib;
