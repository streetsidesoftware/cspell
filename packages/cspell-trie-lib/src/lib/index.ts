export { buildITrieFromWords } from './buildITrie.ts';
export { consolidate } from './consolidate.ts';
export {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND_FIX,
    defaultTrieInfo,
    /** @deprecated */
    defaultTrieInfo as defaultTrieOptions,
    FORBID_PREFIX,
    OPTIONAL_COMPOUND_FIX,
} from './constants.ts';
export { decodeTrie } from './decodeTrie.ts';
export type { WeightMap } from './distance/index.ts';
export { createWeightedMap, editDistance, editDistanceWeighted } from './distance/index.ts';
export { type ExportOptions, importTrie, serializeTrie } from './io/importExport.ts';
export type { FindWordOptions, ITrie } from './ITrie.ts';
export { mapDictionaryInformationToWeightMap } from './mappers/mapDictionaryInfoToWeightMap.ts';
export type { SuggestionCostMapDef } from './models/suggestionCostsDef.ts';
export {
    createDictionaryLineParserMapper as createDictionaryLineParser,
    parseDictionary,
    parseDictionaryLegacy,
    parseDictionaryLines,
} from './SimpleDictionaryParser.ts';
export type { MaxCost, SuggestionCollector, SuggestionResult } from './suggestCollector.ts';
export { impersonateCollector, suggestionCollector } from './suggestCollector.ts';
export type { PartialTrieOptions, TrieOptions, TrieOptionsRO } from './trie.ts';
export { Trie } from './trie.ts';
export { buildTrie, buildTrieFast, TrieBuilder } from './TrieBuilder.ts';
export type { FindFullResult } from './TrieNode/find.ts';
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
} from './TrieNode/trie-util.ts';
export type { ChildMap, TrieNode, TrieRoot } from './TrieNode/TrieNode.ts';
export { FLAG_WORD } from './TrieNode/TrieNode.ts';
export { isDefined } from './utils/isDefined.ts';
export { mergeDefaults } from './utils/mergeDefaults.ts';
export { mergeOptionalWithDefaults } from './utils/mergeOptionalWithDefaults.ts';
export { normalizeWord, normalizeWordForCaseInsensitive, normalizeWordToLowercase } from './utils/normalizeWord.ts';
export { expandCharacterSet } from './utils/text.ts';
export type { HintedWalkerIterator, Hinting, WalkerIterator, YieldResult } from './walker/index.ts';
export { CompoundWordsMethod, hintedWalker, JOIN_SEPARATOR, walker, WORD_SEPARATOR } from './walker/index.ts';
