export { consolidate } from './consolidate';
export type { WeightMap } from './distance';
export { createWeightedMap, editDistance, editDistanceWeighted } from './distance';
export type { FindFullResult } from './find';
export { ExportOptions, importTrie, serializeTrie } from './io/importExport';
export { mapDictionaryInformationToWeightMap } from './mappers/mapDictionaryInfoToWeightMap';
export type { SuggestionCostMapDef } from './models/suggestionCostsDef';
export {
    createDictionaryLineParserMapper as createDictionaryLineParser,
    parseDictionary,
    parseDictionaryLines,
} from './SimpleDictionaryParser';
export type { MaxCost, SuggestionCollector, SuggestionResult } from './suggestCollector';
export { impersonateCollector, suggestionCollector } from './suggestCollector';
export type { FindWordOptions, PartialTrieOptions, TrieOptions } from './trie';
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
} from './trie';
export {
    countNodes,
    countWords,
    createTrieRoot,
    createTriFromList,
    findNode,
    has,
    insert,
    isCircular,
    isDefined,
    isWordTerminationNode,
    iterateTrie,
    iteratorTrieWords,
    mergeDefaults,
    mergeOptionalWithDefaults,
    normalizeWord,
    normalizeWordForCaseInsensitive,
    normalizeWordToLowercase,
    orderTrie,
    trieNodeToRoot,
    walk,
} from './trie-util';
export { buildTrie, buildTrieFast, TrieBuilder } from './TrieBuilder';
export { ChildMap, FLAG_WORD, TrieNode, TrieRoot } from './TrieNode';
export type { HintedWalkerIterator, Hinting, WalkerIterator, YieldResult } from './walker';
export { CompoundWordsMethod, hintedWalker, JOIN_SEPARATOR, walker, WORD_SEPARATOR } from './walker';
