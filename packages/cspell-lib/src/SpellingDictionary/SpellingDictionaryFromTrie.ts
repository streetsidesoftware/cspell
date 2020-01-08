import { Trie, SuggestionCollector, suggestionCollector, SuggestionResult, CompoundWordsMethod, importTrie } from 'cspell-trie-lib';
import { createMapper } from '../util/repMap';
import { getDefaultSettings } from '../Settings';
import { memorizer } from '../util/Memorizer';
import { hasOptionToSearchOption, wordSearchForms, SuggestArgs, defaultNumSuggestions, PREFIX_NO_CASE, regexPrefix, impersonateCollector } from './SpellingDictionaryMethods';
import { SpellingDictionary, HasOptions, SuggestOptions, SpellingDictionaryOptions } from './SpellingDictionary';
export class SpellingDictionaryFromTrie implements SpellingDictionary {
    static readonly cachedWordsLimit = 50000;
    private _size: number = 0;
    readonly knownWords = new Set<string>();
    readonly unknownWords = new Set<string>();
    readonly mapWord: (word: string) => string;
    readonly type = 'SpellingDictionaryFromTrie';
    readonly isDictionaryCaseSensitive: boolean;
    constructor(readonly trie: Trie, readonly name: string, readonly options: SpellingDictionaryOptions = {}, readonly source = 'from trie', size?: number) {
        this.mapWord = createMapper(options.repMap || []);
        this.isDictionaryCaseSensitive = options.caseSensitive || !trie.isLegacy;
        this._size = size || 0;
    }
    public get size() {
        if (!this._size) {
            // walk the trie and get the approximate size.
            const i = this.trie.iterate();
            let deeper = true;
            let size = 0;
            for (let r = i.next(); !r.done; r = i.next(deeper)) {
                // count all nodes even though they are not words.
                // because we are not going to all the leaves, this should give a good enough approximation.
                size += 1;
                deeper = r.value.text.length < 5;
            }
            this._size = size;
        }
        return this._size;
    }
    public has(word: string, hasOptions?: HasOptions) {
        const searchOptions = hasOptionToSearchOption(hasOptions);
        const useCompounds = searchOptions.useCompounds === undefined ? this.options.useCompounds : searchOptions.useCompounds;
        const { ignoreCase = true } = searchOptions;
        return this._has(word, useCompounds, ignoreCase);
    }
    private _has = memorizer(
        (word: string, useCompounds: number | boolean | undefined, ignoreCase: boolean) =>
        this.hasAnyForm(word, useCompounds, ignoreCase), SpellingDictionaryFromTrie.cachedWordsLimit
    );
    private hasAnyForm(word: string, useCompounds: number | boolean | undefined, ignoreCase: boolean) {
        const mWord = this.mapWord(word);
        const forms = wordSearchForms(mWord, this.isDictionaryCaseSensitive, ignoreCase);
        for (const w of forms) {
            if (this.trie.hasWord(w, !ignoreCase)) {
                return true;
            }
        }
        if (useCompounds) {
            for (const w of forms) {
                if (this.trie.has(w, useCompounds)) {
                    return true;
                }
            }
        }
        return false;
    }
    public suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[];
    public suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    public suggest(...args: SuggestArgs): SuggestionResult[] {
        const [word, options, compoundMethod, numChanges] = args;
        const suggestOptions: SuggestOptions = (typeof options === 'object')
            ? options
            : {
                numSuggestions: options,
                compoundMethod,
                numChanges
            };
        return this._suggest(word, suggestOptions);
    }
    private _suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[] {
        const { numSuggestions = getDefaultSettings().numSuggestions || defaultNumSuggestions, numChanges, ignoreCase = true, } = suggestOptions;
        function filter(word: string): boolean {
            return ignoreCase || word[0] !== PREFIX_NO_CASE;
        }
        const collector = suggestionCollector(word, numSuggestions, filter, numChanges);
        this.genSuggestions(collector, suggestOptions);
        return collector.suggestions.map(r => ({ ...r, word: r.word.replace(regexPrefix, '') }));
    }
    public genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void {
        const { compoundMethod = CompoundWordsMethod.SEPARATE_WORDS, ignoreCase = true, } = suggestOptions;
        const _compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        wordSearchForms(collector.word, this.isDictionaryCaseSensitive, ignoreCase)
            .forEach(w => this.trie.genSuggestions(impersonateCollector(collector, w), _compoundMethod));
    }
}

export async function createSpellingDictionaryTrie(
    data: Iterable<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions
): Promise<SpellingDictionary> {
    const trieNode = importTrie(data);
    const trie = new Trie(trieNode);
    return new SpellingDictionaryFromTrie(trie, name, options, source);
}
