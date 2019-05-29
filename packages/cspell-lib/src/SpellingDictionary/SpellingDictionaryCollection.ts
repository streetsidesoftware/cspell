import {
    CompoundWordsMethod,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestionCollector,
    suggestionCollector,
    SuggestionResult,
    HasOptions,
    hasOptionToSearchOption,
    SearchOptions,
    SuggestOptions,
    defaultNumSuggestions,
    SuggestArgs,
    regexPrefix,
    PREFIX_NO_CASE,
} from './SpellingDictionary';
import { genSequence } from 'gensequence';
import { getDefaultSettings } from '../Settings';

export class SpellingDictionaryCollection implements SpellingDictionary {
    readonly options: SpellingDictionaryOptions = {};
    readonly mapWord = (word: string) => word;
    readonly wordsToFlag: Set<string>;
    readonly type = 'SpellingDictionaryCollection';
    readonly source: string;
    readonly isDictionaryCaseSensitive: boolean;

    constructor(
        readonly dictionaries: SpellingDictionary[],
        readonly name: string,
        wordsToFlag: string[],
    ) {
        this.dictionaries = this.dictionaries.filter(a => !!a.size).sort((a, b) => b.size - a.size);
        this.wordsToFlag = new Set(wordsToFlag.map(w => w.toLowerCase()));
        this.source = dictionaries.map(d => d.name).join(', ');
        this.isDictionaryCaseSensitive = this.dictionaries.reduce((a, b) => a || b.isDictionaryCaseSensitive, false);
    }

    public has(word: string, hasOptions?: HasOptions) {
        const options = hasOptionToSearchOption(hasOptions);
        return !this.wordsToFlag.has(word.toLowerCase()) && isWordInAnyDictionary(this.dictionaries, word, options);
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

    public _suggest(
        word: string,
        suggestOptions: SuggestOptions
    ): SuggestionResult[] {
        const _suggestOptions = {...suggestOptions};
        const {
            numSuggestions = getDefaultSettings().numSuggestions || defaultNumSuggestions,
            numChanges,
            compoundMethod,
            ignoreCase = true,
        } = suggestOptions;
        _suggestOptions.compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        const filter = (word: string) => {
            return !this.wordsToFlag.has(word.toLowerCase())
                && (ignoreCase || word[0] !== PREFIX_NO_CASE);
        };
        const collector = suggestionCollector(word, numSuggestions, filter, numChanges);
        this.genSuggestions(collector, suggestOptions);
        return collector.suggestions.map(r => ({...r, word: r.word.replace(regexPrefix, '')}));
    }

    public get size() {
        return this.dictionaries.reduce((a, b) => a + b.size, 0);
    }

    public genSuggestions(
        collector: SuggestionCollector,
        suggestOptions: SuggestOptions
    ): void {
        const _suggestOptions = {...suggestOptions};
        const { compoundMethod = CompoundWordsMethod.SEPARATE_WORDS } = suggestOptions;
        _suggestOptions.compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        this.dictionaries.forEach(dict => dict.genSuggestions(collector, _suggestOptions));
    }
}

export function createCollection(dictionaries: SpellingDictionary[], name: string, wordsToFlag: string[] = []) {
    return new SpellingDictionaryCollection(dictionaries, name, wordsToFlag);
}

export function isWordInAnyDictionary(dicts: SpellingDictionary[], word: string, options: SearchOptions) {
    return !!genSequence(dicts)
        .first(dict => dict.has(word, options));
}

export function createCollectionP(
    dicts: Promise<SpellingDictionary>[],
    name: string,
    wordsToFlag: string[],
): Promise<SpellingDictionaryCollection> {
    return Promise.all(dicts)
        .then(dicts => new SpellingDictionaryCollection(dicts, name, wordsToFlag));
}
