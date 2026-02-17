//#region src/cspell-vfs.d.ts
/**
* Binary data for CSpellVFS file.
* This can be exported by a JavaScript based CSpell Configuration file.
* @hidden
*/
type CSpellVFSBinaryData = Uint8Array<ArrayBuffer>;
/**
* Data content stored in a string for CSpellVFS file.
* It is often encoded (e.g. base64) binary data.
*/
type CSpellVFSTextData = string;
/**
* The data content of a CSpellVFS file.
*/
type CSpellVFSData = CSpellVFSBinaryData | CSpellVFSTextData;
/**
* An entry in the CSpell Virtual File System.
* It may or may not have a URL.
* @since 9.7.0
*/
interface CSpellVFSFileEntry {
  /**
  * The optional file vfs url. It is already part of the CSpellVFS key.
  */
  url?: CSpellVFSFileUrl;
  /**
  * The content data of the file.
  */
  data: CSpellVFSData;
  /**
  * The encoding of the data. In most cases the encoding is determined from the data type and filename url.
  */
  encoding?: "base64" | "plaintext" | "utf8";
}
interface CSpellVFSFile extends CSpellVFSFileEntry {
  /**
  * The file URL.
  */
  url: CSpellVFSFileUrl;
}
/**
* A URL string representing a CSpellVFS file.
* It should be of the form:
*
* ```txt
* cspell-vfs:///<module>/<path-to-file>/<file-name>
* ```
*
* Example: `cspell-vfs:///@cspell/dict-en_us/en_US.trie.gz`
*
* @since 9.7.0
*/
type CSpellVFSFileUrl = string;
/**
* A declaration of files to add to the CSpell Virtual File System.
* @since 9.7.0
* @stability experimental
*/
type CSpellVFS = Record<CSpellVFSFileUrl, CSpellVFSFileEntry>;
//#endregion
//#region src/SuggestionsConfiguration.d.ts
interface SuggestionsConfiguration {
  /**
  * Number of suggestions to make.
  *
  * @default 10
  */
  numSuggestions?: number;
  /**
  * The maximum amount of time in milliseconds to generate suggestions for a word.
  *
  * @default 500
  */
  suggestionsTimeout?: number;
  /**
  * The maximum number of changes allowed on a word to be considered a suggestions.
  *
  * For example, appending an `s` onto `example` -> `examples` is considered 1 change.
  *
  * Range: between 1 and 5.
  *
  * @default 3
  */
  suggestionNumChanges?: number;
}
//#endregion
//#region src/TextOffset.d.ts
interface TextOffset {
  /**
  * The text found at the offset. If the text has been transformed, then the length might not match `length`.
  * Example: Original: `cafe\u0301`, text: `café`
  */
  text: string;
  /**
  * The offset into the document.
  */
  offset: number;
  /**
  * Assumed to match `text.length` if the text has not been transformed.
  */
  length?: number | undefined;
}
interface TextDocumentOffset extends TextOffset {
  uri?: string | undefined;
  doc: string;
  row: number;
  col: number;
  line: TextOffset;
}
//#endregion
//#region src/CSpellReporter.d.ts
interface Suggestion {
  /**
  * Word to suggest.
  */
  word: string;
  /**
  * The suggested word adjusted to match the original case.
  */
  wordAdjustedToMatchCase?: string;
  /**
  * `true` - if this suggestion can be an automatic fix.
  */
  isPreferred?: boolean;
}
interface Issue extends Omit<TextDocumentOffset, "doc"> {
  /**
  * The text surrounding the issue text. It is only included if the reporter cannot generated it automatically.
  */
  context?: TextOffset | undefined;
  /**
  * true if the issue has been flagged as a forbidden word.
  */
  isFlagged?: boolean | undefined;
  /**
  * An optional array of replacement strings.
  */
  suggestions?: string[] | undefined;
  /**
  * An optional array of suggestions.
  */
  suggestionsEx?: Suggestion[] | undefined;
  /**
  * Issues are spelling issues unless otherwise specified.
  */
  issueType?: IssueType | undefined;
  /**
  * Optional message to show.
  */
  message?: string | undefined;
  /**
  * `true` - if it has been determined if simple suggestions are available.
  * `false` - if simple suggestions are NOT available.
  * `undefined` - if it has not been determined.
  * @since 9.1.0
  */
  hasSimpleSuggestions?: boolean | undefined;
  /**
  * This setting is used for common typo detection.
  * - `true` - if it has been determined if preferred suggestions are available.
  * - `false` - if preferred suggestions are NOT available.
  * - `undefined` - if it has not been determined.
  * @since 9.1.0
  */
  hasPreferredSuggestions?: boolean | undefined;
}
declare enum IssueType {
  spelling = 0,
  directive = 1
}
type MessageType = "Debug" | "Info" | "Warning";
type MessageTypeLookup = { [key in MessageType]: key };
declare const MessageTypes: MessageTypeLookup;
type MessageEmitter = (message: string, msgType: MessageType) => void;
type DebugEmitter = (message: string) => void;
type ErrorLike = Error | {
  message: string;
  name: string;
  toString: () => string;
};
type ErrorEmitter = (message: string, error: ErrorLike) => void;
type SpellingErrorEmitter = (issue: Issue, options?: ReportIssueOptions) => void;
type ProgressTypes = "ProgressFileBegin" | "ProgressFileComplete";
type ProgressItem = ProgressFileBegin | ProgressFileComplete;
interface ProgressBase {
  type: ProgressTypes;
}
interface ProgressFileBase extends ProgressBase {
  type: ProgressTypes;
  /**
  * The sequence number of the file being processed.
  */
  fileNum: number;
  /**
  * The total number of files being processed.
  */
  fileCount: number;
  /**
  * The file name or href of file being processed.
  */
  filename: string;
}
interface ProgressFileComplete extends ProgressFileBase {
  type: "ProgressFileComplete";
  /**
  * The time it took to process the file in milliseconds.
  * If `undefined`, then the elapsed time is not available.
  */
  elapsedTimeMs: number | undefined;
  /**
  * `true` if the file was processed.
  * `false` if the file was skipped.
  */
  processed: boolean | undefined;
  /**
  * Optional reason for skipping the file.
  */
  skippedReason?: string | undefined;
  /**
  * Number of errors and issues found in the file.
  */
  numErrors: number | undefined;
  /**
  * `true` if the file was processed from the cache.
  */
  cached?: boolean;
  /**
  * Issues found in the file.
  * If `undefined`, then the issues are not available.
  */
  issues?: Iterable<Issue> | undefined;
  /**
  * reportIssuesOptions to be used when reporting issues.
  */
  reportIssueOptions?: ReportIssueOptions | undefined;
}
/**
* Notification sent just before processing a file.
*/
interface ProgressFileBegin extends ProgressFileBase {
  type: "ProgressFileBegin";
}
type ProgressEmitter = (p: ProgressItem | ProgressFileComplete) => void;
interface RunResult {
  /** Number of files processed. */
  files: number;
  /** Set of files where issues were found. */
  filesWithIssues: Set<string>;
  /** Number of issues found. */
  issues: number;
  /** Number of processing errors. */
  errors: number;
  /** Number of files that used results from the cache. */
  cachedFiles?: number;
  /** Number of files that were skipped (not processed). */
  skippedFiles?: number;
}
type ResultEmitter = (result: RunResult) => void | Promise<void>;
interface CSpellReporterEmitters {
  issue?: SpellingErrorEmitter;
  info?: MessageEmitter;
  debug?: DebugEmitter;
  error?: ErrorEmitter;
  progress?: ProgressEmitter;
  result?: ResultEmitter;
}
interface CSpellReporter extends CSpellReporterEmitters {
  /**
  * Allows the reporter to specify supported features.
  * @since 9.1.0
  */
  features?: FeaturesSupportedByReporter | undefined;
}
interface ReporterConfigurationBase {
  /**
  * The maximum number of problems to report in a file.
  *
  * @default 10000
  */
  maxNumberOfProblems?: number;
  /**
  * The maximum number of times the same word can be flagged as an error in a file.
  *
  * @default 5
  */
  maxDuplicateProblems?: number;
  /**
  * The minimum length of a word before checking it against a dictionary.
  *
  * @default 4
  */
  minWordLength?: number;
  /**
  * Ignore sequences of characters that look like random strings.
  *
  * @default true
  */
  ignoreRandomStrings?: boolean | undefined;
  /**
  * The minimum length of a random string to be ignored.
  *
  * @default 40
  */
  minRandomLength?: number | undefined;
}
interface ReporterCommandLineOptions {
  /**
  * Display verbose information
  */
  verbose?: boolean;
  /**
  * Level of verbosity (higher number = more verbose).
  */
  verboseLevel?: number;
  /**
  * Show extensive output.
  */
  debug?: boolean;
  /**
  * Only report the words, no line numbers or file names.
  */
  wordsOnly?: boolean;
  /**
  * unique errors per file only.
  */
  unique?: boolean;
  /**
  * root directory, defaults to `cwd`
  */
  root?: string;
}
interface ReporterConfiguration extends ReporterCommandLineOptions, ReporterConfigurationBase {}
interface CSpellReporterModule {
  getReporter: (settings: unknown, config: ReporterConfiguration) => CSpellReporter;
}
/**
* Allows the reporter to advertise which features it supports.
*/
interface FeaturesSupportedByReporter {
  /**
  * The reporter supports the {@link ReportingConfiguration.unknownWords} option and understands
  * how to filter issues based upon {@link Issue.isFlagged}, {@link Issue.hasSimpleSuggestions} and {@link Issue.hasPreferredSuggestions}.
  * - `true` - The `reporter.issue` method will be called for all spelling issues and it is expected to handle .
  * - `false | undefined` - the unknown words will be filtered out based upon the `unknownWords` setting before being passed to the reporter.
  */
  unknownWords?: boolean | undefined;
  /**
  * The reporter supports the {@link Issue.issueType} option.
  * - `true` - the reporter will be called with all issues types.
  * - `false | undefined` - only {@link IssueType.spelling} issues will be passed to the reporter.
  */
  issueType?: boolean | undefined;
  /**
  * The reporter can generate context for issues.
  * - `true` - the reporter will be called with issues that do NOT have a `context` property.
  * - `false | undefined` - the reporter will be called with issues that have a `context` property.
  */
  contextGeneration?: boolean | undefined;
}
interface ReportingConfiguration extends ReporterConfigurationBase, SuggestionsConfiguration, UnknownWordsConfiguration {}
interface ReportIssueOptions extends UnknownWordsConfiguration {
  /**
  * Verify that the in-document directives are correct.
  */
  validateDirectives?: boolean | undefined;
  /**
  * Tells the spell checker to show context around the issue.
  * It is the number of characters to show on either side of the issue.
  */
  showContext?: number | undefined;
}
/**
* Possible choices for how to handle unknown words.
*/
type UnknownWordsChoices = "report-all" | "report-simple" | "report-common-typos" | "report-flagged";
declare const unknownWordsChoices: {
  readonly ReportAll: "report-all";
  readonly ReportSimple: "report-simple";
  readonly ReportCommonTypos: "report-common-typos";
  readonly ReportFlagged: "report-flagged";
};
interface UnknownWordsConfiguration {
  /**
  * Controls how unknown words are handled.
  *
  * - `report-all` - Report all unknown words (default behavior)
  * - `report-simple` - Report unknown words that have simple spelling errors, typos, and flagged words.
  * - `report-common-typos` - Report unknown words that are common typos and flagged words.
  * - `report-flagged` - Report unknown words that are flagged.
  *
  * @default "report-all"
  * @since 9.1.0
  */
  unknownWords?: UnknownWordsChoices | undefined;
}
//#endregion
//#region src/suggestionCostsDef.d.ts
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
type SuggestionCostMapDef = CostMapDefReplace | CostMapDefInsDel | CostMapDefSwap;
type SuggestionCostsDefs = SuggestionCostMapDef[];
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
interface CostMapDefReplace extends CostMapDefBase {
  replace: number;
}
interface CostMapDefInsDel extends CostMapDefBase {
  insDel: number;
}
interface CostMapDefSwap extends CostMapDefBase {
  swap: number;
}
//#endregion
//#region src/DictionaryInformation.d.ts
/**
* Use by dictionary authors to help improve the quality of suggestions
* given from the dictionary.
*
* Added with `v5.16.0`.
*/
interface DictionaryInformation {
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
  * The accent characters.
  *
  * Default: `"\u0300-\u0341"`
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
  /**
  * A collection of patterns to test against the suggested words.
  * If the word matches the pattern, then the penalty is applied.
  */
  adjustments?: PatternAdjustment[];
  /**
  * An optional set of characters that can possibly be removed from a word before
  * checking it.
  *
  * This is useful in languages like Arabic where Harakat accents are optional.
  *
  * Note: All matching characters are removed or none. Partial removal is not supported.
  */
  ignore?: CharacterSet;
}
interface HunspellInformation {
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
interface EditCosts {
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
type CharacterSet = string;
interface CharacterSetCosts {
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
/**
* @hidden
*/
type IRegExp = RegExp;
interface PatternAdjustment {
  /** Id of the Adjustment, i.e. `short-compound` */
  id: string;
  /** RegExp pattern to match */
  regexp: string | IRegExp;
  /** The amount of penalty to apply. */
  penalty: number;
}
//#endregion
//#region src/InlineDictionary.d.ts
interface InlineDictionary {
  /**
  * List of words to be considered correct.
  */
  words?: string[];
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
//#endregion
//#region src/DictionaryDefinition.d.ts
type DictionaryDefinition = DictionaryDefinitionPreferred | DictionaryDefinitionCustom | DictionaryDefinitionAugmented | DictionaryDefinitionInline | DictionaryDefinitionSimple | DictionaryDefinitionAlternate | DictionaryDefinitionLegacy;
type DictionaryFileTypes = "S" | "W" | "C" | "T";
interface DictionaryDefinitionBase {
  /**
  * This is the name of a dictionary.
  *
  * Name Format:
  * - Must contain at least 1 number or letter.
  * - Spaces are allowed.
  * - Leading and trailing space will be removed.
  * - Names ARE case-sensitive.
  * - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
  */
  name: DictionaryId;
  /**
  * Optional description of the contents / purpose of the dictionary.
  */
  description?: string | undefined;
  /** Replacement pairs. */
  repMap?: ReplaceMap | undefined;
  /** Use Compounds. */
  useCompounds?: boolean | undefined;
  /**
  * Indicate that suggestions should not come from this dictionary.
  * Words in this dictionary are considered correct, but will not be
  * used when making spell correction suggestions.
  *
  * Note: if a word is suggested by another dictionary, but found in
  * this dictionary, it will be removed from the set of
  * possible suggestions.
  */
  noSuggest?: boolean | undefined;
  /**
  * Some dictionaries may contain forbidden words to prevent compounding from generating
  * words that are not valid in the language. These are often
  * words that are used in other languages or might be generated through compounding.
  * This setting allows flagged words to be ignored when checking the dictionary.
  * The effect is similar to the word not being in the dictionary.
  */
  ignoreForbiddenWords?: boolean | undefined;
  /**
  * Type of file:
  * - S - single word per line,
  * - W - each line can contain one or more words separated by space,
  * - C - each line is treated like code (Camel Case is allowed).
  *
  * Default is S.
  *
  * C is the slowest to load due to the need to split each line based upon code splitting rules.
  *
  * Note: this settings does not apply to inline dictionaries or `.trie` files.
  *
  * @default "S"
  */
  type?: DictionaryFileTypes | undefined;
  /**
  * Strip case and accents to allow for case insensitive searches and
  * words without accents.
  *
  * Note: this setting only applies to word lists. It has no-impact on trie
  * dictionaries.
  *
  * @default true
  */
  supportNonStrictSearches?: boolean | undefined;
}
interface DictionaryDefinitionPreferred extends DictionaryDefinitionBase {
  /**
  * Path or url to the dictionary file.
  */
  path: DictionaryPath;
  /**
  * An alternative path to a bTrie dictionary file.
  * It will be used in place of `path` if the version of CSpell being used
  * supports btrie files.
  * @since 9.6.0
  */
  btrie?: DictionaryPathToBTrie | undefined;
  /**
  * Only for legacy dictionary definitions.
  * @deprecated true
  * @deprecationMessage Use {@link path} instead.
  * @hidden
  */
  file?: undefined;
}
interface HiddenPaths {
  /**
  * @hide
  */
  path?: string | undefined;
  /**
  * @hide
  */
  btrie?: string | undefined;
  /**
  * @hide
  */
  file?: undefined;
}
interface DictionaryDefinitionBaseWithPathsHidden extends DictionaryDefinitionBase, HiddenPaths {}
/**
* An Empty Dictionary Definition
*/
interface DictionaryDefinitionSimple extends DictionaryDefinitionBaseWithPathsHidden {
  /**
  * @hide
  */
  repMap?: ReplaceMap | undefined;
  /**
  * @hide
  */
  useCompounds?: boolean | undefined;
  /**
  * @hide
  */
  noSuggest?: boolean | undefined;
  /**
  * @hide
  */
  ignoreForbiddenWords?: boolean | undefined;
  /**
  * @hide
  */
  type?: DictionaryFileTypes | undefined;
}
/**
* Used to provide extra data related to the dictionary
*/
interface DictionaryDefinitionAugmented extends DictionaryDefinitionPreferred {
  dictionaryInformation?: DictionaryInformation;
}
interface HiddenFields {
  /**
  * Not used
  * @hide
  */
  path?: undefined;
  /**
  * Not used
  * @hide
  */
  btrie?: string | undefined;
  /**
  * Not used
  * @hide
  */
  file?: undefined;
  /**
  * Not used
  * @hide
  */
  type?: undefined;
  /**
  * Use `ignoreWords` instead.
  * @hide
  */
  noSuggest?: undefined;
  /**
  * Not used
  * @hide
  */
  ignoreForbiddenWords?: undefined;
  /**
  * Not used
  * @hide
  */
  useCompounds?: undefined;
  /**
  * @hide
  */
  repMap?: undefined;
}
/**
* Inline Dictionary Definition
*
* All words are defined inline.
*/
type DictionaryDefinitionInlineBase = Omit<DictionaryDefinitionBase, keyof HiddenFields> & HiddenFields & InlineDictionary;
interface DictionaryDefinitionInlineWords extends DictionaryDefinitionInlineBase, Required<Pick<InlineDictionary, "words">> {
  words: string[];
}
interface DictionaryDefinitionInlineFlagWords extends DictionaryDefinitionInlineBase, Required<Pick<InlineDictionary, "flagWords">> {
  flagWords: string[];
}
interface DictionaryDefinitionInlineIgnoreWords extends DictionaryDefinitionInlineBase, Required<Pick<InlineDictionary, "ignoreWords">> {
  ignoreWords: string[];
}
interface DictionaryDefinitionInlineSuggestWords extends DictionaryDefinitionInlineBase, Required<Pick<InlineDictionary, "suggestWords">> {
  suggestWords: string[];
}
/**
* Inline Dictionary Definitions
* @since 6.23.0
*/
type DictionaryDefinitionInline = DictionaryDefinitionInlineWords | DictionaryDefinitionInlineIgnoreWords | DictionaryDefinitionInlineFlagWords | DictionaryDefinitionInlineSuggestWords;
/**
* Only for legacy dictionary definitions.
* @deprecated true
* @deprecationMessage Use {@link DictionaryDefinitionPreferred} instead.
* This will be removed in a future release.
*/
interface DictionaryDefinitionAlternate extends DictionaryDefinitionBase, Omit<HiddenPaths, "file"> {
  /**
  * Path to the file, only for legacy dictionary definitions.
  * @deprecated true
  * @deprecationMessage Use `path` instead.
  */
  file: DictionaryPath;
  /**
  * @hidden
  */
  suggestionEditCosts?: undefined;
}
/**
* @deprecated true
* @deprecationMessage Use {@link DictionaryDefinitionPreferred} instead.
* This will be removed in a future release.
* @hidden
*/
interface DictionaryDefinitionLegacy extends DictionaryDefinitionBase, Omit<HiddenPaths, "file" | "path"> {
  /** Path to the file, if undefined the path to the extension dictionaries is assumed. */
  path?: FsDictionaryPath;
  /**
  * File name.
  * @deprecated true
  * @deprecationMessage Use {@link path} instead.
  */
  file: FsDictionaryPath;
  /**
  * Type of file:
  * - S - single word per line,
  * - W - each line can contain one or more words separated by space,
  * - C - each line is treated like code (Camel Case is allowed).
  *
  * Default is S.
  *
  * C is the slowest to load due to the need to split each line based upon code splitting rules.
  * @default "S"
  */
  type?: DictionaryFileTypes;
  /**
  * @hidden
  */
  suggestionEditCosts?: undefined;
}
/**
* Specifies the scope of a dictionary.
*/
type CustomDictionaryScope = "user" | "workspace" | "folder";
/**
* For Defining Custom dictionaries. They are generally scoped to a
* `user`, `workspace`, or `folder`.
* When `addWords` is true, indicates that the spell checker can add words
* to the file.
*
* Note: only plain text files with one word per line are supported at this moment.
*/
interface DictionaryDefinitionCustom extends DictionaryDefinitionPreferred {
  /**
  * A file path or url to a custom dictionary file.
  */
  path: CustomDictionaryPath;
  /**
  * Defines the scope for when words will be added to the dictionary.
  *
  * Scope values: `user`, `workspace`, `folder`.
  */
  scope?: CustomDictionaryScope | CustomDictionaryScope[];
  /**
  * When `true`, let's the spell checker know that words can be added to this dictionary.
  */
  addWords: boolean;
}
/**
* This is the name of a dictionary.
*
* Name Format:
* - Must contain at least 1 number or letter.
* - Spaces are allowed.
* - Leading and trailing space will be removed.
* - Names ARE case-sensitive.
* - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
*
* @pattern ^(?=[^!*,;{}[\]~\n]+$)(?=(.*\w)).+$
*/
type DictionaryId = string;
type ReplaceEntry = [string, string];
type ReplaceMap = ReplaceEntry[];
/**
* A File System Path. Relative paths are relative to the configuration file.
*/
type FsDictionaryPath = string;
/**
* A File System Path to a dictionary file.
* Pattern: `^.*\.(?:txt|trie|btrie|dic)(?:\.gz)?$`
*/
type DictionaryPath = string;
/**
* A File System Path to a dictionary file.
* Pattern: `^.*\.(?:btrie)(?:\.gz)?$`
* @since 9.6.0
*/
type DictionaryPathToBTrie = string;
/**
* A path or url to a custom dictionary file.
*/
type CustomDictionaryPath = string;
/**
* Reference to a dictionary by name.
* One of:
* - {@link DictionaryRef}
* - {@link DictionaryNegRef}
*/
type DictionaryReference = DictionaryRef | DictionaryNegRef;
/**
* This a reference to a named dictionary.
* It is expected to match the name of a dictionary.
*/
type DictionaryRef = DictionaryId;
/**
* This a negative reference to a named dictionary.
*
* It is used to exclude or include a dictionary by name.
*
* The reference starts with 1 or more `!`.
* - `!<dictionary_name>` - Used to exclude the dictionary matching `<dictionary_name>`.
* - `!!<dictionary_name>` - Used to re-include a dictionary matching `<dictionary_name>`.
*    Overrides `!<dictionary_name>`.
* - `!!!<dictionary_name>` - Used to exclude a dictionary matching `<dictionary_name>`.
*    Overrides `!!<dictionary_name>`.
*
* @pattern ^(?=!+[^!*,;{}[\]~\n]+$)(?=(.*\w)).+$
*/
type DictionaryNegRef = string;
//#endregion
//#region src/features.d.ts
/**
* These are experimental features and are subject to change or removal without notice.
*/
interface FeaturesExperimental {
  /**
  * Enable/disable using weighted suggestions.
  */
  "weighted-suggestions": FeatureEnableOnly;
}
/**
* These are the current set of active features
*/
interface FeaturesActive {
  /**
  * @hidden
  */
  featureName?: boolean;
}
/**
* These are feature settings that have been deprecated or moved elsewhere they will have no
* effect on the code but are here to prevent schema errors. The will get cleaned out on major versions.
*/
interface FeaturesDeprecated {
  /**
  * @hidden
  */
  featureName?: boolean;
}
/**
* Features are behaviors or settings that can be explicitly configured.
*/
interface Features extends Partial<FeaturesActive>, Partial<FeaturesDeprecated>, Partial<FeaturesExperimental> {}
type Feature = FeatureEnableOnly | FeatureWithConfiguration;
type FeatureEnableOnly = boolean;
/**
* Feature Configuration.
*/
interface FeatureWithConfiguration {
  enable: boolean;
}
//#endregion
//#region src/Parser/types.d.ts
/**
* A SourceMap is used to map transform a piece of text back to its original text.
* This is necessary in order to report the correct location of a spelling issue.
* An empty source map indicates that it was a 1:1 transformation.
*
* The values in a source map are number pairs (even, odd) relative to the beginning of each
* string segment.
* - even - offset in the source text
* - odd - offset in the transformed text
*
* Offsets start at 0
*
* Example:
*
* - Original text: `Grand Caf\u00e9 Bj\u00f8rvika`
* - Transformed text: `Grand Café Bjørvika`
* - Map: [9, 9, 15, 10, 18, 13, 24, 14]
*
* | offset | original    | offset | transformed |
* | ------ | ----------- | ------ | ----------- |
* | 0-9    | `Grand Caf` | 0-9    | `Grand Caf` |
* | 9-15   | `\u00e9`    | 9-10   | `é`         |
* | 15-18  | ` Bj`       | 10-13  | ` Bj`       |
* | 18-24  | `\u00f8`    | 13-14  | `ø`         |
* | 24-29  | `rvika`     | 14-19  | `rvika`     |
*
* <!--- cspell:ignore Bjørvika rvika --->
*/
type SourceMap = number[];
/**
* A range of text in a document.
* The range is inclusive of the start and exclusive of the end.
*/
type Range = readonly [start: number, end: number];
//#endregion
//#region src/Parser/Mapped.d.ts
interface Mapped {
  /**
  * The absolute start and end offset of the text in the source.
  */
  range: Range;
  /**
  * `(i, j)` number pairs where
  * - `i` is the offset in the source relative to the start of the range
  * - `j` is the offset in the transformed destination
  *
  * Example:
  * - source text = `"caf\xe9"`
  * - mapped text = `"café"`
  * - map = `[3, 3, 7, 4]`, which is equivalent to `[0, 0, 3, 3, 7, 4]`
  *   where the `[0, 0]` is unnecessary.
  *
  * See: {@link SourceMap}
  *
  */
  map?: SourceMap | undefined;
}
//#endregion
//#region src/Parser/parser.d.ts
type ParserOptions = Record<string, unknown>;
type ParserName = string;
interface Parser {
  /** Name of parser */
  readonly name: ParserName;
  /**
  * Parse Method
  * @param content - full content of the file
  * @param filename - filename
  */
  parse(content: string, filename: string): ParseResult;
}
interface ParseResult {
  readonly content: string;
  readonly filename: string;
  readonly parsedTexts: Iterable<ParsedText>;
}
interface ParsedText extends Readonly<Mapped> {
  /**
  * The text extracted and possibly transformed
  */
  readonly text: string;
  /**
  * The raw text before it has been transformed
  */
  readonly rawText?: string | undefined;
  /**
  * The Scope annotation for a segment of text.
  * Used by the spell checker to apply spell checking options
  * based upon the value of the scope.
  */
  readonly scope?: Scope | undefined;
  /**
  * Used to delegate parsing the contents of `text` to another parser.
  *
  */
  readonly delegate?: DelegateInfo | undefined;
}
/**
* DelegateInfo is used by a parser to delegate parsing a subsection of a document to
* another parser. The following information is used by the spell checker to match
* the parser.
*/
interface DelegateInfo {
  /**
  * Proposed virtual file name including the extension.
  * Format: `./${source_filename}/${block_number}.${ext}
  * Example: `./README.md/1.js`
  */
  readonly filename: string;
  /**
  * The filename of the origin of the virtual file block.
  * Example: `./README.md`
  */
  readonly originFilename: string;
  /**
  * Proposed file extension
  * Example: `.js`
  */
  readonly extension: string;
  /**
  * Filetype to use
  * Example: `javascript`
  */
  readonly fileType?: string;
}
/**
* Scope - chain of scope going from local to global
*
* Example:
* ```
* `comment.block.documentation.ts` -> `meta.interface.ts` -> `source.ts`
* ```
*/
interface ScopeChain {
  readonly value: string;
  readonly parent?: ScopeChain | undefined;
}
/**
* A string representing a scope chain separated by spaces
*
* Example: `comment.block.documentation.ts meta.interface.ts source.ts`
*/
type ScopeString = string;
type Scope = ScopeChain | ScopeString;
//#endregion
//#region src/Parser/TextMap.d.ts
type MappedText = Readonly<TransformedText>;
interface TransformedText extends Mapped {
  /**
  * Transformed text with an optional map.
  */
  text: string;
  /**
  * The original text
  */
  rawText?: string | undefined;
}
//#endregion
//#region src/Substitutions.d.ts
/**
* The ID for a substitution definition. This is used to reference the substitution definition in the substitutions array.
* @since 9.7.0
*/
type SubstitutionID = string;
/**
* A substitution entry is a tuple of the form `[find, replacement]`. The find string is the string to find,
* and the replacement string is the string to replace it with.
*
* - `find` - The string to find. This is the string that will be replaced in the text. Only an exact match will be replaced.
*   The find string is not treated as a regular expression.
* - `replacement` - The string to replace the `find` string with. This is the string that will be used to replace the `find`
*   string in the text.
*
* @since 9.7.0
*/
type SubstitutionEntry = [find: string, replacement: string];
/**
* Allows for the definition of a substitution set. A substitution set is a collection of substitution
* entries that can be applied to a document before spell checking. This is useful for converting html entities, url encodings,
* or other transformations that may be necessary to get the correct text for spell checking.
*
* Substitutions are applied based upon the longest matching find string. If there are multiple matches of the same `find`,
* the last one in the list is used. This allows for the overriding of substitutions. For example, if you have a substitution
* for `&` to `and`, and then a substitution for `&amp;` to `&`, the `&amp;` substitution will be used for the string `&amp;`,
* and the `&` substitution will be used for the string `&`.
*
* @since 9.7.0
*/
interface SubstitutionDefinition {
  /**
  * The name of the substitution definition. This is used to reference the substitution definition in the substitutions array.
  */
  name: SubstitutionID;
  /**
  * An optional description of the substitution definition. This is not used for anything, but can be useful for
  * documentation purposes.
  */
  description?: string;
  /**
  * The entries for the substitution definition. This is a collection of substitution entries that can be applied to a
  * document before spell checking.
  */
  entries: SubstitutionEntry[];
}
/**
* The set of available substitutions. This is a collection of substitution definitions that can be applied to a document
* before spell checking.
*/
type SubstitutionDefinitions = SubstitutionDefinition[];
/**
* The set of substitutions to apply to a document before spell checking.
* This is a collection of substitution entries that can be applied to a document before spell checking.
*/
type Substitutions = (SubstitutionEntry | SubstitutionID)[];
//#endregion
//#region src/types.d.ts
type Serializable = number | string | boolean | null | object;
//#endregion
//#region src/CSpellSettingsDef.d.ts
/**
* These settings come from user and workspace settings.
*/
type CSpellPackageSettings = CSpellUserSettings;
type CSpellUserSettings = CSpellSettings;
interface CSpellSettings extends FileSettings, LegacySettings {}
interface ImportFileRef {
  /** filename or URL */
  filename: string;
  error?: Error | undefined;
  referencedBy?: Source[];
}
interface CSpellSettingsWithSourceTrace extends CSpellSettings {
  source?: Source | undefined;
  __importRef?: ImportFileRef;
  __imports?: Map<string, ImportFileRef>;
}
interface AdvancedCSpellSettingsWithSourceTrace extends CSpellSettingsWithSourceTrace, ExperimentalFileSettings {}
interface FileSettings extends ExtendableSettings, CommandLineSettings {
  /**
  * Url to JSON Schema
  * @default "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json"
  */
  $schema?: string;
  /**
  * Configuration format version of the settings file.
  *
  * This controls how the settings in the configuration file behave.
  *
  * @default "0.2"
  */
  version?: Version;
  /** Words to add to global dictionary -- should only be in the user config file. */
  userWords?: string[];
  /**
  * Allows this configuration to inherit configuration for one or more other files.
  *
  * See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.
  */
  import?: FsPath | FsPath[];
  /**
  * The root to use for glob patterns found in this configuration.
  * Default: location of the configuration file.
  *   For compatibility reasons, config files with version 0.1, the glob root will
  *   default to be `${cwd}`.
  *
  * Use `globRoot` to define a different location.
  * `globRoot` can be relative to the location of this configuration file.
  * Defining globRoot, does not impact imported configurations.
  *
  * Special Values:
  * - `${cwd}` - will be replaced with the current working directory.
  * - `.` - will be the location of the containing configuration file.
  *
  */
  globRoot?: FSPathResolvable;
  /**
  * Glob patterns of files to be checked.
  *
  * Glob patterns are relative to the `globRoot` of the configuration file that defines them.
  */
  files?: Glob[];
  /**
  * Enable scanning files and directories beginning with `.` (period).
  *
  * By default, CSpell does not scan `hidden` files.
  *
  * @default false
  */
  enableGlobDot?: boolean;
  /**
  * Glob patterns of files to be ignored.
  *
  * Glob patterns are relative to the {@link globRoot} of the configuration file that defines them.
  */
  ignorePaths?: Glob[];
  /**
  * Prevents searching for local configuration when checking individual documents.
  *
  * @default false
  */
  noConfigSearch?: boolean;
  /**
  * Indicate that the configuration file should not be modified.
  * This is used to prevent tools like the VS Code Spell Checker from
  * modifying the file to add words and other configuration.
  *
  * @default false
  */
  readonly?: boolean;
  /**
  * Define which reports to use.
  * `default` - is a special name for the default cli reporter.
  *
  * Examples:
  * - `["default"]` - to use the default reporter
  * - `["@cspell/cspell-json-reporter"]` - use the cspell JSON reporter.
  * - `[["@cspell/cspell-json-reporter", { "outFile": "out.json" }]]`
  * - `[ "default", ["@cspell/cspell-json-reporter", { "outFile": "out.json" }]]` - Use both the default reporter and the cspell-json-reporter.
  *
  * @default ["default"]
  */
  reporters?: ReporterSettings[];
  /**
  * Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.
  * @default false
  */
  useGitignore?: boolean;
  /**
  * Tells the spell checker to stop searching for `.gitignore` files when it reaches a matching root.
  */
  gitignoreRoot?: FsPath | FsPath[];
  /**
  * Verify that the in-document directives are correct.
  */
  validateDirectives?: boolean;
  /**
  * Files to add to the CSpell Virtual File System.
  *
  * They can be referenced using `cspell-vfs:///<module>/<path-to-file>/<file-name>` URLs.
  *
  * They can be referenced in the `path` field of dictionary definitions.
  *
  * @since 9.7.0
  * @stability experimental
  */
  vfs?: CSpellVFS | undefined;
  /**
  * Configure CSpell features.
  *
  * @since 5.16.0
  */
  features?: Features;
  /**
  * Specify compatible engine versions.
  *
  * This allows dictionaries and other components to specify the versions of engines (like cspell) they are compatible with.
  *
  * It does not enforce compatibility, it is up to the client to use this information as needed.
  *
  * @since 9.6.3
  */
  engines?: CompatibleEngineVersions;
}
/**
* In the below JSDoc comment, we helpfully specify an example configuration for the end-user to
* reference. And this example will get captured by the automatic documentation generator.
*
* However, specifying the glob pattern inside of a JSDoc is tricky, because the glob contains the
* same symbol as the end-of-JSDoc symbol. To work around this, we insert a zero-width space in
* between the "*" and the "/" symbols. The zero-width space is automatically removed by the schema generator.
*/
interface ExtendableSettings extends Settings {
  /**
  * Overrides are used to apply settings for specific files in your project.
  *
  * For example:
  *
  * ```javascript
  * "overrides": [
  *   // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
  *   {
  *     "filename": "**​/{*.hrr,*.crr}",
  *     "languageId": "cpp"
  *   },
  *   // Force `*.txt` to use the Dutch dictionary (Dutch dictionary needs to be installed separately):
  *   {
  *     "language": "nl",
  *     "filename": "**​/dutch/**​/*.txt"
  *   }
  * ]
  * ```
  */
  overrides?: OverrideSettings[];
}
interface SpellCheckerExtensionSettings {
  /**
  * Specify a list of file types to spell check. It is better to use {@link Settings.enabledFileTypes} to Enable / Disable checking files types.
  * @title Enabled Language Ids
  * @uniqueItems true
  */
  enabledLanguageIds?: LanguageIdSingle[];
  /**
  * Enable / Disable checking file types (languageIds).
  *
  * These are in additional to the file types specified by {@link Settings.enabledLanguageIds}.
  * To disable a language, prefix with `!` as in `!json`,
  *
  *
  * **Example: individual file types**
  *
  * ```
  * jsonc       // enable checking for jsonc
  * !json       // disable checking for json
  * kotlin      // enable checking for kotlin
  * ```
  *
  * **Example: enable all file types**
  *
  * ```
  * *           // enable checking for all file types
  * !json       // except for json
  * ```
  * @title Enable File Types
  * @scope resource
  * @uniqueItems true
  */
  enableFiletypes?: LanguageIdSingle[];
  /**
  * Enable / Disable checking file types (languageIds).
  *
  * This setting replaces: {@link Settings.enabledLanguageIds} and {@link Settings.enableFiletypes}.
  *
  * A Value of:
  * - `true` - enable checking for the file type
  * - `false` - disable checking for the file type
  *
  * A file type of `*` is a wildcard that enables all file types.
  *
  * **Example: enable all file types**
  *
  * | File Type | Enabled | Comment |
  * | --------- | ------- | ------- |
  * | `*`       | `true`  | Enable all file types. |
  * | `json`    | `false` | Disable checking for json files. |
  *
  * @title Enabled File Types to Check
  * @since 8.8.1
  */
  enabledFileTypes?: Record<string, boolean>;
}
interface Settings extends ReportingConfiguration, BaseSetting, PnPSettings, SpellCheckerExtensionSettings {
  /**
  * Current active spelling language. This specifies the language locale to use in choosing the
  * general dictionary.
  *
  * For example:
  *
  * - "en-GB" for British English.
  * - "en,nl" to enable both English and Dutch.
  *
  * @default "en"
  */
  language?: LocaleId;
  /**
  * Additional settings for individual languages.
  *
  * See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.
  *
  */
  languageSettings?: LanguageSetting[];
  /** Forces the spell checker to assume a give language id. Used mainly as an Override. */
  languageId?: MatchingFileType;
  /**
  * By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
  * will prevent ALL default configuration from being loaded.
  *
  * @default true
  */
  loadDefaultConfiguration?: boolean;
  /**
  * The Maximum size of a file to spell check. This is used to prevent spell checking very large files.
  *
  * The value can be number or a string formatted `<number>[units]`, number with optional units.
  *
  * Supported units:
  *
  * - K, KB - value * 1024
  * - M, MB - value * 2^20
  * - G, GB - value * 2^30
  *
  * Special values:
  * - `0` - has the effect of removing the limit.
  *
  * Examples:
  * - `1000000` - 1 million bytes
  * - `1000K` or `1000KB` - 1 thousand kilobytes
  * - `0.5M` or `0.5MB` - 0.5 megabytes
  *
  * default: no limit
  * @since 9.4.0
  */
  maxFileSize?: number | string | undefined;
}
/**
* Plug N Play settings to support package systems like Yarn 2.
*/
interface PnPSettings {
  /**
  * Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
  * packages stored in the repository.
  *
  * When true, the spell checker will search up the directory structure for the existence
  * of a PnP file and load it.
  *
  * @default false
  */
  usePnP?: boolean;
  /**
  * The PnP files to search for. Note: `.mjs` files are not currently supported.
  *
  * @default [".pnp.js", ".pnp.cjs"]
  */
  pnpFiles?: string[];
}
/**
* The Strategy to use to detect if a file has changed.
* - `content` - uses a hash of the file content to check file changes (slower - more accurate).
* - `metadata` - uses the file system timestamp and size to detect changes (fastest, may not work in CI).
* @default 'content'
*/
type CacheStrategy = "content" | "metadata";
type CacheFormat = "legacy" | "universal";
interface CacheSettings {
  /**
  * Store the results of processed files in order to only operate on the changed ones.
  * @default false
  */
  useCache?: boolean;
  /**
  * Path to the cache location. Can be a file or a directory.
  * If none specified `.cspellcache` will be used.
  * Relative paths are relative to the config file in which it
  * is defined.
  *
  * A prefix of `${cwd}` is replaced with the current working directory.
  */
  cacheLocation?: FSPathResolvable;
  /**
  * Strategy to use for detecting changed files, default: metadata
  * @default 'metadata'
  */
  cacheStrategy?: CacheStrategy;
  /**
  * Format of the cache file.
  * - `legacy` - use absolute paths in the cache file
  * - `universal` - use a sharable format.
  * @default 'universal'
  */
  cacheFormat?: CacheFormat | undefined;
}
/**
* These are settings only used by the command line application.
*/
interface CommandLineSettings {
  /**
  * Define cache settings.
  */
  cache?: CacheSettings;
  /**
  * Exit with non-zero code as soon as an issue/error is encountered (useful for CI or git hooks)
  * @default false
  */
  failFast?: boolean;
}
/**
* To prevent the unwanted execution of untrusted code, WorkspaceTrustSettings
* are use to set the trust levels.
*
* Trust setting have an impact on both `cspell.config.js` files and on `.pnp.js` files.
* In an untrusted location, these files will NOT be used.
*
* This will also prevent any associated plugins from being loaded.
*/
interface WorkspaceTrustSettings {
  /**
  * Glob patterns of locations that contain ALWAYS trusted files.
  */
  trustedFiles?: Glob[];
  /**
  * Glob patterns of locations that contain NEVER trusted files.
  */
  untrustedFiles?: Glob[];
  /**
  * Sets the default trust level.
  * @default "trusted"
  */
  trustLevel?: TrustLevel;
}
/**
* VS Code Spell Checker Settings.
* To be Removed.
* @deprecated true
*/
interface LegacySettings {
  /**
  * Show status.
  * @deprecated true
  */
  showStatus?: boolean;
  /**
  * Delay in ms after a document has changed before checking it for spelling errors.
  * @deprecated true
  */
  spellCheckDelayMs?: number;
}
interface OverrideSettings extends Settings, OverrideFilterFields {
  /** Sets the programming language id to match file type. */
  languageId?: MatchingFileType;
  /** Sets the locale. */
  language?: LocaleId;
}
interface OverrideFilterFields {
  /** Glob pattern or patterns to match against. */
  filename: Glob | Glob[];
}
interface BaseSetting extends InlineDictionary, ExperimentalBaseSettings, UnknownWordsConfiguration {
  /** Optional identifier. */
  id?: string;
  /** Optional name of configuration. */
  name?: string;
  /** Optional description of configuration. */
  description?: string;
  /**
  * Is the spell checker enabled.
  * @default true
  */
  enabled?: boolean;
  /**
  * True to enable compound word checking.
  *
  * @default false
  */
  allowCompoundWords?: boolean;
  /**
  * Determines if words must match case and accent rules.
  *
  * See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.
  *
  * - `false` - Case is ignored and accents can be missing on the entire word.
  *   Incorrect accents or partially missing accents will be marked as incorrect.
  * - `true` - Case and accents are enforced.
  *
  * @default false
  */
  caseSensitive?: boolean;
  /**
  * Define additional available dictionaries.
  *
  * For example, you can use the following to add a custom dictionary:
  *
  * ```json
  * "dictionaryDefinitions": [
  *   { "name": "custom-words", "path": "./custom-words.txt"}
  * ],
  * "dictionaries": ["custom-words"]
  * ```
  */
  dictionaryDefinitions?: DictionaryDefinition[];
  /**
  * Optional list of dictionaries to use. Each entry should match the name of the dictionary.
  *
  * To remove a dictionary from the list, add `!` before the name.
  *
  * For example, `!typescript` will turn off the dictionary with the name `typescript`.
  *
  * See the [Dictionaries](https://cspell.org/docs/dictionaries/)
  * and [Custom Dictionaries](https://cspell.org/docs/dictionaries/custom-dictionaries/) for more details.
  */
  dictionaries?: DictionaryReference[];
  /**
  * Optional list of dictionaries that will not be used for suggestions.
  * Words in these dictionaries are considered correct, but will not be
  * used when making spell correction suggestions.
  *
  * Note: if a word is suggested by another dictionary, but found in
  * one of these dictionaries, it will be removed from the set of
  * possible suggestions.
  */
  noSuggestDictionaries?: DictionaryReference[];
  /**
  * List of regular expression patterns or pattern names to exclude from spell checking.
  *
  * Example: `["href"]` - to exclude html href pattern.
  *
  * Regular expressions use JavaScript regular expression syntax.
  *
  * Example: to ignore ALL-CAPS words
  *
  * JSON
  * ```json
  * "ignoreRegExpList": ["/\\b[A-Z]+\\b/g"]
  * ```
  *
  * YAML
  * ```yaml
  * ignoreRegExpList:
  *   - >-
  *    /\b[A-Z]+\b/g
  * ```
  *
  * By default, several patterns are excluded. See
  * [Configuration](https://cspell.org/configuration/patterns) for more details.
  *
  * While you can create your own patterns, you can also leverage several patterns that are
  * [built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).
  */
  ignoreRegExpList?: RegExpPatternList;
  /**
  * List of regular expression patterns or defined pattern names to match for spell checking.
  *
  * If this property is defined, only text matching the included patterns will be checked.
  *
  * While you can create your own patterns, you can also leverage several patterns that are
  * [built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).
  */
  includeRegExpList?: RegExpPatternList;
  /**
  * Defines a list of patterns that can be used with the {@link ignoreRegExpList} and
  * {@link includeRegExpList} options.
  *
  * For example:
  *
  * ```javascript
  * "ignoreRegExpList": ["comments"],
  * "patterns": [
  *   {
  *     "name": "comment-single-line",
  *     "pattern": "/#.*​/g"
  *   },
  *   {
  *     "name": "comment-multi-line",
  *     "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
  *   },
  *   // You can also combine multiple named patterns into one single named pattern
  *   {
  *     "name": "comments",
  *     "pattern": ["comment-single-line", "comment-multi-line"]
  *   }
  * ]
  * ```
  */
  patterns?: RegExpPatternDefinition[];
  /**
  * The set of available substitutions. This is a collection of substitution definitions that can be applied to a document before spell checking.
  * @since 9.7.0
  */
  substitutionDefinitions?: SubstitutionDefinitions;
  /**
  * The set of substitutions to apply to a document before spell checking.
  * @since 9.7.0
  */
  substitutions?: Substitutions;
}
interface LanguageSetting extends LanguageSettingFilterFields, BaseSetting {}
interface LanguageSettingFilterFields extends LanguageSettingFilterFieldsPreferred, LanguageSettingFilterFieldsDeprecated {}
interface LanguageSettingFilterFieldsPreferred {
  /** The language id.  Ex: `typescript`, `html`, or `php`.  `*` -- will match all languages. */
  languageId: MatchingFileType;
  /** The locale filter, matches against the language. This can be a comma separated list. `*` will match all locales. */
  locale?: LocaleId | LocaleId[];
}
interface LanguageSettingFilterFieldsDeprecated {
  /** The language id.  Ex: `typescript`, `html`, or `php`.  `*` -- will match all languages. */
  languageId: MatchingFileType;
  /**
  * Deprecated - The locale filter, matches against the language. This can be a comma separated list. `*` will match all locales.
  * @deprecated true
  * @deprecationMessage Use `locale` instead.
  */
  local?: LocaleId | LocaleId[];
}
/** @hidden */
type InternalRegExp = RegExp;
type Pattern = string | InternalRegExp;
type PredefinedPatterns = "Base64" | "Base64MultiLine" | "Base64SingleLine" | "CStyleComment" | "CStyleHexValue" | "CSSHexValue" | "CommitHash" | "CommitHashLink" | "Email" | "EscapeCharacters" | "HexValues" | "href" | "PhpHereDoc" | "PublicKey" | "RsaCert" | "SshRsa" | "SHA" | "HashStrings" | "SpellCheckerDisable" | "SpellCheckerDisableBlock" | "SpellCheckerDisableLine" | "SpellCheckerDisableNext" | "SpellCheckerIgnoreInDocSetting" | "string" | "UnicodeRef" | "Urls" | "UUID" | "Everything";
/** This matches the name in a pattern definition. */
type PatternId = string;
/** A PatternRef is a Pattern or PatternId. */
type PatternRef = Pattern | PatternId | PredefinedPatterns;
/** A list of pattern names or regular expressions. */
type RegExpPatternList = PatternRef[];
/** This is a written language locale like: `en`, `en-GB`, `fr`, `es`, `de` or `en,fr` for both English and French */
type LocaleId = string;
/**
* Configuration File Version.
*/
type VersionLatest = "0.2";
/**
* Legacy Configuration File Versions.
* @deprecated true
* @deprecationMessage Use `0.2` instead.
*/
type VersionLegacy = "0.1";
type Version = VersionLatest | VersionLegacy;
/**
* @deprecated true
* @deprecationMessage Use `LocaleId` instead.
*/
type LocalId = LocaleId;
/** These are glob expressions. */
type Glob = SimpleGlob | GlobDef;
/** Simple Glob string, the root will be globRoot. */
type SimpleGlob = string;
/**
* Used to define fully qualified glob patterns.
* It is currently hidden to make the json-schema a bit easier to use
* when crafting cspell.json files by hand.
* @hidden
*/
interface GlobDef {
  /** Glob pattern to match. */
  glob: string;
  /** Optional root to use when matching the glob. Defaults to current working dir. */
  root?: string;
  /**
  * Optional source of the glob, used when merging settings to determine the origin.
  * @hidden
  */
  source?: string;
}
/**
* A file type:
* - `*` - will match ALL file types.
* - `typescript`, `cpp`, `json`, etc.
* @pattern ^(!?[-\w_\s]+)|(\*)$
*/
type LanguageIdSingle = string;
/**
* A single string with a comma separated list of file types:
* - `typescript,cpp`
* - `json,jsonc,yaml`
* - etc.
* @pattern ^([-\w_\s]+)(,[-\w_\s]+)*$
*/
type LanguageIdMultiple = string;
/**
* A Negative File Type used to exclude files of that type.
* - `!typescript` - will exclude typescript files.
* - `!cpp,!json` - will exclude cpp and json files.
* - `!typescript,javascript` - will exclude typescript files and include javascript files.
* @pattern ^(![-\w_\s]+)(,!?[-\w_\s]+)*$
*/
type LanguageIdMultipleNeg = string;
type LanguageId = LanguageIdSingle | LanguageIdMultiple | LanguageIdMultipleNeg;
type MatchingFileType = LanguageId | LanguageId[];
/**
* A File System Path. Relative paths are relative to the configuration file.
*/
type FsPath = string;
/**
* A File System Path.
*
* Special Properties:
* - `${cwd}` prefix - will be replaced with the current working directory.
* - Relative paths are relative to the configuration file.
*/
type FSPathResolvable = FsPath;
/** Trust Security Level. */
type TrustLevel = "trusted" | "untrusted";
interface RegExpPatternDefinition {
  /**
  * Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
  * It is possible to redefine one of the predefined patterns to override its value.
  */
  name: PatternId;
  /**
  * RegExp pattern or array of RegExp patterns.
  */
  pattern: Pattern | Pattern[];
  /**
  * Description of the pattern.
  */
  description?: string | undefined;
}
type CSpellUserSettingsWithComments = CSpellUserSettings;
type Source = FileSource | MergeSource | InMemorySource | BaseSource;
interface FileSource extends BaseSource {
  /** Name of source. */
  name: string;
  /** Filename if this came from a file. */
  filename: string;
  /** The two settings that were merged to. */
  sources?: undefined;
  /** The configuration read. */
  fileSource: CSpellSettings;
}
interface MergeSource extends BaseSource {
  /** Name of source. */
  name: string;
  /** Filename if this came from a file. */
  filename?: undefined;
  /** The two settings that were merged to. */
  sources: [CSpellSettings] | [CSpellSettings, CSpellSettings];
  /** The configuration read. */
  fileSource?: undefined;
}
interface InMemorySource extends BaseSource {
  /** Name of source. */
  name: string;
  /** Filename if this came from a file. */
  filename?: undefined;
  /** The two settings that were merged to. */
  sources?: undefined;
  /** The configuration read. */
  fileSource?: undefined;
}
interface BaseSource {
  /** Name of source. */
  name: string;
  /** Filename if this came from a file. */
  filename?: string | undefined;
  /** The two settings that were merged to. */
  sources?: [CSpellSettings] | [CSpellSettings, CSpellSettings] | undefined;
  /** The configuration read. */
  fileSource?: CSpellSettings | undefined;
}
/**
* The module or path to the the reporter to load.
*/
type ReporterModuleName = string;
/**
* Options to send to the reporter. These are defined by the reporter.
*/
type ReporterOptions = Serializable;
/**
* Declare a reporter to use.
*
* `default` - is a special name for the default cli reporter.
*
* Examples:
* - `"default"` - to use the default reporter
* - `"@cspell/cspell-json-reporter"` - use the cspell JSON reporter.
* - `["@cspell/cspell-json-reporter", { "outFile": "out.json" }]`
*/
type ReporterSettings = ReporterModuleName | [name: ReporterModuleName] | [name: ReporterModuleName, options: ReporterOptions];
/**
* Experimental Configuration / Options
*
* This Configuration is subject to change without warning.
* @experimental
* @hidden
*/
interface ExperimentalFileSettings {
  /**
  * Future Plugin support
  * @experimental
  * @since 6.2.0
  */
  plugins?: Plugin[];
}
/**
* Extends CSpellSettings with {@link ExperimentalFileSettings}
* @experimental
* @hidden
*/
interface AdvancedCSpellSettings extends CSpellSettings, ExperimentalFileSettings {}
/**
* Experimental Configuration / Options
*
* This Configuration is subject to change without warning.
* @experimental
* @hidden
*/
interface ExperimentalBaseSettings {
  /**
  * Parser to use for the file content
  * @experimental
  * @since 6.2.0
  */
  parser?: ParserName;
}
/**
* Plugin API
* @experimental
* @since 6.2.0
*/
interface Plugin {
  parsers?: Parser[];
}
/**
* Semantic Version Predicate
*
* Examples:
* - `>=8`
*/
type SemVersionPredicate = string;
/**
* Engine version predicates.
*
* This allows dictionaries and other components to specify the versions of engines (like cspell) they are compatible with.
*
* @since 9.6.3
*/
interface CompatibleEngineVersions {
  /**
  * CSpell version predicate.
  * @since 9.6.3
  */
  cspell?: SemVersionPredicate | undefined;
  /**
  * The VSCode Spell Checker version predicate.
  * @since 9.6.3
  */
  "code-spell-checker"?: SemVersionPredicate | undefined;
  /**
  * Other engine version predicates.
  */
  [engine: string]: SemVersionPredicate | undefined;
}
//#endregion
//#region src/configFields.d.ts
type ConfigKeys = Exclude<keyof CSpellUserSettings, "$schema" | "version" | "id">;
type CSpellUserSettingsFields = { [key in ConfigKeys]: key };
declare const ConfigFields: CSpellUserSettingsFields;
//#endregion
//#region src/defaultConfigSettings.d.ts
declare const defaultCSpellSettings: {
  readonly ignoreRandomStrings: boolean;
  readonly minRandomLength: number;
};
//#endregion
//#region src/defineConfig.d.ts
declare function defineConfig(config: CSpellSettings): CSpellSettings;
//#endregion
//#region src/merge.d.ts
declare function mergeConfig(settings: CSpellSettings[]): CSpellSettings;
declare function mergeConfig(...settings: [CSpellSettings, ...CSpellSettings[]]): CSpellSettings;
declare function mergeConfig(...settings: [CSpellSettings[], ...CSpellSettings[]]): CSpellSettings;
//#endregion
export { type AdvancedCSpellSettings, type AdvancedCSpellSettingsWithSourceTrace, type BaseSetting, type CSpellPackageSettings, type CSpellReporter, type CSpellReporterEmitters, type CSpellReporterModule, type CSpellSettings, type CSpellSettingsWithSourceTrace, type CSpellUserSettings, type CSpellUserSettingsFields, type CSpellUserSettingsWithComments, type CSpellVFS, type CSpellVFSBinaryData, type CSpellVFSData, type CSpellVFSFile, type CSpellVFSFileEntry, type CSpellVFSFileUrl, type CSpellVFSTextData, type CacheFormat, type CacheSettings, type CacheStrategy, type CharacterSet, type CharacterSetCosts, type CommandLineSettings, ConfigFields, type CustomDictionaryPath, type CustomDictionaryScope, type DebugEmitter, type DictionaryDefinition, type DictionaryDefinitionAlternate, type DictionaryDefinitionAugmented, type DictionaryDefinitionBase, type DictionaryDefinitionCustom, type DictionaryDefinitionInline, type DictionaryDefinitionInlineFlagWords, type DictionaryDefinitionInlineIgnoreWords, type DictionaryDefinitionInlineWords, type DictionaryDefinitionLegacy, type DictionaryDefinitionPreferred, type DictionaryDefinitionSimple, type DictionaryFileTypes, type DictionaryId, type DictionaryInformation, type DictionaryNegRef, type DictionaryPath, type DictionaryRef, type DictionaryReference, type EditCosts, type ErrorEmitter, type ErrorLike, type ExperimentalBaseSettings, type ExperimentalFileSettings, type ExtendableSettings, type FSPathResolvable, type Feature, type Features, type FeaturesSupportedByReporter, type FileSettings, type FileSource, type FsPath, type Glob, type GlobDef, type ImportFileRef, type InMemorySource, type Issue, IssueType, type LanguageId, type LanguageIdMultiple, type LanguageIdMultipleNeg, type LanguageIdSingle, type LanguageSetting, type LanguageSettingFilterFields, type LanguageSettingFilterFieldsDeprecated, type LanguageSettingFilterFieldsPreferred, type LegacySettings, type LocalId, type LocaleId, type MappedText, type MatchingFileType, type MergeSource, type MessageEmitter, type MessageType, type MessageTypeLookup, MessageTypes, type OverrideFilterFields, type OverrideSettings, type ParseResult, type ParsedText, type Parser, type ParserName, type ParserOptions, type Pattern, type PatternId, type PatternRef, type Plugin, type PnPSettings, type PredefinedPatterns, type ProgressBase, type ProgressEmitter, type ProgressFileBase, type ProgressFileBegin, type ProgressFileComplete, type ProgressItem, type ProgressTypes, type Range, type RegExpPatternDefinition, type RegExpPatternList, type ReplaceEntry, type ReplaceMap, type ReportIssueOptions, type ReporterConfiguration, type ReporterSettings, type ReportingConfiguration, type ResultEmitter, type RunResult, type Settings, type SimpleGlob, type Source, type SourceMap, type SpellingErrorEmitter, type SubstitutionDefinition, type SubstitutionDefinitions, type SubstitutionEntry, type SubstitutionID, type Substitutions, type SuggestionCostMapDef, type SuggestionCostsDefs, type SuggestionsConfiguration, type TextDocumentOffset, type TextOffset, type TrustLevel, type UnknownWordsChoices, type UnknownWordsConfiguration, type Version, type VersionLatest, type VersionLegacy, type WorkspaceTrustSettings, defaultCSpellSettings, defineConfig, mergeConfig, unknownWordsChoices };