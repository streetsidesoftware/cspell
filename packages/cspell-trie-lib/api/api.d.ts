import { Operator } from "@cspell/cspell-pipe/sync";
import { Buffer } from "node:buffer";
import { DictionaryDefinitionAugmented, SuggestionCostMapDef } from "@cspell/cspell-types";

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
declare function editDistance(wordA: string, wordB: string, editCost?: number): number;
/**
* Calculate the weighted edit distance between any two words.
* @param wordA
* @param wordB
* @param weights - the weights to use
* @param editCost - the cost of each edit (defaults to 100)
* @returns the edit distance
*/
declare function editDistanceWeighted(wordA: string, wordB: string, weights: WeightMap, editCost?: number): number;
/**
* Collect Map definitions into a single weighted map.
* @param defs - list of definitions
* @returns A Weighted Map to be used with distance calculations.
*/
declare function createWeightedMap(defs: SuggestionCostMapDef[]): WeightMap;
//#endregion
//#region src/lib/types.d.ts
/**
* Make all properties in T optional and Possibly undefined
*/
type PartialWithUndefined<T> = { [P in keyof T]?: T[P] | undefined };
//#endregion
//#region src/lib/ITrieNode/TrieInfo.d.ts
interface TrieInfo {
  compoundCharacter: string;
  stripCaseAndAccentsPrefix: string;
  forbiddenWordPrefix: string;
  isCaseAware: boolean;
}
interface TrieCharacteristics {
  hasForbiddenWords: boolean;
  hasCompoundWords: boolean;
  hasNonStrictWords: boolean;
}
type PartialTrieInfo = PartialWithUndefined<TrieInfo> | undefined;
//#endregion
//#region src/lib/ITrieNode/ITrieNode.d.ts
interface FindResult$1 {
  found: string | false;
  compoundUsed: boolean;
  caseMatched: boolean;
  /**
  * Is the word explicitly forbidden.
  * - `true` - word is in the forbidden list.
  * - `false` - word is not in the forbidden list.
  * - `undefined` - unknown - was not checked.
  */
  forbidden?: boolean | undefined;
}
interface FindFullResult$1 extends FindResult$1 {
  /**
  * Is the word explicitly forbidden.
  * - `true` - word is in the forbidden list.
  * - `false` - word is not in the forbidden list.
  * - `undefined` - unknown - was not checked.
  */
  forbidden: boolean | undefined;
}
type ITrieNodeId = object | number | string;
type Entry = readonly [string, ITrieNode];
interface ITrieNode {
  /**
  * ITrieNode instances are not unique. It is possible for multiple ITrieNode instances to
  * represent the same node.
  * `id` is used to see if two instances refer to the same node.
  * The type is obscured because it is up the the backing structure to provide the best value.
  * Note, only nodes from the same root are guaranteed to be unique. It is possible for two
  * different ITrieNode instances to have the same `id` value if they come from different roots.
  */
  readonly id: ITrieNodeId;
  /** flag End of Word */
  readonly eow: boolean;
  /** get keys to children */
  keys(): Iterable<string>;
  /** get keys to children */
  values(): Iterable<ITrieNode>;
  /** get the children as key value pairs */
  entries(): Iterable<Entry>;
  /** get child ITrieNode */
  get(char: string): ITrieNode | undefined;
  /** get a nested child ITrieNode */
  getNode?: (chars: string) => ITrieNode | undefined;
  /** has child */
  has(char: string): boolean;
  /** `true` iff this node has children */
  hasChildren(): boolean;
  /** check if a word exists within this node. */
  findExact?: ((word: string) => boolean) | undefined;
}
interface ITrieNodeRoot extends ITrieNode {
  readonly info: Readonly<TrieInfo>;
  /**
  * converts an `id` into a node.
  * @param id an of a ITrieNode in this Trie
  */
  resolveId(id: ITrieNodeId): ITrieNode;
  findExact: ((word: string) => boolean) | undefined;
  /**
  * Try to find a word.
  * @param word - the normalized word to look up.
  * @param strict - if `true` the case and accents must match.
  * @returns undefined if it did not try to find the word, otherwise a FindResult.
  */
  find?: ((word: string, strict: boolean) => FindResult$1 | undefined) | undefined;
  isForbidden?: ((word: string) => boolean) | undefined;
  readonly forbidPrefix: string;
  readonly compoundFix: string;
  readonly caseInsensitivePrefix: string;
  readonly hasForbiddenWords: boolean;
  readonly hasCompoundWords: boolean;
  readonly hasNonStrictWords: boolean;
}
//#endregion
//#region src/lib/ITrieNode/index.d.ts
type TrieOptions = TrieInfo;
type TrieOptionsRO = Readonly<TrieOptions>;
type PartialTrieOptions = PartialTrieInfo;
//#endregion
//#region src/lib/TrieNode/TrieNode.d.ts
declare const FLAG_WORD = 1;
type ChildMap = Record<string, TrieNode>;
interface TrieNode {
  f?: number | undefined;
  c?: ChildMap | undefined;
}
interface TrieRoot extends TrieInfo {
  c: ChildMap;
}
//#endregion
//#region src/lib/walker/walkerTypes.d.ts
declare const JOIN_SEPARATOR = "+";
declare const WORD_SEPARATOR = " ";
interface YieldResult {
  text: string;
  node: TrieNode;
  depth: number;
}
declare enum CompoundWordsMethod {
  /**
  * Do not compound words.
  */
  NONE = 0,
  /**
  * Create word compounds separated by spaces.
  */
  SEPARATE_WORDS = 1,
  /**
  * Create word compounds without separation.
  */
  JOIN_WORDS = 2,
}
type WalkerIterator = Generator<YieldResult, void, boolean | undefined>;
//#endregion
//#region src/lib/ITrieNode/walker/walkerTypes.d.ts
interface YieldResult$1 {
  text: string;
  node: ITrieNode;
  depth: number;
}
type FalseToNotGoDeeper = boolean;
/**
* By default a Walker Iterator will go depth first. To prevent the
* walker from going deeper use `iterator.next(false)`.
*/
type WalkerIterator$1 = Generator<YieldResult$1, void, FalseToNotGoDeeper | undefined>;
//#endregion
//#region src/lib/walker/hintedWalker.d.ts
/**
* Ask for the next result.
* goDeeper of true tells the walker to go deeper in the Trie if possible. Default is true.
* This can be used to limit the walker's depth.
*/
type HintedWalkerIterator = Generator<YieldResult, void, Hinting | undefined>;
declare function hintedWalker(root: TrieRoot, ignoreCase: boolean, hint: string, compoundingMethod: CompoundWordsMethod | undefined, emitWordSeparator?: string): HintedWalkerIterator;
interface Hinting {
  goDeeper: boolean;
}
//#endregion
//#region src/lib/walker/walker.d.ts
declare function walker(root: TrieNode, compoundingMethod?: CompoundWordsMethod): WalkerIterator;
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
type GenSuggestionOptionsStrictRO = Readonly<GenSuggestionOptionsStrict>;
type GenSuggestionOptions = Partial<GenSuggestionOptionsStrict>;
type GenSuggestionOptionsRO = Readonly<GenSuggestionOptions>;
interface SuggestionOptionsStrict extends GenSuggestionOptionsStrict {
  /**
  * Maximum number of suggestions to make.
  */
  numSuggestions: number;
  /**
  * Allow ties when making suggestions.
  * if `true` it is possible to have more than `numSuggestions`.
  */
  includeTies: boolean;
  /**
  * Time alloted in milliseconds to generate suggestions.
  */
  timeout: number;
  /**
  * Optional filter function.
  * return true to keep the candidate.
  */
  filter?: (word: string, cost: number) => boolean;
  /**
  * Apply weights to improve the suggestions.
  */
  weightMap?: WeightMap | undefined;
}
type SuggestionOptions = Partial<SuggestionOptionsStrict>;
type SuggestionOptionsRO = Readonly<SuggestionOptions>;
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
interface SuggestionCollectorOptions extends Omit<GenSuggestionOptionsStrictRO, "ignoreCase" | "changeLimit"> {
  /**
  * number of best matching suggestions.
  * @default 10
  */
  numSuggestions: number;
  /**
  * An optional filter function that can be used to limit remove unwanted suggestions.
  * I.E. to remove forbidden terms.
  * @default () => true
  */
  filter?: FilterWordFn | undefined;
  /**
  * The number of letters that can be changed when looking for a match
  * @default 5
  */
  changeLimit: number | undefined;
  /**
  * Include suggestions with tied cost even if the number is greater than `numSuggestions`.
  * @default true
  */
  includeTies?: boolean | undefined;
  /**
  * specify if case / accents should be ignored when looking for suggestions.
  * @default true
  */
  ignoreCase: boolean | undefined;
  /**
  * the total amount of time to allow for suggestions.
  * @default 1000
  */
  timeout?: number | undefined;
  /**
  * Used to improve the sorted results.
  */
  weightMap?: WeightMap | undefined;
}
type SuggestionCollectorOptionsRO = Readonly<SuggestionCollectorOptions>;
declare function suggestionCollector(wordToMatch: string, options: SuggestionCollectorOptionsRO): SuggestionCollector;
/**
* Impersonating a Collector, allows searching for multiple variants on the same word.
* The collection is still in the original collector.
* @param collector - collector to impersonate
* @param word - word to present instead of `collector.word`.
* @returns a SuggestionCollector
*/
declare function impersonateCollector(collector: SuggestionCollector, word: string): SuggestionCollector;
//#endregion
//#region src/lib/TrieData.d.ts
interface TrieData extends Readonly<TrieCharacteristics> {
  readonly info: Readonly<TrieInfo>;
  /** Method used to split words into individual characters. */
  wordToCharacters(word: string): readonly string[];
  /** get an iterable for all the words in the dictionary. */
  words(): Iterable<string>;
  getRoot(): ITrieNodeRoot;
  getNode(prefix: string): ITrieNode | undefined;
  has(word: string): boolean;
  isForbiddenWord(word: string): boolean;
  readonly hasForbiddenWords: boolean;
  readonly hasCompoundWords: boolean;
  readonly hasNonStrictWords: boolean;
  readonly size: number;
}
//#endregion
//#region src/lib/ITrie.d.ts
interface ITrie {
  readonly data: TrieData;
  /**
  * Approximate number of words in the Trie, the first call to this method might be expensive.
  * Use `size` to get the number of nodes.
  *
  * It does NOT count natural compound words. Natural compounds are words that are composed of appending
  * multiple words to make a new word. This is common in languages like German and Dutch.
  */
  numWords(): number;
  /**
  * Used to check if the number of words has been calculated.
  */
  isNumWordsKnown(): boolean;
  /**
  * The number of nodes in the Trie. There is a rough corelation between the size and the number of words.
  */
  readonly size: number;
  readonly info: Readonly<TrieInfo>;
  /**
  * @param text - text to find in the Trie
  */
  find(text: string): ITrieNode | undefined;
  has(word: string): boolean;
  has(word: string, minLegacyCompoundLength: boolean | number): boolean;
  /**
  * Determine if a word is in the dictionary.
  * @param word - the exact word to search for - must be normalized.
  * @param caseSensitive - false means also searching a dictionary where the words were normalized to lower case and accents removed.
  * @returns true if the word was found and is not forbidden.
  */
  hasWord(word: string, caseSensitive: boolean): boolean;
  findWord(word: string, options?: FindWordOptions): FindFullResult$1;
  /**
  * Determine if a word is in the forbidden word list.
  * @param word the word to lookup.
  */
  isForbiddenWord(word: string): boolean;
  /**
  * Provides an ordered sequence of words with the prefix of text.
  */
  completeWord(text: string): Iterable<string>;
  /**
  * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
  * @param text - the text to search for
  * @param options - Controls the generated suggestions:
  * - ignoreCase - Ignore Case and Accents
  * - numSuggestions - the maximum number of suggestions to return.
  * - compoundMethod - Use to control splitting words.
  * - changeLimit - the maximum number of changes allowed to text. This is an approximate value, since some changes cost less than others.
  *                      the lower the value, the faster results are returned. Values less than 4 are best.
  */
  suggest(text: string, options: SuggestionOptions): string[];
  /**
  * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
  * The results include the word and adjusted edit cost.  This is useful for merging results from multiple tries.
  */
  suggestWithCost(text: string, options: SuggestionOptions): SuggestionResult[];
  /**
  * genSuggestions will generate suggestions and send them to `collector`. `collector` is responsible for returning the max acceptable cost.
  * Costs are measured in weighted changes. A cost of 100 is the same as 1 edit. Some edits are considered cheaper.
  * Returning a MaxCost < 0 will effectively cause the search for suggestions to stop.
  */
  genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void;
  /**
  * Returns an iterator that can be used to get all words in the trie. For some dictionaries, this can result in millions of words.
  */
  words(): Iterable<string>;
  /**
  * Allows iteration over the entire tree.
  * On the returned Iterator, calling .next(goDeeper: boolean), allows for controlling the depth.
  */
  iterate(): WalkerIterator$1;
  readonly weightMap: WeightMap | undefined;
  readonly isCaseAware: boolean;
  readonly hasForbiddenWords: boolean;
  readonly hasCompoundWords: boolean;
  readonly hasNonStrictWords: boolean;
}
interface FindWordOptions {
  caseSensitive?: boolean;
  useLegacyWordCompounds?: boolean | number;
  checkForbidden?: boolean;
}
type FindWordOptionsRO = Readonly<FindWordOptions>;
//#endregion
//#region src/lib/buildITrie.d.ts
declare function buildITrieFromWords(words: Iterable<string>, info?: PartialTrieInfo): ITrie;
//#endregion
//#region src/lib/consolidate.d.ts
/**
* Consolidate to DAWG
* @param root the root of the Trie tree
*/
declare function consolidate(root: TrieRoot): TrieRoot;
//#endregion
//#region src/lib/constants.d.ts
declare const COMPOUND_FIX = "+";
declare const OPTIONAL_COMPOUND_FIX = "*";
declare const CASE_INSENSITIVE_PREFIX = "~";
declare const FORBID_PREFIX = "!";
declare const defaultTrieInfo: TrieInfo;
//#endregion
//#region src/lib/decodeTrie.d.ts
declare function decodeTrie(raw: string | Buffer): ITrie;
//#endregion
//#region src/lib/io/importExport.d.ts
interface ExportOptions {
  base?: number;
  comment?: string;
  version?: number;
  addLineBreaksToImproveDiffs?: boolean;
}
/**
* Serialize a TrieNode.
* Note: This is destructive.  The node will no longer be usable.
* Even though it is possible to preserve the trie, dealing with very large tries can consume a lot of memory.
* Considering this is the last step before exporting, it was decided to let this be destructive.
*/
declare function serializeTrie(root: TrieRoot, options?: ExportOptions | number): Iterable<string>;
declare function importTrie(input: Iterable<string> | IterableIterator<string> | string[] | string): TrieRoot;
//#endregion
//#region src/lib/models/DictionaryInformation.d.ts
type DictionaryInformation = Exclude<DictionaryDefinitionAugmented["dictionaryInformation"], undefined>;
//#endregion
//#region src/lib/mappers/mapDictionaryInfoToWeightMap.d.ts
declare function mapDictionaryInformationToWeightMap(dictInfo: DictionaryInformation): WeightMap;
//#endregion
//#region src/lib/TrieNode/find.d.ts
interface FindResult {
  found: string | false;
  compoundUsed: boolean;
  caseMatched: boolean;
}
interface FindFullResult extends FindResult {
  /**
  * Is the word explicitly forbidden.
  * - `true` - word is in the forbidden list.
  * - `false` - word is not in the forbidden list.
  * - `undefined` - unknown - was not checked.
  * */
  forbidden: boolean | undefined;
}
//#endregion
//#region src/lib/trie.d.ts
declare class Trie {
  readonly root: TrieRoot;
  private count?;
  private _options;
  private _findOptionsDefaults;
  private _findOptionsExact;
  readonly isLegacy: boolean;
  private hasForbidden;
  constructor(root: TrieRoot, count?: number | undefined);
  /**
  * Number of words in the Trie
  */
  size(): number;
  isSizeKnown(): boolean;
  get options(): Readonly<TrieInfo>;
  /**
  * @param text - text to find in the Trie
  * @param minCompoundLength - deprecated - allows words to be glued together
  */
  find(text: string, minCompoundLength?: boolean | number): TrieNode | undefined;
  has(word: string, minLegacyCompoundLength?: boolean | number): boolean;
  /**
  * Determine if a word is in the dictionary.
  * @param word - the exact word to search for - must be normalized.
  * @param caseSensitive - false means also searching a dictionary where the words were normalized to lower case and accents removed.
  * @returns true if the word was found and is not forbidden.
  */
  hasWord(word: string, caseSensitive: boolean): boolean;
  findWord(word: string, options?: FindWordOptionsRO): FindFullResult;
  /**
  * Determine if a word is in the forbidden word list.
  * @param word the word to lookup.
  */
  isForbiddenWord(word: string): boolean;
  /**
  * Provides an ordered sequence of words with the prefix of text.
  */
  completeWord(text: string): Iterable<string>;
  /**
  * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
  * @param text - the text to search for
  * @param maxNumSuggestions - the maximum number of suggestions to return.
  * @param compoundMethod - Use to control splitting words.
  * @param numChanges - the maximum number of changes allowed to text. This is an approximate value, since some changes cost less than others.
  *                      the lower the value, the faster results are returned. Values less than 4 are best.
  */
  suggest(text: string, options: SuggestionOptionsRO): string[];
  /**
  * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
  * The results include the word and adjusted edit cost.  This is useful for merging results from multiple tries.
  */
  suggestWithCost(text: string, options: SuggestionOptionsRO): SuggestionResult[];
  /**
  * genSuggestions will generate suggestions and send them to `collector`. `collector` is responsible for returning the max acceptable cost.
  * Costs are measured in weighted changes. A cost of 100 is the same as 1 edit. Some edits are considered cheaper.
  * Returning a MaxCost < 0 will effectively cause the search for suggestions to stop.
  */
  genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void;
  /**
  * Returns an iterator that can be used to get all words in the trie. For some dictionaries, this can result in millions of words.
  */
  words(): Iterable<string>;
  /**
  * Allows iteration over the entire tree.
  * On the returned Iterator, calling .next(goDeeper: boolean), allows for controlling the depth.
  */
  iterate(): WalkerIterator;
  insert(word: string): this;
  private calcIsLegacy;
  static create(words: Iterable<string> | IterableIterator<string>, options?: PartialTrieInfo): Trie;
  private createFindOptions;
  private lastCreateFindOptionsMatchCaseMap;
  private createFindOptionsMatchCase;
}
//#endregion
//#region src/lib/SimpleDictionaryParser.d.ts
interface ParseDictionaryOptions {
  compoundCharacter: string;
  optionalCompoundCharacter: string;
  forbiddenPrefix: string;
  caseInsensitivePrefix: string;
  /**
  * Start of a single-line comment.
  * @default "#"
  */
  commentCharacter: string;
  /**
  * If word starts with prefix, do not strip case or accents.
  * @default false;
  */
  keepExactPrefix: string;
  /**
  * Tell the parser to automatically create case / accent insensitive forms.
  * @default true
  */
  stripCaseAndAccents: boolean;
  /**
  * Tell the parser to keep non-case/accent version in both forms.
  * @default false
  */
  stripCaseAndAccentsKeepDuplicate: boolean;
  /**
  * Tell the parser to keep non-case/accent version in both forms.
  * @default false
  */
  stripCaseAndAccentsOnForbidden: boolean;
  /**
  * Tell the parser to split into words along spaces.
  * @default false
  */
  split: boolean;
  /**
  * When splitting tells the parser to output both the split and non-split versions of the line.
  * @default false
  */
  splitKeepBoth: boolean;
  /**
  * Specify the separator for splitting words.
  */
  splitSeparator: RegExp | string;
  /**
  * Do not normalize the compound character.
  */
  keepOptionalCompoundCharacter: boolean;
}
/**
* Normalizes a dictionary words based upon prefix / suffixes.
* Case insensitive versions are also generated.
* @param options - defines prefixes used when parsing lines.
* @returns words that have been normalized.
*/
declare function createDictionaryLineParserMapper(options?: Partial<ParseDictionaryOptions>): Operator<string>;
/**
* Normalizes a dictionary words based upon prefix / suffixes.
* Case insensitive versions are also generated.
* @param lines - one word per line
* @param _options - defines prefixes used when parsing lines.
* @returns words that have been normalized.
*/
declare function parseDictionaryLines(lines: Iterable<string> | string, options?: Partial<ParseDictionaryOptions>): Iterable<string>;
declare function parseDictionaryLegacy(text: string | string[], options?: Partial<ParseDictionaryOptions>): Trie;
declare function parseDictionary(text: string | Iterable<string>, options?: Partial<ParseDictionaryOptions>): ITrie;
//#endregion
//#region src/lib/TrieBuilder.d.ts
/**
* Builds an optimized Trie from a Iterable<string>. It attempts to reduce the size of the trie
* by finding common endings.
* @param words Iterable set of words -- no processing is done on the words, they are inserted as is.
* @param trieOptions options for the Trie
*/
declare function buildTrie(words: Iterable<string>, trieOptions?: PartialTrieOptions): Trie;
/**
* Builds a Trie from a Iterable<string>. NO attempt a reducing the size of the Trie is done.
* @param words Iterable set of words -- no processing is done on the words, they are inserted as is.
* @param trieOptions options for the Trie
*/
declare function buildTrieFast(words: Iterable<string>, trieOptions?: PartialTrieOptions): Trie;
declare class TrieBuilder {
  private count;
  private readonly signatures;
  private readonly cached;
  private readonly transforms;
  private _eow;
  /** position 0 of lastPath is always the root */
  private lastPath;
  private tails;
  trieOptions: TrieOptions;
  private numWords;
  private _debug_lastWordsInserted;
  private _debug_mode;
  constructor(words?: Iterable<string>, trieOptions?: PartialTrieOptions);
  private get _root();
  private signature;
  private _canBeCached;
  private tryCacheFrozen;
  private freeze;
  private tryToCache;
  private storeTransform;
  private addChild;
  private buildTail;
  private _insert;
  insertWord(word: string): void;
  insert(words: Iterable<string>): void;
  /**
  * Resets the builder
  */
  reset(): void;
  build(consolidateSuffixes?: boolean): Trie;
  private debugStack;
  private debNodeInfo;
  private logDebug;
  private runDebug;
  private copyIfFrozen;
  private createNodeFrozen;
  private createNode;
}
//#endregion
//#region src/lib/TrieNode/trie-util.d.ts
declare function insert(word: string, root?: TrieNode): TrieNode;
declare function isWordTerminationNode(node: TrieNode): boolean;
/**
* Sorts the nodes in a trie in place.
*/
declare function orderTrie(node: TrieNode): void;
/**
* Generator an iterator that will walk the Trie parent then children in a depth first fashion that preserves sorted order.
*/
declare function walk(node: TrieNode): Iterable<YieldResult>;
declare const iterateTrie: typeof walk;
/**
* Generate a Iterator that can walk a Trie and yield the words.
*/
declare function iteratorTrieWords(node: TrieNode): Iterable<string>;
declare function createTrieRoot(options: PartialTrieInfo): TrieRoot;
declare function createTrieRootFromList(words: Iterable<string>, options?: PartialTrieInfo): TrieRoot;
declare function has(node: TrieNode, word: string): boolean;
declare function findNode(node: TrieNode, word: string): TrieNode | undefined;
declare function countNodes(root: TrieNode): number;
declare function countWords(root: TrieNode): number;
declare function isCircular(root: TrieNode): boolean;
declare function trieNodeToRoot(node: TrieNode, options: PartialTrieInfo): TrieRoot;
//#endregion
//#region src/lib/utils/isDefined.d.ts
declare function isDefined<T>(t: T | undefined): t is T;
//#endregion
//#region src/lib/utils/mergeDefaults.d.ts
/**
* Creates a new object of type T based upon the field values from `value`.
* n[k] = value[k] ?? default[k] where k must be a field in default.
* Note: it will remove fields not in defaultValue!
* @param value
* @param defaultValue
*/
declare function mergeDefaults<T extends object>(value: Readonly<PartialWithUndefined<T>> | undefined, defaultValue: T): T;
//#endregion
//#region src/lib/utils/mergeOptionalWithDefaults.d.ts
type ROPartialTrieOptions = Readonly<PartialTrieInfo>;
declare function mergeOptionalWithDefaults(options: ROPartialTrieOptions): TrieInfo;
declare function mergeOptionalWithDefaults(options: ROPartialTrieOptions, ...moreOptions: ROPartialTrieOptions[]): TrieInfo;
//#endregion
//#region src/lib/utils/normalizeWord.d.ts
/**
* Normalize word unicode.
* @param text - text to normalize
* @returns returns a word normalized to `NFC`
*/
declare const normalizeWord: (text: string) => string;
/**
* converts text to lower case and removes any accents.
* @param text - text to convert
* @returns lowercase word without accents
* @deprecated true
*/
declare const normalizeWordToLowercase: (text: string) => string;
/**
* generate case insensitive forms of a word
* @param text - text to convert
* @returns the forms of the word.
*/
declare const normalizeWordForCaseInsensitive: (text: string) => string[];
//#endregion
//#region src/lib/utils/text.d.ts
/**
* Expand a line into a set of characters.
*
* Example:
* - `a-c` -> `<a,b,c>`
* - `ac-` -> `<a,c,->`
* - `-abz` -> `<-,a,b,z>`
* - `\u0300-\u0308` -> `<accents>`
*
* @param line - set of characters
* @param rangeChar - the character to indicate ranges, set to empty to not have ranges.
*/
declare function expandCharacterSet(line: string, rangeChar?: string): Set<string>;
//#endregion
export { CASE_INSENSITIVE_PREFIX, COMPOUND_FIX, type ChildMap, CompoundWordsMethod, type ExportOptions, FLAG_WORD, FORBID_PREFIX, type FindFullResult, type FindWordOptions, type HintedWalkerIterator, type Hinting, type ITrie, JOIN_SEPARATOR, type MaxCost, OPTIONAL_COMPOUND_FIX, type PartialTrieOptions, type SuggestionCollector, type SuggestionCostMapDef, type SuggestionResult, Trie, TrieBuilder, type TrieNode, type TrieOptions, type TrieOptionsRO, type TrieRoot, WORD_SEPARATOR, type WalkerIterator, type WeightMap, type YieldResult, buildITrieFromWords, buildTrie, buildTrieFast, consolidate, countNodes, countWords, createDictionaryLineParserMapper as createDictionaryLineParser, createTrieRoot, createTrieRootFromList, createWeightedMap, decodeTrie, defaultTrieInfo, defaultTrieInfo as defaultTrieOptions, editDistance, editDistanceWeighted, expandCharacterSet, findNode, has, hintedWalker, impersonateCollector, importTrie, insert, isCircular, isDefined, isWordTerminationNode, iterateTrie, iteratorTrieWords, mapDictionaryInformationToWeightMap, mergeDefaults, mergeOptionalWithDefaults, normalizeWord, normalizeWordForCaseInsensitive, normalizeWordToLowercase, orderTrie, parseDictionary, parseDictionaryLegacy, parseDictionaryLines, serializeTrie, suggestionCollector, trieNodeToRoot, walk, walker };
//# sourceMappingURL=index.d.ts.map