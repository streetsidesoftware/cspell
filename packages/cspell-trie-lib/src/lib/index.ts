export { consolidate } from './consolidate.js';
export type { WeightMap } from './distance/index.js';
export { createWeightedMap, editDistance, editDistanceWeighted } from './distance/index.js';
export { ExportOptions, importTrie, serializeTrie } from './io/importExport.js';
export { mapDictionaryInformationToWeightMap } from './mappers/mapDictionaryInfoToWeightMap.js';
export type { SuggestionCostMapDef } from './models/suggestionCostsDef.js';
export {
    createDictionaryLineParserMapper as createDictionaryLineParser,
    parseDictionary,
    parseDictionaryLines,
} from './SimpleDictionaryParser.js';
export type { MaxCost, SuggestionCollector, SuggestionResult } from './suggestCollector.js';
export { impersonateCollector, suggestionCollector } from './suggestCollector.js';
export type { FindWordOptions, PartialTrieOptions, TrieOptions } from './trie.js';
export {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND,
    COMPOUND_FIX,
    defaultTrieOptions,
    FORBID,
    FORBID_PREFIX,
    NORMALIZED,
    OPTIONAL_COMPOUND,
    OPTIONAL_COMPOUND_FIX,
    Trie,
} from './trie.js';
export { buildTrie, buildTrieFast, TrieBuilder } from './TrieBuilder.js';
export type { FindFullResult } from './TrieNode/find.js';
export {
    countNodes,
    countWords,
    createTrieRoot,
    createTriFromList,
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
export { ChildMap, FLAG_WORD, TrieNode, TrieRoot } from './TrieNode/TrieNode.js';
export { isDefined } from './utils/isDefined.js';
export { mergeDefaults } from './utils/mergeDefaults.js';
export { mergeOptionalWithDefaults } from './utils/mergeOptionalWithDefaults.js';
export { normalizeWord, normalizeWordForCaseInsensitive, normalizeWordToLowercase } from './utils/normalizeWord.js';
export { expandCharacterSet } from './utils/text.js';
export type { HintedWalkerIterator, Hinting, WalkerIterator, YieldResult } from './walker/index.js';
export { CompoundWordsMethod, hintedWalker, JOIN_SEPARATOR, walker, WORD_SEPARATOR } from './walker/index.js';
