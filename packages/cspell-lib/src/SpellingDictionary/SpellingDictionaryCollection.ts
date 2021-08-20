import {
    CompoundWordsMethod,
    SuggestionCollector,
    suggestionCollector,
    SuggestionResult,
    hasOptionToSearchOption,
    defaultNumSuggestions,
    SuggestArgs,
    suggestArgsToSuggestOptions,
} from './SpellingDictionaryMethods';
import {
    SpellingDictionary,
    HasOptions,
    SearchOptions,
    SuggestOptions,
    SpellingDictionaryOptions,
} from './SpellingDictionary';
import { CASE_INSENSITIVE_PREFIX } from 'cspell-trie-lib';
import { genSequence } from 'gensequence';
import { getDefaultSettings } from '../Settings';
import { memorizer, memorizerKeyBy } from '../util/Memorizer';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';

function identityString(w: string): string {
    return w;
}

export class SpellingDictionaryCollection implements SpellingDictionary {
    readonly options: SpellingDictionaryOptions = {};
    readonly mapWord = identityString;
    readonly type = 'SpellingDictionaryCollection';
    readonly source: string;
    readonly isDictionaryCaseSensitive: boolean;
    readonly containsNoSuggestWords: boolean;

    constructor(readonly dictionaries: SpellingDictionary[], readonly name: string) {
        this.dictionaries = this.dictionaries.sort((a, b) => b.size - a.size);
        this.source = dictionaries.map((d) => d.name).join(', ');
        this.isDictionaryCaseSensitive = this.dictionaries.reduce((a, b) => a || b.isDictionaryCaseSensitive, false);
        this.containsNoSuggestWords = this.dictionaries.reduce((a, b) => a || b.containsNoSuggestWords, false);
    }

    public has(word: string, hasOptions?: HasOptions): boolean {
        const options = hasOptionToSearchOption(hasOptions);
        return !!isWordInAnyDictionary(this.dictionaries, word, options) && !this.isForbidden(word);
    }

    public isNoSuggestWord(word: string, options?: HasOptions): boolean {
        return this._isNoSuggestWord(word, options);
    }

    public isForbidden(word: string): boolean {
        return !!this._isForbiddenInDict(word) && !this.isNoSuggestWord(word);
    }

    public suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number,
        ignoreCase?: boolean
    ): SuggestionResult[];
    public suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    public suggest(...args: SuggestArgs): SuggestionResult[] {
        const [word] = args;
        const suggestOptions = suggestArgsToSuggestOptions(args);
        return this._suggest(word, suggestOptions);
    }

    public _suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[] {
        const _suggestOptions = { ...suggestOptions };
        const {
            numSuggestions = getDefaultSettings().numSuggestions || defaultNumSuggestions,
            numChanges,
            compoundMethod,
            ignoreCase = true,
        } = suggestOptions;
        _suggestOptions.compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        const prefixNoCase = CASE_INSENSITIVE_PREFIX;
        const filter = (word: string, _cost: number) => {
            return (
                (ignoreCase || word[0] !== prefixNoCase) &&
                !this.isForbidden(word) &&
                !this.isNoSuggestWord(word, suggestOptions)
            );
        };
        const collector = suggestionCollector(word, {
            numSuggestions,
            filter,
            changeLimit: numChanges,
            includeTies: true,
            ignoreCase,
        });
        this.genSuggestions(collector, suggestOptions);
        return collector.suggestions.map((r) => ({ ...r, word: r.word }));
    }

    public get size(): number {
        return this.dictionaries.reduce((a, b) => a + b.size, 0);
    }

    public genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void {
        const _suggestOptions = { ...suggestOptions };
        const { compoundMethod = CompoundWordsMethod.SEPARATE_WORDS } = suggestOptions;
        _suggestOptions.compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        this.dictionaries.forEach((dict) => dict.genSuggestions(collector, _suggestOptions));
    }

    public getErrors(): Error[] {
        return this.dictionaries.reduce((errors, dict) => errors.concat(dict.getErrors?.() || []), [] as Error[]);
    }

    private _isForbiddenInDict = memorizer(
        (word: string) => isWordForbiddenInAnyDictionary(this.dictionaries, word),
        SpellingDictionaryFromTrie.cachedWordsLimit
    );

    private _isNoSuggestWord = memorizerKeyBy(
        (word: string, options?: HasOptions) => {
            if (!this.containsNoSuggestWords) return false;
            return !!isNoSuggestWordInAnyDictionary(this.dictionaries, word, options || false);
        },
        (word: string, options?: HasOptions) => {
            const opts = hasOptionToSearchOption(options);
            return [word, opts.useCompounds, opts.ignoreCase].join();
        },
        SpellingDictionaryFromTrie.cachedWordsLimit
    );
}

export function createCollection(dictionaries: SpellingDictionary[], name: string): SpellingDictionaryCollection {
    return new SpellingDictionaryCollection(dictionaries, name);
}

function isWordInAnyDictionary(
    dicts: SpellingDictionary[],
    word: string,
    options: SearchOptions
): SpellingDictionary | undefined {
    return genSequence(dicts).first((dict) => dict.has(word, options));
}

function isNoSuggestWordInAnyDictionary(
    dicts: SpellingDictionary[],
    word: string,
    options: HasOptions
): SpellingDictionary | undefined {
    return genSequence(dicts).first((dict) => dict.isNoSuggestWord(word, options));
}

function isWordForbiddenInAnyDictionary(dicts: SpellingDictionary[], word: string): SpellingDictionary | undefined {
    return genSequence(dicts).first((dict) => dict.isForbidden(word));
}

export function createCollectionP(
    dicts: (Promise<SpellingDictionary> | SpellingDictionary)[],
    name: string
): Promise<SpellingDictionaryCollection> {
    return Promise.all(dicts).then((dicts) => new SpellingDictionaryCollection(dicts, name));
}

export const __testing__ = {
    isWordInAnyDictionary,
    isWordForbiddenInAnyDictionary,
};
