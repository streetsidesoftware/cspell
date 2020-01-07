import { genSequence } from 'gensequence';
import { IterableLike } from '../util/IterableLike';
import { Trie, SuggestionCollector } from 'cspell-trie-lib';
import { createMapper } from '../util/repMap';
import { FunctionArgs } from '../util/types';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { SpellingDictionary, HasOptions, SuggestOptions, SpellingDictionaryOptions } from './SpellingDictionary';
import { wordDictionaryFormsCollector, hasOptionToSearchOption, wordSearchForms, SuggestArgs } from './SpellingDictionaryMethods';

export function createSpellingDictionary(
    wordList: string[] | IterableLike<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions
): SpellingDictionary {
    // console.log(`createSpellingDictionary ${name} ${source}`);
    const opts = options || {};
    const { caseSensitive = false } = opts;
    const words = new Set(genSequence(wordList)
        .filter(word => typeof word === 'string')
        .map(word => word.trim())
        .filter(w => !!w)
        .concatMap(wordDictionaryFormsCollector(caseSensitive)));
    const mapWord = createMapper(opts.repMap || []);
    let trieDict: SpellingDictionaryFromTrie | undefined;
    function getTrie() {
        if (trieDict) {
            return trieDict;
        }
        // console.log(`Build Trie ${name}`);
        return trieDict = new SpellingDictionaryFromTrie(Trie.create(words), name, options, source, words.size);
    }
    const isDictionaryCaseSensitive = opts.caseSensitive || false;
    const dict: SpellingDictionary = {
        name,
        source,
        type: 'SpellingDictionaryFromSet',
        mapWord,
        size: words.size,
        isDictionaryCaseSensitive,
        options: opts,
        has: (word: string, hasOptions?: HasOptions) => {
            if (words.has(word)) {
                return true;
            }
            const searchOptions = hasOptionToSearchOption(hasOptions);
            const mWord = mapWord(word);
            const { ignoreCase = true } = searchOptions;
            const forms = wordSearchForms(mWord, isDictionaryCaseSensitive, ignoreCase);
            for (const w of forms) {
                if (words.has(w)) {
                    return true;
                }
            }
            const useCompounds = searchOptions.useCompounds === undefined ? opts.useCompounds : searchOptions.useCompounds;
            if (isDictionaryCaseSensitive || useCompounds || searchOptions.ignoreCase === false) {
                return getTrie().has(word, hasOptions);
            }
            return false;
        },
        suggest: (...args: SuggestArgs) => getTrie().suggest(...args as FunctionArgs<SpellingDictionary['suggest']>),
        genSuggestions: (collector: SuggestionCollector, suggestOptions: SuggestOptions) => getTrie().genSuggestions(collector, suggestOptions),
    };
    return dict;
}
