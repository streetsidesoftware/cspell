//#endregion
//#region src/lib/clearCachedFiles.d.ts
/**
* Clear the cached files and other cached data.
* Calling this function will cause the next spell check to take longer because it will need to reload configuration files and dictionaries.
* Call this function if configuration files have changed.
*
* It is safe to replace {@link clearCachedFiles} with {@link clearCaches}
*/
declare function clearCachedFiles(): Promise<void>;
/**
* Sends and event to clear the caches.
* It resets the configuration files and dictionaries.
*
* It is safe to replace {@link clearCaches} with {@link clearCachedFiles}
*/
declare function clearCaches(): void;
//#endregion
//#region src/lib/util/IUri.d.ts
interface Uri {
  readonly scheme: string;
  readonly path: string;
  readonly authority?: string;
  readonly fragment?: string;
  readonly query?: string;
}
type DocumentUri = Uri | URL | string;
//#endregion
//#region src/lib/Document/Document.d.ts
interface Document {
  uri: UriString;
  text?: string;
  languageId?: string;
  locale?: string;
}
type UriString = string;
interface DocumentWithText extends Document {
  text: string;
}
//#endregion
//#region src/lib/Document/isBinaryDoc.d.ts
declare function isBinaryFile(filename: Uri | URL | string, languageId?: string | string[], text?: string): boolean;
//#endregion
//#region src/lib/Models/TextDocument.d.ts
interface Position {
  /**
  * The line number (zero-based).
  */
  line: number;
  /**
  * The zero based offset from the beginning of the line.
  * Note: surrogate pairs are counted as two characters.
  */
  character: number;
}
/**
* Range offset tuple.
*/
type SimpleRange$1 = [start: number, end: number];
interface TextDocumentLine {
  readonly text: string;
  readonly offset: number;
  readonly position: Position;
}
interface TextDocumentRef {
  /**
  * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
  * represent files on disk. However, some documents may have other schemes indicating that they are not
  * available on disk.
  */
  readonly uri: DocumentUri;
  /**
  * The identifier of the language associated with this document.
  */
  readonly languageId?: string | string[] | undefined;
  /**
  * the raw Document Text
  */
  readonly text?: string | undefined;
  /**
  * The natural language locale.
  */
  readonly locale?: string | undefined;
}
/**
* A simple text document. Not to be implemented. The document keeps the content
* as string.
*/
interface TextDocument {
  /**
  * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
  * represent files on disk. However, some documents may have other schemes indicating that they are not
  * available on disk.
  */
  readonly uri: DocumentUri;
  /**
  * The identifier of the language associated with this document.
  */
  readonly languageId: string | string[];
  /**
  * The version number of this document (it will increase after each
  * change, including undo/redo).
  */
  readonly version: number;
  /**
  * the raw Document Text
  */
  readonly text: string;
  /**
  * The natural language locale.
  */
  readonly locale?: string | undefined;
  positionAt(offset: number): Position;
  offsetAt(position: Position): number;
  lineAt(offset: number): TextDocumentLine;
  getLine(lineNum: number): TextDocumentLine;
  getLines(): Iterable<TextDocumentLine>;
}
interface CreateTextDocumentParams {
  uri: DocumentUri | string;
  content: string;
  languageId?: string | string[] | undefined;
  locale?: string | undefined;
  version?: number | undefined;
}
interface TextDocumentContentChangeEvent {
  range?: SimpleRange$1;
  text: string;
}
declare function createTextDocument({
  uri,
  content,
  languageId,
  locale,
  version
}: CreateTextDocumentParams): TextDocument;
declare function updateTextDocument(doc: TextDocument, edits: TextDocumentContentChangeEvent[], version?: number): TextDocument;
//#endregion
//#region src/lib/Document/resolveDocument.d.ts
declare function fileToDocument(file: string): Document;
declare function fileToDocument(file: string, text: string, languageId?: string, locale?: string): DocumentWithText;
declare function fileToDocument(file: string, text?: string, languageId?: string, locale?: string): Document | DocumentWithText;
declare function fileToTextDocument(file: string): Promise<TextDocument>;
//#endregion
//#region ../cspell-types/dist/Parser/index.d.mts
//#region src/Parser/index.d.ts
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
interface ParsedText {
  /**
  * The text extracted and possibly transformed
  */
  readonly text: string;
  /**
  * The raw text before it has been transformed
  */
  readonly rawText?: string | undefined;
  /**
  * start and end offsets of the text
  */
  readonly range: Range$1;
  /**
  * The Scope annotation for a segment of text.
  * Used by the spell checker to apply spell checking options
  * based upon the value of the scope.
  */
  readonly scope?: Scope | undefined;
  /**
  * The source map is used to support text transformations.
  *
  * See: {@link SourceMap}
  */
  readonly map?: SourceMap | undefined;
  /**
  * Used to delegate parsing the contents of `text` to another parser.
  *
  */
  readonly delegate?: DelegateInfo | undefined;
}
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
* Offsets start a 0
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
type Range$1 = readonly [start: number, end: number];
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
//#endregion
//#region ../cspell-types/dist/index.d.mts
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
  length?: number;
}
interface TextDocumentOffset extends TextOffset {
  uri?: string;
  doc: string;
  row: number;
  col: number;
  line: TextOffset;
}
//#endregion
//#region src/CSpellReporter.d.ts
interface Suggestion$1 {
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
  suggestionsEx?: Suggestion$1[] | undefined;
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
  directive = 1,
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
  * Configure CSpell features.
  *
  * @since 5.16.0
  */
  features?: Features;
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
  * and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.
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
//#region src/TextMap.d.ts
type MappedText = Readonly<TransformedText>;
type Range = readonly [start: number, end: number];
interface Mapped {
  /**
  * `(i, j)` number pairs where
  * - `i` is the offset in the source
  * - `j` is the offset in the destination
  *
  * Example:
  * - source text = `"caf\xe9"`
  * - mapped text = `"café"`
  * - map = `[3, 3, 7, 4]`, which is equivalent to `[0, 0, 3, 3, 7, 4]`
  *   where the `[0, 0]` is unnecessary.
  *
  */
  map: number[];
}
interface TransformedText extends PartialOrUndefined<Mapped> {
  /**
  * Transformed text with an optional map.
  */
  text: string;
  /**
  * The original text
  */
  rawText?: string | undefined;
  /**
  * The start and end offset of the text in the document.
  */
  range: Range;
}
type PartialOrUndefined<T> = { [P in keyof T]?: T[P] | undefined };
//#endregion
declare namespace exclusionHelper_d_exports {
  export { ExcludeFilesGlobMap, ExclusionFunction, FileExclusionFunction, extractGlobsFromExcludeFilesGlobMap, generateExclusionFunctionForFiles, generateExclusionFunctionForUri };
}
type ExclusionFunction = (fileUri: string) => boolean;
type FileExclusionFunction = (file: string) => boolean;
/** The structure of the VS Code search.exclude settings */
interface ExcludeFilesGlobMap {
  [glob: string]: boolean;
}
declare function extractGlobsFromExcludeFilesGlobMap(globMap: ExcludeFilesGlobMap): string[];
/**
* @todo Support multi root globs.
* @param globs - glob patterns
* @param root - root directory
* @param allowedSchemes - allowed schemas
*/
declare function generateExclusionFunctionForUri(globs: Glob[], root: string, allowedSchemes?: Set<string>): ExclusionFunction;
/**
* @todo Support multi root globs.
* @param globs - glob patterns
* @param root - root directory
* @param allowedSchemes - allowed schemas
*/
declare function generateExclusionFunctionForFiles(globs: Glob[], root: string): FileExclusionFunction;
//#endregion
//#region src/lib/FeatureFlags/FeatureFlags.d.ts
interface FeatureFlag {
  name: string;
  description: string;
}
type FlagTypes = string | boolean;
/**
* Feature Flags are used to turn on/off features.
* These are primarily used before a feature has been fully released.
*/
declare class FeatureFlags {
  private flags;
  private flagValues;
  constructor(flags?: FeatureFlag[]);
  register(flag: FeatureFlag): this;
  register(name: string, description: string): this;
  getFlag(flag: string): FlagTypes | undefined;
  getFlagBool(flag: string): boolean | undefined;
  setFlag(flag: string, value?: FlagTypes): this;
  getFlagInfo(flag: string): FeatureFlag | undefined;
  getFlags(): FeatureFlag[];
  getFlagValues(): Map<string, FlagTypes>;
  reset(): this;
}
declare class UnknownFeatureFlagError extends Error {
  readonly flag: string;
  constructor(flag: string);
}
declare function getSystemFeatureFlags(): FeatureFlags;
//#endregion
//#region ../cspell-io/dist/index.d.ts
//#region src/async/asyncIterable.d.ts
/**
* Reads an entire iterable and converts it into a promise.
* @param asyncIterable the async iterable to wait for.
*/
declare function toArray<T>(asyncIterable: AsyncIterable<T> | Iterable<T> | Iterable<Promise<T>>): Promise<T[]>;
//#endregion
//#region src/models/BufferEncoding.d.ts
type TextEncoding = "utf-8" | "utf8" | "utf16le" | "utf16be" | "utf-16le" | "utf-16be";
type BufferEncoding$1 = "base64" | "base64url" | "hex" | TextEncoding;
//#endregion
//#region src/models/FileResource.d.ts
interface FileReference {
  /**
  * The URL of the File
  */
  readonly url: URL;
  /**
  * The filename of the file if known.
  * Useful for `data:` urls.
  */
  readonly baseFilename?: string | undefined;
  /**
  * The encoding to use when reading the file.
  */
  readonly encoding?: BufferEncoding$1 | undefined;
  /**
  * - `true` if the content had been gzip compressed.
  * - `false` if the content was NOT gzip compressed.
  * - `undefined` if it is unknown
  */
  readonly gz?: boolean | undefined;
}
interface FileResource extends FileReference {
  /**
  * The contents of the file
  */
  readonly content: string | Uint8Array<ArrayBuffer>;
}
interface TextFileResource extends FileResource {
  /**
  * Extract the text of the file.
  * @param encoding - optional encoding to use when decoding the content.
  *   by default it uses the encoding of the file if one was specified, otherwise it uses `utf8`.
  *   If the content is a string, then the encoding is ignored.
  */
  getText(encoding?: BufferEncoding$1): string;
  /**
  * Get the bytes of the file.
  * @param gunzip - gunzip the data.
  *   - `true` to gunzip the data before returning it.
  *   - `false` to return the data as is.
  *   - `undefined` to gunzip the data if the file is marked as gzipped.
  * @returns the bytes of the file.
  */
  getBytes(gunzip?: boolean): Promise<Uint8Array<ArrayBuffer>>;
}
//#endregion
//#region src/models/Stats.d.ts
/**
* Subset of definition from the Node definition to avoid a dependency upon a specific version of Node
*/
interface Stats {
  /**
  * Size of file in byes, -1 if unknown.
  */
  size: number;
  /**
  * Modification time, 0 if unknown.
  */
  mtimeMs: number;
  /**
  * Used by web requests to see if a resource has changed.
  */
  eTag?: string | undefined;
  /**
  * The file type.
  */
  fileType?: FileType | undefined;
}
declare enum FileType {
  /**
  * The file type is unknown.
  */
  Unknown = 0,
  /**
  * A regular file.
  */
  File = 1,
  /**
  * A directory.
  */
  Directory = 2,
  /**
  * A symbolic link.
  */
  SymbolicLink = 64,
}
interface DirEntry {
  name: string;
  dir: URL;
  fileType: FileType;
}
//#endregion
//#region src/common/stat.d.ts
/**
* Compare two Stats to see if they have the same value.
* @param left - Stats
* @param right - Stats
* @returns 0 - equal; 1 - left > right; -1 left < right
*/

//#endregion
//#region src/models/disposable.d.ts
interface Disposable {
  dispose(): void;
}
//#endregion
//#region src/common/urlOrReferenceToUrl.d.ts

//#endregion
//#region src/VFileSystem.d.ts
type UrlOrReference = URL | FileReference;
declare enum FSCapabilityFlags {
  None = 0,
  Stat = 1,
  Read = 2,
  Write = 4,
  ReadWrite = 6,
  ReadDir = 8,
  WriteDir = 16,
  ReadWriteDir = 24,
}
interface FileSystemProviderInfo {
  name: string;
}
interface ReadFileOptions {
  signal?: AbortSignal;
  encoding?: BufferEncoding$1;
}
interface VFileSystemCore {
  /**
  * Read a file.
  * @param url - URL to read
  * @param encoding - optional encoding
  * @returns A FileResource, the content will not be decoded. Use `.getText()` to get the decoded text.
  */
  readFile(url: UrlOrReference, encoding: BufferEncoding$1): Promise<TextFileResource>;
  /**
  * Read a file.
  * @param url - URL to read
  * @param options - options for reading the file.
  * @returns A FileResource, the content will not be decoded. Use `.getText()` to get the decoded text.
  */
  readFile(url: UrlOrReference, options?: ReadFileOptions | BufferEncoding$1): Promise<TextFileResource>;
  /**
  * Write a file
  * @param file - the file to write
  */
  writeFile(file: FileResource): Promise<FileReference>;
  /**
  * Get the stats for a url.
  * @param url - Url to fetch stats for.
  */
  stat(url: UrlOrReference): Promise<VfsStat>;
  /**
  * Read the directory entries for a url.
  * The url should end with `/` to indicate a directory.
  * @param url - the url to read the directory entries for.
  */
  readDirectory(url: URL): Promise<VfsDirEntry[]>;
  /**
  * Get the capabilities for a URL.
  * The capabilities can be more restrictive than the general capabilities of the provider.
  * @param url - the url to try
  */
  getCapabilities(url: URL): FSCapabilities;
  /**
  * Information about the provider.
  * It is up to the provider to define what information is available.
  */
  providerInfo: FileSystemProviderInfo;
  /**
  * Indicates that a provider was found for the url.
  */
  hasProvider: boolean;
}
interface VFileSystem extends VFileSystemCore {
  findUp(name: string | string[] | VFindUpPredicate, from: URL, options?: VFindUpURLOptions): Promise<URL | undefined>;
}
interface FSCapabilities {
  readonly flags: FSCapabilityFlags;
  readonly readFile: boolean;
  readonly writeFile: boolean;
  readonly readDirectory: boolean;
  readonly writeDirectory: boolean;
  readonly stat: boolean;
}
interface VfsStat extends Stats {
  isDirectory(): boolean;
  isFile(): boolean;
  isUnknown(): boolean;
  isSymbolicLink(): boolean;
}
interface VfsDirEntry extends DirEntry {
  isDirectory(): boolean;
  isFile(): boolean;
  isUnknown(): boolean;
  isSymbolicLink(): boolean;
}
type VFindEntryType = "file" | "directory" | "!file" | "!directory";
interface VFindUpURLOptions {
  type?: VFindEntryType;
  stopAt?: URL | URL[];
}
type VFindUpPredicate = (dir: URL) => URL | undefined | Promise<URL | undefined>;
//#endregion
//#region src/VirtualFS.d.ts
type NextProvider = (url: URL) => VProviderFileSystem | undefined;
interface VirtualFS extends Disposable {
  registerFileSystemProvider(provider: VFileSystemProvider, ...providers: VFileSystemProvider[]): Disposable;
  /**
  * Get the fs for a given url.
  */
  getFS(url: URL): VFileSystem;
  /**
  * The file system. All requests will first use getFileSystem to get the file system before making the request.
  */
  readonly fs: Required<VFileSystem>;
  /**
  * The file system core. All requests will first use getFileSystem to get the file system before making the request.
  */
  readonly fsc: Required<VFileSystemCore>;
  /**
  * Clear the cache of file systems.
  */
  reset(): void;
  /**
  * Indicates that logging has been enabled.
  */
  loggingEnabled: boolean;
  enableLogging(value?: boolean): void;
}
interface OptionAbort {
  signal?: AbortSignal;
}
type VProviderFileSystemReadFileOptions = OptionAbort;
interface VProviderFileSystem extends Disposable {
  readFile(url: UrlOrReference, options?: VProviderFileSystemReadFileOptions): Promise<FileResource>;
  writeFile(file: FileResource): Promise<FileReference>;
  /**
  * Information about the provider.
  * It is up to the provider to define what information is available.
  */
  providerInfo: FileSystemProviderInfo;
  stat(url: UrlOrReference): Stats | Promise<Stats>;
  readDirectory(url: URL): Promise<DirEntry[]>;
  /**
  * These are the general capabilities for the provider's file system.
  * It is possible for a provider to support more capabilities for a given url by providing a getCapabilities function.
  */
  capabilities: FSCapabilityFlags;
  /**
  * Get the capabilities for a URL. Make it possible for a provider to support more capabilities for a given url.
  * These capabilities should be more restrictive than the general capabilities.
  * @param url - the url to try
  * @returns the capabilities for the url.
  */
  getCapabilities?: (url: URL) => FSCapabilities;
}
interface VFileSystemProvider extends Partial<Disposable> {
  /** Name of the Provider */
  name: string;
  /**
  * Get the file system for a given url. The provider is cached based upon the protocol and hostname.
  * @param url - the url to get the file system for.
  * @param next - call this function to get the next provider to try. This is useful for chaining providers that operate on the same protocol.
  */
  getFileSystem(url: URL, next: NextProvider): VProviderFileSystem | undefined;
}
//#endregion
//#region src/CVirtualFS.d.ts

//#endregion
//#region src/common/BufferEncoding.d.ts
type TextEncodingExtra = "utf-16be" | "utf-16le" | "utf16be" | "utf16le";
type BufferEncodingExt = BufferEncoding$1 | TextEncodingExtra;
//#endregion
//#region src/node/file/fileWriter.d.ts
declare function writeToFile(filename: string, data: string | Iterable<string> | AsyncIterable<string>, encoding?: BufferEncoding$1): Promise<void>;
declare function writeToFileIterable(filename: string, data: Iterable<string> | AsyncIterable<string>, encoding?: BufferEncodingExt): Promise<void>;
//#endregion
//#region src/file/file.d.ts
declare function readFileText(filename: string | URL, encoding?: BufferEncoding$1): Promise<string>;
declare function readFileTextSync(filename: string | URL, encoding?: BufferEncoding$1): string;
//#endregion
//#region src/lib/fileSystem.d.ts
declare function getVirtualFS(): VirtualFS;
//#endregion
//#region ../cspell-filetypes/dist/types.d.ts
type FileTypeId = string;
//#endregion
//#region ../cspell-filetypes/dist/filetypes.d.ts
/**
 * Tries to find a matching language for a given file extension.
 * @param ext - the file extension to look up.
 * @returns an array of language ids that match the extension. The array is empty if no matches are found.
 */
declare function getFileTypesForExt(ext: string): FileTypeId[];
/**
 * Find the matching file types for a given filename.
 * @param filename - the full filename
 * @returns an array of language ids that match the filename. The array is empty if no matches are found.
 */
declare function findMatchingFileTypes(filename: string): FileTypeId[];
//#endregion
//#region ../cspell-trie-lib/dist/index.d.ts
//#endregion
//#region src/lib/distance/weightedMaps.d.ts

/**
* Costs are minimized while penalties are maximized.
*/
interface Cost$1 {
  /**
  * The cost of an operation
  * `c'' = min(c, c')`
  */
  c?: number | undefined;
  /**
  * The penalties applied
  * `p'' = max(p, p')`
  */
  p?: number | undefined;
}
interface TrieCost extends Cost$1 {
  /** nested trie nodes */
  n?: Record<string, TrieCost>;
}
interface TrieTrieCost {
  /** nested trie nodes */
  n?: Record<string, TrieTrieCost>;
  /** root of cost trie */
  t?: Record<string, TrieCost>;
}
interface WeightMap {
  readonly insDel: TrieCost;
  readonly replace: TrieTrieCost;
  readonly swap: TrieTrieCost;
  readonly adjustments: Map<string, PenaltyAdjustment>;
}
interface PenaltyAdjustment {
  /** Penalty Identifier */
  id: string;
  /** RegExp Pattern to match */
  regexp: RegExp;
  /** Penalty to apply */
  penalty: number;
}
//#endregion
//#region src/lib/distance/distance.d.ts
/**
* Calculate the edit distance between any two words.
* Use the Damerau–Levenshtein distance algorithm.
* @param wordA
* @param wordB
* @param editCost - the cost of each edit (defaults to 100)
* @returns the edit distance.
*/

declare const CompoundWordsMethodEnum: {
  /**
  * Do not compound words.
  */
  readonly NONE: 0;
  /**
  * Create word compounds separated by spaces.
  */
  readonly SEPARATE_WORDS: 1;
  /**
  * Create word compounds without separation.
  */
  readonly JOIN_WORDS: 2;
};
type CompoundWordsMethodEnum = typeof CompoundWordsMethodEnum;
type CompoundWordsMethod = CompoundWordsMethodEnum[keyof CompoundWordsMethodEnum];
interface CompoundWordsMethodByName extends CompoundWordsMethodEnum {
  "0": "NONE";
  "1": "SEPARATE_WORDS";
  "2": "JOIN_WORDS";
}
declare const CompoundWordsMethod: CompoundWordsMethodByName;
//#endregion
//#region src/lib/suggestions/genSuggestionsOptions.d.ts
interface GenSuggestionOptionsStrict {
  /**
  * Controls forcing compound words.
  * @default CompoundWordsMethod.NONE
  */
  compoundMethod?: CompoundWordsMethod;
  /**
  * ignore case when searching.
  */
  ignoreCase: boolean;
  /**
  * Maximum number of "edits" allowed.
  * 3 is a good number. Above 5 can be very slow.
  */
  changeLimit: number;
  /**
  * Inserts a compound character between compounded word segments.
  * @default ""
  */
  compoundSeparator?: string;
}
type GenSuggestionOptions = Partial<GenSuggestionOptionsStrict>;
type GenSuggestionOptionsRO = Readonly<GenSuggestionOptions>;
//#endregion
//#region src/lib/suggestions/SuggestionTypes.d.ts
type Cost = number;
type MaxCost = Cost;
interface SuggestionResultBase {
  /** The suggested word */
  word: string;
  /** The edit cost 100 = 1 edit */
  cost: Cost;
  /**
  * This suggestion is the preferred suggestion.
  * Setting this to `true` implies that an auto fix is possible.
  */
  isPreferred?: boolean | undefined;
}
interface SuggestionResult extends SuggestionResultBase {
  /** The suggested word with compound marks, generally a `•` */
  compoundWord?: string | undefined;
}
interface Progress {
  type: "progress";
  /** Number of Completed Tasks so far */
  completed: number;
  /**
  * Number of tasks remaining, this number is allowed to increase over time since
  * completed tasks can generate new tasks.
  */
  remaining: number;
}
type GenerateNextParam = MaxCost | symbol | undefined;
type GenerateSuggestionResult = SuggestionResultBase | Progress | undefined;
/**
* Ask for the next result.
* maxCost - sets the max cost for following suggestions
* This is used to limit which suggestions are emitted.
* If the `iterator.next()` returns `undefined`, it is to request a value for maxCost.
*
* The SuggestionIterator is generally the
*/
type SuggestionGenerator = Generator<GenerateSuggestionResult, void, GenerateNextParam>;
//#endregion
//#region src/lib/suggestions/suggestCollector.d.ts
type FilterWordFn = (word: string, cost: number) => boolean;
interface SuggestionCollector {
  /**
  * Collection suggestions from a SuggestionIterator
  * @param src - the SuggestionIterator used to generate suggestions.
  * @param timeout - the amount of time in milliseconds to allow for suggestions.
  * before sending `symbolStopProcessing`
  * Iterator implementation:
  * @example
  * r = yield(suggestion);
  * if (r === collector.symbolStopProcessing) // ...stop generating suggestions.
  */
  collect: (src: SuggestionGenerator, timeout?: number, filter?: FilterWordFn) => void;
  add: (suggestion: SuggestionResultBase) => SuggestionCollector;
  readonly suggestions: SuggestionResult[];
  readonly changeLimit: number;
  readonly maxCost: number;
  readonly word: string;
  readonly maxNumSuggestions: number;
  readonly includesTies: boolean;
  readonly ignoreCase: boolean;
  readonly genSuggestionOptions: GenSuggestionOptionsRO;
  /**
  * Possible value sent to the SuggestionIterator telling it to stop processing.
  */
  readonly symbolStopProcessing: symbol;
}
//#endregion
//#region ../cspell-dictionary/dist/util/AutoCache.d.ts
interface CacheStats {
  hits: number;
  misses: number;
  swaps: number;
}
//#endregion
//#region ../cspell-dictionary/dist/SpellingDictionary/SuggestOptions.d.ts
interface SuggestOptions {
  /**
   * Compounding Mode.
   * `NONE` is the best option.
   */
  compoundMethod?: CompoundWordsMethod | undefined;
  /**
   * The limit on the number of suggestions to generate. If `allowTies` is true, it is possible
   * for more suggestions to be generated.
   */
  numSuggestions?: number | undefined;
  /**
   * Max number of changes / edits to the word to get to a suggestion matching suggestion.
   */
  numChanges?: number | undefined;
  /**
   * Allow for case-ingestive checking.
   */
  ignoreCase?: boolean | undefined;
  /**
   * If multiple suggestions have the same edit / change "cost", then included them even if
   * it causes more than `numSuggestions` to be returned.
   * @default false
   */
  includeTies?: boolean | undefined;
  /**
   * Maximum amount of time in milliseconds to allow for generating suggestions.
   */
  timeout?: number | undefined;
}
type SuggestOptionsRO = Readonly<SuggestOptions>;
//#endregion
//#region ../cspell-dictionary/dist/SpellingDictionary/SpellingDictionary.d.ts
interface SearchOptions {
  /**
   * Legacy compounds have been deprecated.
   *
   * @deprecated
   */
  useCompounds?: boolean | number | undefined;
  /**
   * Ignore Case and Accents
   */
  ignoreCase?: boolean | undefined;
}
interface FindOptions extends SearchOptions {
  /**
   * Separate compound words using the specified separator.
   */
  compoundSeparator?: string | undefined;
}
type FindOptionsRO = Readonly<FindOptions>;
interface Suggestion {
  word: string;
  isPreferred?: boolean | undefined;
}
interface PreferredSuggestion extends Suggestion {
  isPreferred: true;
}
interface FindResult {
  /** the text found, otherwise `false` */
  found: string | false;
  /** `true` if it is considered a forbidden word. */
  forbidden: boolean;
  /** `true` if it is a no-suggest word. */
  noSuggest: boolean;
}
type HasOptions = SearchOptions;
type HasOptionsRO = Readonly<HasOptions>;
type IgnoreCaseOption = boolean;
interface SpellingDictionaryOptions {
  repMap?: ReplaceMap | undefined;
  /**
   * The dictionary is case aware.
   */
  caseSensitive?: boolean | undefined;
  /**
   * This is a NO Suggest dictionary used for words to be ignored.
   */
  noSuggest?: boolean | undefined;
  /**
   * Some dictionaries may contain flagged words that are not valid in the language. These are often
   * words that are used in other languages or might be generated through compounding.
   * This setting allows flagged words to be ignored when checking the dictionary.
   * The effect is similar to the word not being in the dictionary.
   */
  ignoreForbiddenWords?: boolean | undefined;
  /**
   * Extra dictionary information used in improving suggestions
   * based upon locale.
   */
  dictionaryInformation?: DictionaryInformation | undefined;
  /**
   * Strip Case and Accents to allow for case insensitive searches and
   * words without accents.
   *
   * Note: this setting only applies to word lists. It has no-impact on trie
   * dictionaries.
   *
   * @default true
   */
  supportNonStrictSearches?: boolean | undefined;
  /**
   * Turns on legacy word compounds.
   * @deprecated
   */
  useCompounds?: boolean | undefined;
  /**
   * Optional WeightMap used to improve suggestions.
   */
  weightMap?: WeightMap | undefined;
}
interface DictionaryInfo {
  /** The name of the dictionary */
  readonly name: string;
  /** The source, filename or URI */
  readonly source: string;
  /** Options */
  readonly options: SpellingDictionaryOptions;
}
type MapWordSingleFn = (word: string) => string;
type MapWordMultipleFn = (word: string) => string[];
interface SpellingDictionary extends DictionaryInfo {
  readonly type: string;
  readonly containsNoSuggestWords: boolean;
  has(word: string, options?: HasOptionsRO): boolean;
  /** A more detailed search for a word, might take longer than `has` */
  find(word: string, options?: FindOptionsRO): FindResult | undefined;
  /**
   * Checks if a word is forbidden.
   * @param word - word to check.
   */
  isForbidden(word: string, ignoreCaseAndAccents?: IgnoreCaseOption): boolean;
  /**
   * No Suggest words are considered correct but will not be listed when
   * suggestions are generated.
   * No Suggest words and "Ignored" words are equivalent. Ignored / no suggest words override forbidden words.
   * @param word - word to check
   * @param options - options
   */
  isNoSuggestWord(word: string, options: HasOptionsRO): boolean;
  /**
   * Generate suggestions for a word
   * @param word - word
   * @param suggestOptions - options
   */
  suggest(word: string, suggestOptions?: SuggestOptionsRO): SuggestionResult[];
  getPreferredSuggestions?: (word: string) => PreferredSuggestion[];
  genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptionsRO): void;
  mapWord?: MapWordSingleFn | undefined;
  /**
   * Generates all possible word combinations by applying `repMap`.
   * This acts a bit like brace expansions in globs.
   * @param word - the word to map
   * @returns array of adjusted words.
   */
  remapWord?: MapWordMultipleFn | undefined;
  readonly size: number;
  readonly isDictionaryCaseSensitive: boolean;
  getErrors?(): Error[];
  /**
   * Get all the terms in the dictionary, they may be formatted according to the dictionary options.
   * @returns the terms in the dictionary.
   */
  terms?: () => Iterable<string>;
}
//#endregion
//#region ../cspell-dictionary/dist/SpellingDictionary/SpellingDictionaryCollection.d.ts
interface SpellingDictionaryCollection extends SpellingDictionary {
  readonly type: 'SpellingDictionaryCollection';
  readonly dictionaries: SpellingDictionary[];
  getErrors(): Error[];
}
declare function createCollection(dictionaries: SpellingDictionary[], name: string, source?: string): SpellingDictionaryCollection;
//#endregion
//#region ../cspell-dictionary/dist/SpellingDictionary/CachingDictionary.d.ts
interface CallStats {
  name: string;
  id: number;
  has: CacheStats;
  isNoSuggestWord: CacheStats;
  isForbidden: CacheStats;
  getPreferredSuggestions: CacheStats;
}
/**
 * Caching Dictionary remembers method calls to increase performance.
 */
interface CachingDictionary {
  name: string;
  id: number;
  has(word: string): boolean;
  isNoSuggestWord(word: string): boolean;
  isForbidden(word: string): boolean;
  stats(): CallStats;
  getPreferredSuggestions(word: string): PreferredSuggestion[] | undefined;
  suggest(word: string, suggestOptions?: SuggestOptionsRO): SuggestionResult[];
}
//#endregion
//#region ../cspell-dictionary/dist/util/IterableLike.d.ts
interface IterableLike<T> {
  [Symbol.iterator]: () => Iterator<T> | IterableIterator<T>;
}
//#endregion
//#region ../cspell-dictionary/dist/SpellingDictionary/createSpellingDictionary.d.ts
/**
 * Create a SpellingDictionary
 * @param wordList - list of words
 * @param name - name of dictionary
 * @param source - filename or uri
 * @param options - dictionary options
 * @returns a Spelling Dictionary
 */
declare function createSpellingDictionary(wordList: readonly string[] | IterableLike<string>, name: string, source: string, options?: SpellingDictionaryOptions | undefined, disableSuggestionsHandling?: boolean): SpellingDictionary;
//#endregion
//#region src/lib/util/types.d.ts
/**
* The keys of an object where the values cannot be undefined.
*/
type OptionalKeys<T> = Exclude<{ [P in keyof T]: T[P] extends Exclude<T[P], undefined> ? never : P }[keyof T], undefined>;
/**
* Allow undefined in optional fields
*/
type OptionalOrUndefined<T> = { [P in keyof T]: P extends OptionalKeys<T> ? T[P] | undefined : T[P] };
//#endregion
//#region src/lib/Models/CSpellSettingsInternalDef.d.ts
declare const SymbolCSpellSettingsInternal: unique symbol;
interface CSpellSettingsInternal extends Omit<AdvancedCSpellSettingsWithSourceTrace, "dictionaryDefinitions"> {
  [SymbolCSpellSettingsInternal]: true;
  dictionaryDefinitions?: DictionaryDefinitionInternal[];
}
interface CSpellSettingsInternalFinalized extends CSpellSettingsInternal {
  parserFn: Parser | undefined;
  finalized: true;
  ignoreRegExpList: RegExp[];
  includeRegExpList: RegExp[];
}
type DictionaryDefinitionCustomUniqueFields = Omit<DictionaryDefinitionCustom, keyof DictionaryDefinitionPreferred>;
type DictionaryDefinitionInternal = DictionaryFileDefinitionInternal | DictionaryDefinitionInlineInternal | DictionaryDefinitionSimpleInternal;
type DictionaryDefinitionInlineInternal = DictionaryDefinitionInline & {
  /** The path to the config file that contains this dictionary definition */
  readonly __source?: string | undefined;
};
type DictionaryDefinitionSimpleInternal = DictionaryDefinitionSimple & {
  /** The path to the config file that contains this dictionary definition */
  readonly __source?: string | undefined;
};
interface DictionaryFileDefinitionInternal extends Readonly<DictionaryDefinitionPreferred>, Readonly<Partial<DictionaryDefinitionCustomUniqueFields>>, Readonly<DictionaryDefinitionAugmented> {
  /**
  * Optional weight map used to improve suggestions.
  */
  readonly weightMap?: WeightMap | undefined;
  /** The path to the config file that contains this dictionary definition */
  readonly __source?: string | undefined;
}
//#endregion
//#region src/lib/SpellingDictionary/Dictionaries.d.ts
declare function refreshDictionaryCache(maxAge?: number): Promise<void>;
//#endregion
//#region src/lib/SpellingDictionary/DictionaryController/DictionaryLoader.d.ts
type LoadOptions = DictionaryDefinitionInternal;
//#endregion
//#region src/lib/SpellingDictionary/SpellingDictionaryError.d.ts
declare class SpellingDictionaryLoadError extends Error {
  readonly uri: string;
  readonly options: LoadOptions;
  readonly cause: Error;
  readonly name: string;
  constructor(uri: string, options: LoadOptions, cause: Error, message: string);
}
declare function isSpellingDictionaryLoadError(e: Error): e is SpellingDictionaryLoadError;
//#endregion
//#region src/lib/getDictionary.d.ts
/**
* Load a dictionary collection defined by the settings.
* @param settings - that defines the dictionaries and the ones to load.
* @returns a dictionary collection that represents all the enabled dictionaries.
*/
declare function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection>;
//#endregion
//#region src/lib/perf/timer.d.ts
interface PerfTimer {
  readonly name: string;
  readonly startTime: number;
  readonly elapsed: number;
  start(): void;
  end(): void;
}
type TimeNowFn = () => number;
declare function createPerfTimer(name: string, onEnd?: (elapsed: number, name: string) => void, timeNowFn?: TimeNowFn): PerfTimer;
//#endregion
//#region src/lib/Settings/CSpellSettingsServer.d.ts
type CSpellSettingsWST$1 = AdvancedCSpellSettingsWithSourceTrace;
type CSpellSettingsWSTO = OptionalOrUndefined<AdvancedCSpellSettingsWithSourceTrace>;
type CSpellSettingsI$1 = CSpellSettingsInternal;
declare function mergeSettings(left: CSpellSettingsWSTO | CSpellSettingsI$1, ...settings: (CSpellSettingsWSTO | CSpellSettingsI$1 | undefined)[]): CSpellSettingsI$1;
declare function mergeInDocSettings(left: CSpellSettingsWSTO, ...rest: CSpellSettingsWSTO[]): CSpellSettingsWST$1;
/**
*
* @param settings - settings to finalize
* @returns settings where all globs and file paths have been resolved.
*/
declare function finalizeSettings(settings: CSpellSettingsWSTO | CSpellSettingsI$1): CSpellSettingsInternalFinalized;
/**
* Return a list of Setting Sources used to create this Setting.
* @param settings the settings to search
*/
declare function getSources(settings: CSpellSettingsWSTO): CSpellSettingsWSTO[];
interface ImportFileRefWithError extends ImportFileRef {
  error: Error;
}
interface ConfigurationDependencies {
  configFiles: string[];
  dictionaryFiles: string[];
}
declare function extractDependencies(settings: CSpellSettingsWSTO | CSpellSettingsI$1): ConfigurationDependencies;
//#endregion
//#region src/lib/Settings/calcOverrideSettings.d.ts
declare function calcOverrideSettings(settings: CSpellSettingsWSTO, filename: string): CSpellSettingsI$1;
//#endregion
//#region src/lib/globs/checkFilenameMatchesGlob.d.ts
/**
* @param filename - filename
* @param globs - globs
* @returns true if it matches
*/
declare function checkFilenameMatchesExcludeGlob(filename: string, globs: Glob | Glob[]): boolean;
//#endregion
//#region src/lib/Settings/constants.d.ts
declare const configSettingsFileVersion0_2 = "0.2";
declare const currentSettingsFileVersion: typeof configSettingsFileVersion0_2;
declare const ENV_CSPELL_GLOB_ROOT = "CSPELL_GLOB_ROOT";
//#endregion
//#region ../cspell-config-lib/dist/CSpellConfigFile.d.ts
interface ICSpellConfigFile {
  /**
   * The url of the config file, used to resolve imports.
   */
  readonly url: URL;
  /**
   * The settings from the config file.
   */
  readonly settings: CSpellSettings;
  /**
   * Indicate that the config file is readonly.
   */
  readonly?: boolean;
  /**
   * Indicate that the config file is virtual and not associated with a file on disk.
   */
  virtual?: boolean;
  /**
   * Indicate that the config file is remote and not associated with a file on disk.
   */
  remote?: boolean;
}
declare abstract class CSpellConfigFile implements ICSpellConfigFile {
  readonly url: URL;
  constructor(url: URL);
  /**
   * The settings from the config file.
   * Note: this is a copy of the settings from the config file. It should be treated as immutable.
   * For performance reasons, it might not be frozen.
   */
  abstract readonly settings: CSpellSettings;
  /**
   * Helper function to add words to the config file.
   * @param words - words to add to the config file.
   */
  abstract addWords(words: string[]): this;
  /**
   * Tell the config file to remove all comments.
   * This is useful when the config file is being serialized and comments are not needed.
   * @returns this - the config file.
   */
  abstract removeAllComments(): this;
  /**
   * Configure the jason.schema for the config file.
   * @param schema - The schema to set for the config file.
   */
  abstract setSchema(schema: string): this;
  abstract setValue<K$1 extends keyof CSpellSettings>(key: K$1, value: CSpellSettings[K$1]): this;
  /**
   *
   * @param key - the field to set the comment for.
   * @param comment - the comment to set.
   * @param inline - if true, the comment will be set as an inline comment.
   */
  abstract setComment(key: keyof CSpellSettings, comment: string, inline?: boolean): this;
  get readonly(): boolean;
  get virtual(): boolean;
  get remote(): boolean;
}
//#endregion
//#region src/lib/util/resolveFile.d.ts
interface ResolveFileResult {
  /**
  * Absolute path or URL to the file.
  */
  filename: string;
  relativeTo: string | undefined;
  found: boolean;
  /**
  * A warning message if the file was found, but there was a problem.
  */
  warning?: string;
  /**
  * The method used to resolve the file.
  */
  method: string;
}
declare function resolveFile(filename: string | URL, relativeTo: string | URL, fs?: VFileSystem): Promise<ResolveFileResult>;
//#endregion
//#region src/lib/Settings/Controller/pnpLoader.d.ts
type LoaderResult = URL | undefined;
//#endregion
//#region src/lib/Settings/Controller/configLoader/PnPSettings.d.ts
type PnPSettingsOptional = OptionalOrUndefined<PnPSettings>;
//#endregion
//#region src/lib/Settings/Controller/configLoader/types.d.ts
type CSpellSettingsWST = CSpellSettingsWithSourceTrace;
type CSpellSettingsI = CSpellSettingsInternal;
//#endregion
//#region src/lib/Settings/Controller/configLoader/defaultConfigLoader.d.ts
type StopSearchAt = URL | string | (URL | string)[] | undefined;
/**
*
* @param searchFrom the directory / file to start searching from.
* @param options - Optional settings including stop location and Yarn PnP configuration.
* @returns the resulting settings
*/
declare function searchForConfig(searchFrom: URL | string | undefined, options?: SearchForConfigOptions): Promise<CSpellSettingsI | undefined>;
/**
* Load a CSpell configuration files.
* @param file - path or package reference to load.
* @param pnpSettings - PnP settings
* @returns normalized CSpellSettings
*/
declare function loadConfig(file: string, pnpSettings?: PnPSettingsOptional): Promise<CSpellSettingsI>;
declare function readConfigFile(filename: string | URL, relativeTo?: string | URL): Promise<CSpellConfigFile>;
declare function resolveConfigFileImports(configFile: CSpellConfigFile | ICSpellConfigFile): Promise<CSpellSettingsI>;
/**
* Might throw if the settings have not yet been loaded.
* @deprecated use {@link getGlobalSettingsAsync} instead.
*/
declare function getGlobalSettings(): CSpellSettingsI;
/**
* Loads and caches the global settings.
* @returns - global settings
*/
declare function getGlobalSettingsAsync(): Promise<CSpellSettingsI>;
declare function getCachedFileSize(): number;
declare function getDefaultConfigLoader(): IConfigLoader;
declare function readRawSettings(filename: string | URL, relativeTo?: string | URL): Promise<CSpellSettingsWST>;
//#endregion
//#region src/lib/Settings/Controller/configLoader/configLoader.d.ts
declare const sectionCSpell = "cSpell";
declare const defaultFileName = "cspell.json";
interface SearchForConfigFileOptions {
  stopSearchAt?: StopSearchAt;
}
interface SearchForConfigOptions extends SearchForConfigFileOptions, PnPSettingsOptional {}
interface IConfigLoader {
  readSettingsAsync(filename: string | URL, relativeTo?: string | URL, pnpSettings?: PnPSettingsOptional): Promise<CSpellSettingsI>;
  /**
  * Read a cspell configuration file.
  * @param filenameOrURL - URL, relative path, absolute path, or package name.
  * @param relativeTo - optional URL, defaults to `pathToFileURL('./')`
  */
  readConfigFile(filenameOrURL: string | URL, relativeTo?: string | URL): Promise<CSpellConfigFile | Error>;
  searchForConfigFileLocation(searchFrom: URL | string | undefined): Promise<URL | undefined>;
  searchForConfigFile(searchFrom: URL | string | undefined): Promise<CSpellConfigFile | undefined>;
  /**
  * This is an alias for `searchForConfigFile` and `mergeConfigFileWithImports`.
  * @param searchFrom the directory / file URL to start searching from.
  * @param options - Optional settings including stop location and Yarn PnP configuration.
  * @returns the resulting settings
  */
  searchForConfig(searchFrom: URL | string | undefined, options?: SearchForConfigOptions): Promise<CSpellSettingsI | undefined>;
  resolveConfigFileLocation(filenameOrURL: string | URL, relativeTo?: string | URL): Promise<URL | undefined>;
  getGlobalSettingsAsync(): Promise<CSpellSettingsI>;
  /**
  * The loader caches configuration files for performance. This method clears the cache.
  */
  clearCachedSettingsFiles(): void;
  /**
  * Resolve and merge the settings from the imports.
  * This will create a virtual configuration file that is used to resolve the settings.
  * @param settings - settings to resolve imports for
  * @param filename - the path / URL to the settings file. Used to resolve imports.
  */
  resolveSettingsImports(settings: CSpellUserSettings, filename: string | URL): Promise<CSpellSettingsI>;
  /**
  * Resolve imports and merge.
  * @param cfgFile - configuration file.
  * @param pnpSettings - optional settings related to Using Yarn PNP.
  */
  mergeConfigFileWithImports(cfgFile: CSpellConfigFile, pnpSettings?: PnPSettingsOptional | undefined): Promise<CSpellSettingsI>;
  /**
  * Create an in memory CSpellConfigFile.
  * @param filename - URL to the file. Used to resolve imports.
  * @param settings - settings to use.
  */
  createCSpellConfigFile(filename: URL | string, settings: CSpellUserSettings): CSpellConfigFile;
  /**
  * Convert a ICSpellConfigFile into a CSpellConfigFile.
  * If cfg is a CSpellConfigFile, it is returned as is.
  * @param cfg - configuration file to convert.
  */
  toCSpellConfigFile(cfg: ICSpellConfigFile): CSpellConfigFile;
  /**
  * Unsubscribe from any events and dispose of any resources including caches.
  */
  dispose(): void;
  getStats(): Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly isTrusted: boolean;
  setIsTrusted(isTrusted: boolean): void;
}
declare function loadPnP(pnpSettings: PnPSettingsOptional, searchFrom: URL): Promise<LoaderResult>;
declare function createConfigLoader(fs?: VFileSystem): IConfigLoader;
//#endregion
//#region src/lib/Settings/Controller/configLoader/configLocations.d.ts
declare const defaultConfigFilenames: readonly string[];
//#endregion
//#region src/lib/Settings/Controller/configLoader/extractImportErrors.d.ts
declare function extractImportErrors(settings: CSpellSettingsWST): ImportFileRefWithError$1[];
interface ImportFileRefWithError$1 extends ImportFileRef {
  error: Error;
}
//#endregion
//#region src/lib/Settings/Controller/configLoader/readSettings.d.ts
/**
* Read / import a cspell configuration file.
* @param filename - the path to the file.
*   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
*   - absolute path `/absolute/path/to/file`
*   - relative path `./path/to/file` (relative to the current working directory)
*   - package `@cspell/dict-typescript/cspell-ext.json`
*/
declare function readSettings(filename: string | URL): Promise<CSpellSettingsI>;
declare function readSettings(filename: string | URL, pnpSettings: PnPSettingsOptional): Promise<CSpellSettingsI>;
/**
* Read / import a cspell configuration file.
* @param filename - the path to the file.
*   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
*   - absolute path `/absolute/path/to/file`
*   - relative path `./path/to/file` (relative to `relativeTo`)
*   - package `@cspell/dict-typescript/cspell-ext.json` searches for node_modules relative to `relativeTo`
* @param relativeTo - absolute path to start searching for relative files or node_modules.
*/
declare function readSettings(filename: string | URL, relativeTo: string | URL): Promise<CSpellSettingsI>;
declare function readSettings(filename: string | URL, relativeTo: string | URL, pnpSettings: PnPSettingsOptional): Promise<CSpellSettingsI>;
//#endregion
//#region src/lib/Settings/Controller/configLoader/readSettingsFiles.d.ts
/**
*
* @param filenames - settings files to read
* @returns combined configuration
* @deprecated true
*/
declare function readSettingsFiles(filenames: string[]): Promise<CSpellSettingsI>;
//#endregion
//#region src/lib/Settings/Controller/ImportError.d.ts
declare class ImportError extends Error {
  readonly cause: Error | undefined;
  constructor(msg: string, cause?: Error | unknown);
}
//#endregion
//#region src/lib/Settings/DefaultSettings.d.ts
declare function getDefaultSettings(useDefaultDictionaries?: boolean): Promise<CSpellSettingsInternal>;
declare function getDefaultBundledSettingsAsync(): Promise<CSpellSettingsInternal>;
//#endregion
//#region src/lib/Settings/link.d.ts
interface ListGlobalImportsResult {
  filename: string;
  name: string | undefined;
  id: string | undefined;
  error: string | undefined;
  dictionaryDefinitions: CSpellSettingsWithSourceTrace["dictionaryDefinitions"];
  languageSettings: CSpellSettingsWithSourceTrace["languageSettings"];
  package: NodePackage | undefined;
}
interface ListGlobalImportsResults {
  list: ListGlobalImportsResult[];
  globalSettings: CSpellSettingsWithSourceTrace;
}
interface NodePackage {
  name: string | undefined;
  filename: string;
}
declare function listGlobalImports(): Promise<ListGlobalImportsResults>;
interface AddPathsToGlobalImportsResults {
  success: boolean;
  resolvedSettings: ResolveSettingsResult[];
  error: string | undefined;
}
declare function addPathsToGlobalImports(paths: string[]): Promise<AddPathsToGlobalImportsResults>;
interface RemovePathsFromGlobalImportsResult {
  success: boolean;
  error: string | undefined;
  removed: string[];
}
/**
* Remove files from the global setting.
* @param paths match against the partial file path, or package name, or id.
*   To match against a partial file path, it must match against the subdirectory and filename.
* Note: for Idempotent reasons, asking to remove a path that is not in the global settings is considered a success.
*   It is possible to check for this by looking at the returned list of removed paths.
*/
declare function removePathsFromGlobalImports(paths: string[]): Promise<RemovePathsFromGlobalImportsResult>;
interface ResolveSettingsResult {
  filename: string;
  resolvedToFilename: string | undefined;
  error?: string;
  settings: CSpellSettingsWithSourceTrace;
}
declare namespace index_link_d_exports {
  export { AddPathsToGlobalImportsResults, ListGlobalImportsResult, ListGlobalImportsResults, RemovePathsFromGlobalImportsResult, ResolveSettingsResult, addPathsToGlobalImports, listGlobalImports, removePathsFromGlobalImports };
}
//#endregion
//#region src/lib/Settings/TextDocumentSettings.d.ts
declare function combineTextAndLanguageSettings(settings: CSpellUserSettings, text: string | undefined, languageId: string | string[]): CSpellSettingsInternal;
//#endregion
//#region src/lib/Models/Suggestion.d.ts
interface ExtendedSuggestion {
  /**
  * The suggestion.
  */
  word: string;
  /**
  * The word is preferred above others, except other "preferred" words.
  */
  isPreferred?: boolean;
  /**
  * The suggested word adjusted to match the original case.
  */
  wordAdjustedToMatchCase?: string;
  /**
  * The cost of using this word.
  * The lower the cost, the better the suggestion.
  */
  cost?: number;
}
//#endregion
//#region src/lib/Models/ValidationResult.d.ts
interface ValidationResult extends TextOffset, Pick<Issue, "message" | "issueType" | "hasPreferredSuggestions" | "hasSimpleSuggestions"> {
  line: TextOffset;
  isFlagged?: boolean | undefined;
  isFound?: boolean | undefined;
}
//#endregion
//#region src/lib/Models/ValidationIssue.d.ts
interface ValidationIssue extends ValidationResult {
  suggestions?: string[] | undefined;
  suggestionsEx?: ExtendedSuggestion[] | undefined;
}
//#endregion
//#region src/lib/suggestions.d.ts
interface WordSuggestion extends SuggestionResult {
  /**
  * The suggested word adjusted to match the original case.
  */
  wordAdjustedToMatchCase?: string;
}
interface SuggestedWordBase extends WordSuggestion {
  /**
  * dictionary names
  */
  dictionaries: string[];
}
interface SuggestedWord extends SuggestedWordBase {
  noSuggest: boolean;
  forbidden: boolean;
}
interface SuggestionsForWordResult {
  word: string;
  suggestions: SuggestedWord[];
}
type FromSuggestOptions = Pick<SuggestOptions, "numChanges" | "numSuggestions" | "includeTies">;
interface SuggestionOptions extends FromSuggestOptions {
  /**
  * languageId to use when determining file type.
  */
  languageId?: FileTypeId | FileTypeId[];
  /**
  * Locale to use.
  */
  locale?: LocaleId;
  /**
  * Strict case and accent checking
  * @default true
  */
  strict?: boolean;
  /**
  * List of dictionaries to use. If specified, only that list of dictionaries will be used.
  */
  dictionaries?: string[];
  /**
  * The number of suggestions to make.
  * @default 8
  */
  numSuggestions?: number | undefined;
  /**
  * Max number of changes / edits to the word to get to a suggestion matching suggestion.
  * @default 4
  */
  numChanges?: number | undefined;
  /**
  * If multiple suggestions have the same edit / change "cost", then included them even if
  * it causes more than `numSuggestions` to be returned.
  * @default true
  */
  includeTies?: boolean | undefined;
  /**
  * By default we want to use the default configuration, but there are cases
  * where someone might not want that.
  * @default true
  */
  includeDefaultConfig?: boolean;
}
declare function suggestionsForWords(words: Iterable<string> | AsyncIterable<string>, options?: SuggestionOptions, settings?: CSpellSettings): AsyncIterable<SuggestionsForWordResult>;
declare function suggestionsForWord(word: string, options?: SuggestionOptions, settings?: CSpellSettings | ICSpellConfigFile): Promise<SuggestionsForWordResult>;
declare class SuggestionError extends Error {
  readonly code: string;
  constructor(message: string, code: string);
}
//#endregion
//#region src/lib/util/TextRange.d.ts
/**
* A range of text in a document.
* The range is inclusive of the startPos and exclusive of the endPos.
*/
interface MatchRange {
  startPos: number;
  endPos: number;
}
//#endregion
//#region src/lib/textValidation/ValidationTypes.d.ts
type TextOffsetRO = Readonly<TextOffset>;
interface ValidationOptions extends IncludeExcludeOptions, ReportingConfiguration {
  maxNumberOfProblems?: number;
  maxDuplicateProblems?: number;
  minWordLength?: number;
  flagWords?: string[];
  allowCompoundWords?: boolean;
  /** ignore case when checking words against dictionary or ignore words list */
  ignoreCase: boolean;
  ignoreRandomStrings?: boolean | undefined;
  minRandomLength?: number | undefined;
}
interface IncludeExcludeOptions {
  ignoreRegExpList?: RegExp[];
  includeRegExpList?: RegExp[];
}
type LineValidatorFn = (line: LineSegment) => Iterable<ValidationIssue>;
interface LineSegment {
  /** A line from the document, the offset is relative to the beginning of the document. */
  line: TextOffsetRO;
  /** A segment of text from the line, the offset is relative to the beginning of the document. */
  segment: TextOffsetRO;
}
interface MappedTextValidationResult extends MappedText, Pick<Issue, "hasSimpleSuggestions" | "hasPreferredSuggestions" | "isFlagged" | "suggestionsEx"> {
  isFound?: boolean | undefined;
}
type TextValidatorFn = (text: MappedText) => Iterable<MappedTextValidationResult>;
//#endregion
//#region src/lib/textValidation/lineValidatorFactory.d.ts
interface LineValidator {
  fn: LineValidatorFn;
  dict: CachingDictionary;
}
interface TextValidator {
  validate: TextValidatorFn;
  lineValidator: LineValidator;
}
//#endregion
//#region src/lib/textValidation/parsedText.d.ts
type Offset = number;
type SimpleRange = readonly [Offset, Offset];
//#endregion
//#region src/lib/textValidation/traceWord.d.ts
type Href = string;
interface DictionaryTraceResult {
  /** The word being traced. */
  word: string;
  found: boolean;
  /** The word found. */
  foundWord: string | undefined;
  /** Indicates that the word is flagged. */
  forbidden: boolean;
  /** The would should not show up in suggestions, but is considered correct. */
  noSuggest: boolean;
  /** The name of the dictionary. */
  dictName: string;
  /** The path/href to dictionary file. */
  dictSource: string;
  /** Suggested changes to the word. */
  preferredSuggestions?: string[] | undefined;
  /** href to the config file referencing the dictionary. */
  configSource: Href | undefined;
  /** Errors */
  errors?: Error[] | undefined;
}
interface WordSplits {
  word: string;
  found: boolean;
}
interface TraceResult$1 extends Array<DictionaryTraceResult> {
  splits?: readonly WordSplits[];
}
//#endregion
//#region src/lib/textValidation/ValidateTextOptions.d.ts
interface ValidateTextOptions {
  /**
  * Generate suggestions where there are spelling issues.
  */
  generateSuggestions?: boolean;
  /**
  * The number of suggestions to generate. The higher the number the longer it takes.
  */
  numSuggestions?: number;
  /**
  * Verify that the in-document directives are correct.
  */
  validateDirectives?: boolean;
  /**
  * Skips spell checking the document. Useful for testing and dry runs.
  * It will read the configuration and parse the document.
  */
  skipValidation?: boolean;
}
//#endregion
//#region src/lib/textValidation/docValidator.d.ts
interface DocumentValidatorOptions extends ValidateTextOptions {
  /**
  * Optional path to a configuration file.
  * If given, it will be used instead of searching for a configuration file.
  */
  configFile?: string;
  /**
  * Prevents searching for local configuration files
  * By default the spell checker looks for configuration files
  * starting at the location of given filename.
  * If `configFile` is defined it will still be loaded instead of searching.
  * `false` will override the value in `settings.noConfigSearch`.
  * @defaultValue undefined
  */
  noConfigSearch?: boolean;
  /**
  * If `settings: CSpellUserSettings` contains imports, they will be resolved using this path.
  * If not set, the current working directory will be used.
  */
  resolveImportsRelativeTo?: string | URL;
}
type PerfTimings = Record<string, number>;
declare class DocumentValidator {
  readonly settings: CSpellUserSettings;
  private _document;
  private _ready;
  readonly errors: Error[];
  private _prepared;
  private _preparations;
  private _preparationTime;
  private _suggestions;
  readonly options: DocumentValidatorOptions;
  readonly perfTiming: PerfTimings;
  skipValidation: boolean;
  static create(doc: TextDocument, options: DocumentValidatorOptions, settingsOrConfigFile: CSpellUserSettings | ICSpellConfigFile): Promise<DocumentValidator>;
  /**
  * @param doc - Document to validate
  * @param config - configuration to use (not finalized).
  */
  constructor(doc: TextDocument, options: DocumentValidatorOptions, settings: CSpellUserSettings);
  get ready(): boolean;
  prepare(): Promise<void>;
  private _prepareAsync;
  private _updatePrep;
  /**
  * The amount of time in ms to prepare for validation.
  */
  get prepTime(): number;
  get validateDirectives(): boolean;
  /**
  * Check a range of text for validation issues.
  * @param range - the range of text to check.
  * @param _text - the text to check. If not given, the text will be taken from the document.
  * @param scope - the scope to use for validation. If not given, the default scope will be used.
  * @returns the validation issues.
  */
  checkText(range: SimpleRange, _text: string | undefined, scope?: string[] | string): ValidationIssue[];
  check(parsedText: ParsedText): ValidationIssue[];
  /**
  * Check a Document for Validation Issues.
  * @param forceCheck - force a check even if the document would normally be excluded.
  * @returns the validation issues.
  */
  checkDocumentAsync(forceCheck?: boolean): Promise<ValidationIssue[]>;
  /**
  * Check a Document for Validation Issues.
  *
  * Note: The validator must be prepared before calling this method.
  * @param forceCheck - force a check even if the document would normally be excluded.
  * @returns the validation issues.
  */
  checkDocument(forceCheck?: boolean): ValidationIssue[];
  checkDocumentDirectives(forceCheck?: boolean): ValidationIssue[];
  get document(): TextDocument;
  updateDocumentText(text: string): Promise<void>;
  /**
  * Get the calculated ranges of text that should be included in the spell checking.
  * @returns MatchRanges of text to include.
  */
  getCheckedTextRanges(): MatchRange[];
  traceWord(word: string): TraceResult$1;
  private defaultParser;
  private _checkParsedText;
  private addPossibleError;
  private _parse;
  private getSuggestions;
  private genSuggestions;
  private adjustSuggestions;
  getFinalizedDocSettings(): CSpellSettingsInternal;
  getConfigErrors(): ImportFileRefWithError[] | undefined;
  getDictionaryErrors(): Map<string, Error[]> | undefined;
  /**
  * Returns true if the final result of the configuration calculation results
  * in the document being enabled. Note: in some cases, checking the document
  * might still make sense, for example, the `@cspell/eslint-plugin` relies on
  * `eslint` configuration to make that determination.
  * @returns true if the document settings have resolved to be `enabled`
  */
  shouldCheckDocument(): boolean;
  /**
  * Internal `cspell-lib` use.
  */
  _getPreparations(): Preparations | undefined;
}
interface Preparations {
  /** loaded config */
  config: CSpellSettingsInternal;
  dictionary: SpellingDictionaryCollection;
  /** configuration after applying in-doc settings */
  docSettings: CSpellSettingsInternal;
  finalSettings: CSpellSettingsInternalFinalized;
  includeRanges: MatchRange[];
  textValidator: TextValidator;
  segmenter: (texts: MappedText) => Iterable<MappedText>;
  shouldCheck: boolean;
  validateOptions: ValidationOptions;
  localConfig: CSpellUserSettings | undefined;
  localConfigFilepath: string | undefined;
}
interface ShouldCheckDocumentResult {
  /** possible errors found while loading configuration. */
  errors: Error[];
  /**
  * The calculated result:
  * - `false` if the document should not be checked. Based upon the settings.
  * - `true` if the document should be checked.
  */
  shouldCheck: boolean;
  /** final settings used to determine the result. */
  settings: CSpellUserSettings;
  /**
  * The reason the document should not be checked.
  */
  reason?: string | undefined;
}
/**
* Check if a document should be checked based upon the ignorePaths and override settings.
*
* This function will search and fetch settings based upon the location of the document if `noConfigSearch` is not true.
*
* @param doc - document to check
* @param options - options to override some of the settings.
* @param settings - current settings
* @returns ShouldCheckDocumentResult
*/
declare function shouldCheckDocument(doc: TextDocumentRef, options: DocumentValidatorOptions, settings: CSpellUserSettings): Promise<ShouldCheckDocumentResult>;
//#endregion
//#region src/lib/textValidation/checkText.d.ts
/**
* Annotate text with issues and include / exclude zones.
* @param text - the text to annotate.
* @param settings - the settings to use.
* @returns the Check Text result
* @deprecated
*/
declare function checkText(text: string, settings: CSpellUserSettings): Promise<CheckTextInfo>;
interface CheckTextInfo {
  text: string;
  items: TextInfoItem[];
}
interface TextInfoItem {
  text: string;
  startPos: number;
  endPos: number;
  flagIE: IncludeExcludeFlag;
  isError?: boolean;
}
declare enum IncludeExcludeFlag {
  INCLUDE = "I",
  EXCLUDE = "E",
}
interface CheckTextOptions extends DocumentValidatorOptions {}
/**
* Calculate document issues and include / exclude zones.
* @param doc - document to check
* @param options - check options
* @param settings - optional settings
* @returns
*/
declare function checkTextDocument(doc: TextDocument | Document, options: CheckTextOptions, settings?: CSpellUserSettings): Promise<CheckTextInfo>;
//#endregion
//#region src/lib/textValidation/validator.d.ts
/**
* @deprecated
* @deprecationMessage Use spellCheckDocument
*/
declare function validateText(text: string, settings: CSpellUserSettings, options?: ValidateTextOptions): Promise<ValidationIssue[]>;
//#endregion
//#region src/lib/spellCheckFile.d.ts
interface SpellCheckFileOptions extends ValidateTextOptions, Pick<CSpellUserSettings, "unknownWords"> {
  /**
  * Optional path to a configuration file.
  * If given, it will be used instead of searching for a configuration file.
  */
  configFile?: string;
  /**
  * File encoding
  * @defaultValue 'utf-8'
  */
  encoding?: BufferEncoding;
  /**
  * Prevents searching for local configuration files
  * By default the spell checker looks for configuration files
  * starting at the location of given filename.
  * If `configFile` is defined it will still be loaded instead of searching.
  * `false` will override the value in `settings.noConfigSearch`.
  * @defaultValue undefined
  */
  noConfigSearch?: boolean;
}
interface SpellCheckFilePerf extends Record<string, number | undefined> {
  loadTimeMs?: number;
  prepareTimeMs?: number;
  checkTimeMs?: number;
  totalTimeMs?: number;
}
interface SpellCheckFileResult {
  document: Document | DocumentWithText;
  settingsUsed: CSpellSettingsWithSourceTrace;
  localConfigFilepath: string | undefined;
  options: SpellCheckFileOptions;
  issues: ValidationIssue[];
  checked: boolean;
  errors: Error[] | undefined;
  configErrors?: ImportFileRefWithError[] | undefined;
  dictionaryErrors?: Map<string, Error[]> | undefined;
  perf?: SpellCheckFilePerf;
}
/**
* Spell Check a file
* @param file - absolute path to file to read and check.
* @param options - options to control checking
* @param settings - default settings to use.
*/
declare function spellCheckFile(file: string | Uri | URL, options: SpellCheckFileOptions, settingsOrConfigFile: CSpellUserSettings | ICSpellConfigFile): Promise<SpellCheckFileResult>;
/**
* Spell Check a Document.
* @param document - document to be checked. If `document.text` is `undefined` the file will be loaded
* @param options - options to control checking
* @param settings - default settings to use.
*/
declare function spellCheckDocument(document: Document | DocumentWithText, options: SpellCheckFileOptions, settingsOrConfigFile: CSpellUserSettings | ICSpellConfigFile): Promise<SpellCheckFileResult>;
/**
* Spell Check a Document.
* @param document - document to be checked. If `document.text` is `undefined` the file will be loaded
* @param options - options to control checking
* @param settings - default settings to use.
*/
declare function spellCheckDocumentRPC(document: Document | DocumentWithText, options: SpellCheckFileOptions, settingsOrConfigFile: CSpellUserSettings | ICSpellConfigFile): Promise<SpellCheckFileResult>;
interface DetermineFinalDocumentSettingsResult {
  document: DocumentWithText;
  settings: CSpellSettingsWithSourceTrace;
}
/**
* Combines all relevant setting values into a final configuration to be used for spell checking.
* It applies any overrides and appropriate language settings by taking into account the document type (languageId)
* the locale (natural language) and any in document settings.
*
* Note: this method will not search for configuration files. Configuration files should already be merged into `settings`.
* It is NOT necessary to include the cspell defaultSettings or globalSettings. They will be applied within this function.
* @param document - The document to be spell checked. Note: if the URI doesn't have a path, overrides cannot be applied.
*   `locale` - if defined will be used unless it is overridden by an in-document setting.
*   `languageId` - if defined will be used to select appropriate file type dictionaries.
* @param settings - The near final settings. Should already be the combination of all configuration files.
*/
declare function determineFinalDocumentSettings(document: DocumentWithText, settings: CSpellUserSettings): Promise<DetermineFinalDocumentSettingsResult>;
//#endregion
//#region src/lib/trace.d.ts
interface TraceResult extends DictionaryTraceResult {
  /** True if the dictionary is currently active. */
  dictActive: boolean;
}
interface TraceOptions {
  languageId?: FileTypeId | FileTypeId[];
  locale?: LocaleId;
  ignoreCase?: boolean;
  allowCompoundWords?: boolean;
  compoundSeparator?: string | undefined;
}
interface TraceWordResult extends Array<TraceResult> {
  splits: readonly WordSplits[];
}
declare function traceWords(words: string[], settings: CSpellSettings | ICSpellConfigFile, options: TraceOptions | undefined): Promise<TraceResult[]>;
declare function traceWordsAsync(words: Iterable<string> | AsyncIterable<string>, settingsOrConfig: CSpellSettings | ICSpellConfigFile, options: TraceOptions | undefined): AsyncIterableIterator<TraceWordResult>;
//#endregion
//#region src/lib/util/logger.d.ts
type Console = typeof console;
interface Logger {
  log: Console["log"];
  warn: Console["warn"];
  error: Console["error"];
}
/**
* Set the global cspell-lib logger
* @param logger - a logger like `console`
* @returns the old logger.
*/
declare function setLogger(logger: Logger): Logger;
/**
* Get the current cspell-lib logger.
* @returns the current logger.
*/
declare function getLogger(): Logger;
//#endregion
//#region src/lib/util/textRegex.d.ts
declare function stringToRegExp(pattern: string | RegExp, defaultFlags?: string, forceFlags?: string): RegExp | undefined;
//#endregion
//#region src/lib/util/text.d.ts
declare function splitCamelCaseWordWithOffset(wo: TextOffset): TextOffset[];
/**
* Split camelCase words into an array of strings.
*/
declare function splitCamelCaseWord(word: string): string[];
/**
* This function lets you iterate over regular expression matches.
*/
declare function match(reg: RegExp, text: string): Iterable<RegExpExecArray>;
declare function matchStringToTextOffset(reg: RegExp, text: string): Iterable<TextOffset>;
declare function matchToTextOffset(reg: RegExp, t: TextOffset): Iterable<TextOffset>;
declare function extractLinesOfText(text: string): Iterable<TextOffset>;
/**
* Extract out whole words from a string of text.
*/
declare function extractWordsFromText(text: string): Iterable<TextOffset>;
/**
* Extract out whole words from a string of text.
*/
declare function extractWordsFromTextOffset(text: TextOffset): Iterable<TextOffset>;
/**
* Remove Hiragana, Han, Katakana, Hangul characters from the text.
* @param text
* @returns the text with the characters removed.
*/
declare function cleanText(text: string): string;
declare function cleanTextOffset(text: TextOffset): TextOffset;
/**
* Extract out whole words and words containing numbers from a string of text.
*/
declare function extractPossibleWordsFromTextOffset(text: TextOffset): Iterable<TextOffset>;
declare function extractWordsFromCode(text: string): Iterable<TextOffset>;
declare function extractWordsFromCodeTextOffset(textOffset: TextOffset): Iterable<TextOffset>;
declare function isUpperCase(word: string): boolean;
declare function isLowerCase(word: string): boolean;
declare function isFirstCharacterUpper(word: string): boolean;
declare function isFirstCharacterLower(word: string): boolean;
declare function ucFirst(word: string): string;
declare function lcFirst(word: string): string;
declare function snakeToCamel(word: string): string;
declare function camelToSnake(word: string): string;
declare function matchCase(example: string, word: string): string;
declare function textOffset(text: string, offset?: number): TextOffset;
declare function extractText(textOffset: TextOffset, startPos: number, endPos: number): string;
declare function calculateTextDocumentOffsets<T extends TextOffset>(uri: string | Uri | URL, doc: string, wordOffsets: T[]): (TextDocumentOffset & T)[];
declare function removeAccents(text: string): string;
declare namespace textApi_d_exports {
  export { calculateTextDocumentOffsets, camelToSnake, cleanText, cleanTextOffset, extractLinesOfText, extractPossibleWordsFromTextOffset, extractText, extractWordsFromCode, extractWordsFromCodeTextOffset, extractWordsFromText, extractWordsFromTextOffset, isFirstCharacterLower, isFirstCharacterUpper, isLowerCase, isUpperCase, lcFirst, match, matchCase, matchStringToTextOffset, matchToTextOffset, removeAccents, snakeToCamel, splitCamelCaseWord, splitCamelCaseWordWithOffset, stringToRegExp, textOffset, ucFirst };
}
//#endregion
export { type AdvancedCSpellSettings, type AdvancedCSpellSettingsWithSourceTrace, type BaseSetting, type CSpellConfigFile, type CSpellPackageSettings, type CSpellReporter, type CSpellReporterEmitters, type CSpellReporterModule, type CSpellSettings, type CSpellSettingsWithSourceTrace, type CSpellUserSettings, type CSpellUserSettingsFields, type CSpellUserSettingsWithComments, type CacheFormat, type CacheSettings, type CacheStrategy, type CharacterSet, type CharacterSetCosts, CheckTextInfo, type CommandLineSettings, CompoundWordsMethod, ConfigFields, ConfigurationDependencies, CreateTextDocumentParams, type CustomDictionaryPath, type CustomDictionaryScope, type DebugEmitter, DetermineFinalDocumentSettingsResult, type DictionaryDefinition, type DictionaryDefinitionAlternate, type DictionaryDefinitionAugmented, type DictionaryDefinitionBase, type DictionaryDefinitionCustom, type DictionaryDefinitionInline, type DictionaryDefinitionInlineFlagWords, type DictionaryDefinitionInlineIgnoreWords, type DictionaryDefinitionInlineWords, type DictionaryDefinitionLegacy, type DictionaryDefinitionPreferred, type DictionaryDefinitionSimple, type DictionaryFileTypes, type DictionaryId, type DictionaryInformation, type DictionaryNegRef, type DictionaryPath, type DictionaryRef, type DictionaryReference, Document, DocumentValidator, DocumentValidatorOptions, ENV_CSPELL_GLOB_ROOT, type EditCosts, type ErrorEmitter, type ErrorLike, ExcludeFilesGlobMap, ExclusionFunction, exclusionHelper_d_exports as ExclusionHelper, type ExperimentalBaseSettings, type ExperimentalFileSettings, type ExtendableSettings, FSCapabilityFlags, type FSPathResolvable, type Feature, FeatureFlag, FeatureFlags, type Features, type FeaturesSupportedByReporter, type FileSettings, type FileSource, type FsPath, type Glob, type GlobDef, type ICSpellConfigFile, ImportError, type ImportFileRef, ImportFileRefWithError, type InMemorySource, IncludeExcludeFlag, IncludeExcludeOptions, type Issue, IssueType, type LanguageId, type LanguageIdMultiple, type LanguageIdMultipleNeg, type LanguageIdSingle, type LanguageSetting, type LanguageSettingFilterFields, type LanguageSettingFilterFieldsDeprecated, type LanguageSettingFilterFieldsPreferred, type LegacySettings, index_link_d_exports as Link, type LocalId, type LocaleId, Logger, type MappedText, type MatchingFileType, type MergeSource, type MessageEmitter, type MessageType, type MessageTypeLookup, MessageTypes, type OverrideFilterFields, type OverrideSettings, type ParseResult, type ParsedText, type Parser, type ParserName, type ParserOptions, type Pattern, type PatternId, type PatternRef, PerfTimer, type Plugin, type PnPSettings, type PredefinedPatterns, type ProgressBase, type ProgressEmitter, type ProgressFileBase, type ProgressFileBegin, type ProgressFileComplete, type ProgressItem, type ProgressTypes, type RegExpPatternDefinition, type RegExpPatternList, type ReplaceEntry, type ReplaceMap, type ReportIssueOptions, type ReporterConfiguration, type ReporterSettings, type ReportingConfiguration, type ResultEmitter, type RunResult, type Settings, type SimpleGlob, type Source, SpellCheckFileOptions, SpellCheckFilePerf, SpellCheckFileResult, SpellingDictionary, SpellingDictionaryCollection, SpellingDictionaryLoadError, type SpellingErrorEmitter, SuggestOptions, SuggestedWord, SuggestionCollector, type SuggestionCostMapDef, type SuggestionCostsDefs, SuggestionError, SuggestionOptions, SuggestionResult, type SuggestionsConfiguration, SuggestionsForWordResult, textApi_d_exports as Text, TextDocument, TextDocumentLine, type TextDocumentOffset, TextDocumentRef, TextInfoItem, type TextOffset, TraceOptions, TraceResult, TraceWordResult, type TrustLevel, UnknownFeatureFlagError, type UnknownWordsChoices, type UnknownWordsConfiguration, type VFileSystemProvider, ValidationIssue, type Version, type VersionLatest, type VersionLegacy, type VirtualFS, type WorkspaceTrustSettings, toArray as asyncIterableToArray, calcOverrideSettings, checkFilenameMatchesExcludeGlob as checkFilenameMatchesGlob, checkText, checkTextDocument, clearCachedFiles, clearCaches, combineTextAndLanguageSettings, combineTextAndLanguageSettings as constructSettingsForText, createConfigLoader, createPerfTimer, createSpellingDictionary, createCollection as createSpellingDictionaryCollection, createTextDocument, currentSettingsFileVersion, defaultCSpellSettings, defaultConfigFilenames, defaultFileName, defaultFileName as defaultSettingsFilename, defineConfig, determineFinalDocumentSettings, extractDependencies, extractImportErrors, fileToDocument, fileToTextDocument, finalizeSettings, getCachedFileSize, getDefaultBundledSettingsAsync, getDefaultConfigLoader, getDefaultSettings, getDictionary, getGlobalSettings, getGlobalSettingsAsync, findMatchingFileTypes as getLanguageIdsForBaseFilename, getFileTypesForExt as getLanguagesForExt, getLogger, getSources, getSystemFeatureFlags, getVirtualFS, isBinaryFile, isSpellingDictionaryLoadError, loadConfig, loadPnP, mergeInDocSettings, mergeSettings, readConfigFile, readFileText as readFile, readFileTextSync as readFileSync, readRawSettings, readSettings, readSettingsFiles, refreshDictionaryCache, resolveConfigFileImports, resolveFile, searchForConfig, sectionCSpell, setLogger, shouldCheckDocument, spellCheckDocument, spellCheckDocumentRPC, spellCheckFile, suggestionsForWord, suggestionsForWords, traceWords, traceWordsAsync, unknownWordsChoices, updateTextDocument, validateText, writeToFile, writeToFileIterable, writeToFileIterable as writeToFileIterableP };