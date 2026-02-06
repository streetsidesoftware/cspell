export type SfxType = 'S';
export type PfxType = 'P';

export type AfxType = PfxType | SfxType;

export type RuleDirective = '/';

/**
 * The rule id.
 * - If the rule separator is an empty string, the id is a single letter, digit or punctuation.
 * - Otherwise, it can be multiple letters, digits, or punctuation.
 * Avoid use of special characters that may interfere with parsing.
 */
export type AfxRuleId = string;

/**
 * A very limited regular expression string.
 * Only the following are allowed:
 * - characters (unicode is assumed)
 * - `.` (dot)
 * - `?` (zero or one)
 * - `^` (beginning of string) optional at start
 * - `$` (end of string) optional at end
 * - character classes: `[abc]`, `[^abc]`.
 *
 * NOT allowed:
 * - ranges inside character classes are NOT supported: `a-z`, `A-Z`, `0-9`
 * - no grouping: `(...)`
 * - no alternation: `a|b`
 * - no quantifiers other than `?`: `*`, `+`, `{n}`, `{n,}`, `{n,m}` are not allowed
 * - no escape sequences: `\d`, `\w`, `\s`, `\b`, etc. are not allowed
 *
 * No other regular expression features are allowed.
 */
export type LimitedRegExpStr = string;

/**
 * The match condition for prefixes.
 */
export type PfxMatch = string;

/**
 * The match condition for suffixes.
 */
export type SfxMatch = string;

export interface AfxMutation {
    /**
     * The string to remove.
     */
    remove: string;

    /**
     * The string to attach.
     */
    attach: string;

    /**
     * The condition to apply the rule.
     */
    when: PfxMatch | SfxMatch;

    /**
     * The rules to apply after this one has been applied.
     */
    apply?: AfxRuleId[] | undefined;
}

export interface SfxMutation extends AfxMutation {
    /**
     * The string to remove from the end of the word.
     * - The string MUST match the end of the word.
     * - It may include more rules to apply.
     * - Empty string means no characters are removed.
     */
    remove: string;
    /**
     * The string to attach to the end of the word.
     * It may include more rules to apply.
     */
    attach: string;

    when: SfxMatch;
}

export interface PfxMutation extends AfxMutation {
    /**
     * The string to remove from the end of the word.
     * - The string MUST match the end of the word.
     * - It may include more rules to apply.
     * - Empty string means no characters are removed.
     */
    remove: string;
    /**
     * The string to attach to the end of the word.
     * It may include more rules to apply.
     */
    attach: string;

    when: PfxMatch;
}

export interface AfxRule {
    /**
     * The rule id.
     * - If the rule separator is an empty string, the id is a single letter, digit or punctuation.
     * - Otherwise, it can be multiple letters, digits, or punctuation.
     * Avoid use of special characters that may interfere with parsing.
     */
    id?: AfxRuleId;

    /**
     * The type of affix rule.
     * - `P` - prefix
     * - `S` - suffix
     */
    type: AfxType;

    /**
     * The list of possible mutations to apply.
     */
    mutations: AfxMutation[];

    /**
     * Whether the affix is combinable with other of the opposite type.
     * @default false
     */
    combinable?: boolean | undefined;

    /**
     * An optional description of the rule.
     */
    description?: string | undefined;
}

export interface AfxRuleWithId extends AfxRule {
    /**
     * The rule id.
     * - If the rule separator is an empty string, the id is a single letter, digit or punctuation.
     * - Otherwise, it can be multiple letters, digits, or punctuation.
     * Avoid use of special characters that may interfere with parsing.
     */
    id: AfxRuleId;
}

export interface SfxRule extends AfxRule {
    type: SfxType;
    /**
     * The string to remove from the end of the word.
     * - The string MUST match the end of the word.
     * - It may include more rules to apply.
     * - Empty string means no characters are removed.
     */

    /**
     * The list of possible mutations to apply.
     */
    mutations: SfxMutation[];

    /**
     * Can be combined with prefixes.
     * @default false
     */
    combinable?: boolean | undefined;
}

export interface PfxRule extends AfxRule {
    type: PfxType;

    /**
     * The list of possible mutations to apply.
     */
    mutations: PfxMutation[];

    /**
     * Can be combined with suffixes.
     * @default false
     */
    combinable?: boolean | undefined;
}

export type SingleLetterRules = '';
export type DoubleLetterRules = '..';
export type CommaSeparatedRules = ',';

/**
 * The options for separating multiple affix rule ids after a word.
 */
export type RuleFormatOptions = CommaSeparatedRules | SingleLetterRules | DoubleLetterRules;

export type AfxDefRule = AfxRule;

export type AfxRuleRecord = Record<AfxRuleId, AfxDefRule>;

/**
 * The affix transformation definition.
 */
export interface AfxDef {
    /**
     * The type of separator used between multiple affix rule ids after a word.
     * @default ''
     */
    wordRulesFormat?: RuleFormatOptions | undefined;

    /**
     * The maximum depth to apply affix rules.
     * @default 3
     */
    maxDepth?: number | undefined;

    rules: AfxRuleRecord;
}

/**
 * The applied rules as a string. Each rules is separated by a comma.
 */
export type AppliedRules = string;

export interface AfxWord {
    word: string;
}

export interface AfxWordAndRules extends AfxWord {
    /**
     * The list of rule ids to apply.
     */
    apply?: AfxRuleId[] | undefined;
}

export interface AppliedRuleResult extends AfxWordAndRules {
    appliedRules?: AppliedRules;
    canCombineWith?: AfxType | undefined;
}
