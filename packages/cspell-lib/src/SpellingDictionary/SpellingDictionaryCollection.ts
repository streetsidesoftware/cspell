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
import { memorizer } from '../util/Memorizer';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';

function identityString(w: string): string {
    return w;
}

export class SpellingDictionaryCollection implements SpellingDictionary {
    readonly options: SpellingDictionaryOptions = {};
    readonly mapWord = identityString;
    readonly wordsToFlag: Set<string>;
    readonly type = 'SpellingDictionaryCollection';
    readonly source: string;
    readonly isDictionaryCaseSensitive: boolean;

    constructor(readonly dictionaries: SpellingDictionary[], readonly name: string, wordsToFlag: string[]) {
        this.dictionaries = this.dictionaries.sort((a, b) => b.size - a.size);
        this.wordsToFlag = new Set(wordsToFlag.map((w) => w.toLowerCase()));
        this.source = dictionaries.map((d) => d.name).join(', ');
        this.isDictionaryCaseSensitive = this.dictionaries.reduce((a, b) => a || b.isDictionaryCaseSensitive, false);
    }

    public has(word: string, hasOptions?: HasOptions): boolean {
        const options = hasOptionToSearchOption(hasOptions);
        return !this.wordsToFlag.has(word.toLowerCase()) && !!isWordInAnyDictionary(this.dictionaries, word, options);
    }

    public isForbidden(word: string): boolean {
        return this.wordsToFlag.has(word.toLowerCase()) || !!this._isForbiddenInDict(word);
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
                !this.wordsToFlag.has(word.toLowerCase()) &&
                (ignoreCase || word[0] !== prefixNoCase) &&
                !this.isForbidden(word)
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
}

export function createCollection(
    dictionaries: SpellingDictionary[],
    name: string,
    wordsToFlag: string[] = []
): SpellingDictionaryCollection {
    return new SpellingDictionaryCollection(dictionaries, name, wordsToFlag);
}

function isWordInAnyDictionary(
    dicts: SpellingDictionary[],
    word: string,
    options: SearchOptions
): SpellingDictionary | undefined {
    return genSequence(dicts).first((dict) => dict.has(word, options));
}

function isWordForbiddenInAnyDictionary(dicts: SpellingDictionary[], word: string): SpellingDictionary | undefined {
    return genSequence(dicts).first((dict) => dict.isForbidden(word));
}

export function createCollectionP(
    dicts: (Promise<SpellingDictionary> | SpellingDictionary)[],
    name: string,
    wordsToFlag: string[]
): Promise<SpellingDictionaryCollection> {
    return Promise.all(dicts).then((dicts) => new SpellingDictionaryCollection(dicts, name, wordsToFlag));
}

export const __testing__ = {
    isWordInAnyDictionary,
    isWordForbiddenInAnyDictionary,
};
