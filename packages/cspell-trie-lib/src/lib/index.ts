export { buildITrieFromWords } from './buildITrie.js';
export { consolidate } from './consolidate.js';
export {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND_FIX,
    defaultTrieInfo,
    /** @deprecated */
    defaultTrieInfo as defaultTrieOptions,
    FORBID_PREFIX,
    OPTIONAL_COMPOUND_FIX,
} from './constants.js';
export { decodeTrie } from './decodeTrie.js';
export type { WeightMap } from './distance/index.js';
export { createWeightedMap, editDistance, editDistanceWeighted } from './distance/index.js';
export { type ExportOptions, importTrie, serializeTrie } from './io/importExport.js';
export type { FindWordOptions, ITrie } from './ITrie.js';
export { mapDictionaryInformationToWeightMap } from './mappers/mapDictionaryInfoToWeightMap.js';
export type { SuggestionCostMapDef } from './models/suggestionCostsDef.js';
export {
    createDictionaryLineParserMapper as createDictionaryLineParser,
    parseDictionary,
    parseDictionaryLegacy,
    parseDictionaryLines,
} from './SimpleDictionaryParser.js';
export type { MaxCost, SuggestionCollector, SuggestionResult } from './suggestCollector.js';
export { impersonateCollector, suggestionCollector } from './suggestCollector.js';
export type { PartialTrieOptions, TrieOptions, TrieOptionsRO } from './trie.js';
export { Trie } from './trie.js';
export { buildTrie, buildTrieFast, TrieBuilder } from './TrieBuilder.js';
export type { FindFullResult } from './TrieNode/find.js';
export {
    countNodes,
    countWords,
    createTrieRoot,
    createTrieRootFromList,
    findNode,
    has,
    insert,
    isCircular,
    isWordTerminationNode,
    iterateTrie,
    iteratorTrieWords,
    orderTrie,
    trieNodeToRoot,
    walk,
} from './TrieNode/trie-util.js';
export type { ChildMap, TrieNode, TrieRoot } from './TrieNode/TrieNode.js';
export { FLAG_WORD } from './TrieNode/TrieNode.js';
export { isDefined } from './utils/isDefined.js';
export { mergeDefaults } from './utils/mergeDefaults.js';
export { mergeOptionalWithDefaults } from './utils/mergeOptionalWithDefaults.js';
export { normalizeWord, normalizeWordForCaseInsensitive, normalizeWordToLowercase } from './utils/normalizeWord.js';
export { expandCharacterSet } from './utils/text.js';
export type { HintedWalkerIterator, Hinting, WalkerIterator, YieldResult } from './walker/index.js';
export { CompoundWordsMethod, hintedWalker, JOIN_SEPARATOR, walker, WORD_SEPARATOR } from './walker/index.js';
