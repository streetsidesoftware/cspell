import type { SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';
import { CASE_INSENSITIVE_PREFIX, CompoundWordsMethod } from 'cspell-trie-lib';

import { isDefined } from '../util/util.js';
import * as Defaults from './defaults.js';
import type {
    FindResult,
    HasOptionsRO,
    SearchOptionsRO,
    SpellingDictionary,
    SpellingDictionaryOptionsRO,
} from './SpellingDictionary.js';
import { defaultNumSuggestions, hasOptionToSearchOption, suggestionCollector } from './SpellingDictionaryMethods.js';
import type { SuggestOptionsRO } from './SuggestOptions.js';

function identityString(w: string): string {
    return w;
}

export interface SpellingDictionaryCollection extends SpellingDictionary {
    readonly type: 'SpellingDictionaryCollection';
    readonly dictionaries: SpellingDictionary[];
    getErrors(): Error[];
}

class SpellingDictionaryCollectionImpl implements SpellingDictionaryCollection {
    readonly options: SpellingDictionaryOptionsRO = { weightMap: undefined };
    readonly mapWord = identityString;
    readonly type = 'SpellingDictionaryCollection';
    readonly source: string;
    readonly isDictionaryCaseSensitive: boolean;
    readonly containsNoSuggestWords: boolean;

    constructor(
        readonly dictionaries: SpellingDictionary[],
        readonly name: string,
        source?: string,
    ) {
        this.dictionaries = this.dictionaries.sort((a, b) => b.size - a.size);
        this.source = source || dictionaries.map((d) => d.name).join(', ');
        this.isDictionaryCaseSensitive = this.dictionaries.reduce((a, b) => a || b.isDictionaryCaseSensitive, false);
        this.containsNoSuggestWords = this.dictionaries.reduce((a, b) => a || b.containsNoSuggestWords, false);
    }

    public has(word: string, hasOptions?: HasOptionsRO): boolean {
        const options = hasOptionToSearchOption(hasOptions);
        return !!isWordInAnyDictionary(this.dictionaries, word, options) && !this.isForbidden(word);
    }

    public find(word: string, hasOptions?: HasOptionsRO): FindResult | undefined {
        const options = hasOptionToSearchOption(hasOptions);
        return findInAnyDictionary(this.dictionaries, word, options);
    }

    public isNoSuggestWord(word: string, options?: HasOptionsRO): boolean {
        return this._isNoSuggestWord(word, options);
    }

    public isForbidden(word: string, ignoreCaseAndAccents?: boolean): boolean {
        const ignoreCase = ignoreCaseAndAccents ?? Defaults.isForbiddenIgnoreCaseAndAccents;
        return !!this._isForbiddenInDict(word, ignoreCase) && !this.isNoSuggestWord(word, { ignoreCase });
    }

    public suggest(word: string, suggestOptions: SuggestOptionsRO = {}): SuggestionResult[] {
        return this._suggest(word, suggestOptions);
    }

    public _suggest(word: string, suggestOptions: SuggestOptionsRO): SuggestionResult[] {
        const { numSuggestions = defaultNumSuggestions, numChanges, ignoreCase, includeTies, timeout } = suggestOptions;
        const prefixNoCase = CASE_INSENSITIVE_PREFIX;
        const filter = (word: string, _cost: number) => {
            return (
                (ignoreCase || word[0] !== prefixNoCase) &&
                !this.isForbidden(word) &&
                !this.isNoSuggestWord(word, suggestOptions)
            );
        };
        const collectorOptions = {
            numSuggestions,
            filter,
            changeLimit: numChanges,
            includeTies,
            ignoreCase,
            timeout,
        };
        const collector = suggestionCollector(word, collectorOptions);
        this.genSuggestions(collector, suggestOptions);
        return collector.suggestions;
    }

    public get size(): number {
        return this.dictionaries.reduce((a, b) => a + b.size, 0);
    }

    getPreferredSuggestions(word: string) {
        const sugs = this.dictionaries.flatMap((dict) => dict.getPreferredSuggestions?.(word)).filter(isDefined);
        if (sugs.length <= 1) return sugs;
        const unique = new Set<string>();
        return sugs.filter((sug) => {
            if (unique.has(sug.word)) return false;
            unique.add(sug.word);
            return true;
        });
    }

    public genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptionsRO): void {
        const _suggestOptions = { ...suggestOptions };
        const { compoundMethod = CompoundWordsMethod.SEPARATE_WORDS } = suggestOptions;
        _suggestOptions.compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        this.dictionaries.forEach((dict) => dict.genSuggestions(collector, _suggestOptions));
    }

    public getErrors(): Error[] {
        return this.dictionaries.reduce((errors, dict) => [...errors, ...(dict.getErrors?.() || [])], [] as Error[]);
    }

    private _isForbiddenInDict(word: string, ignoreCase: boolean | undefined) {
        return isWordForbiddenInAnyDictionary(this.dictionaries, word, ignoreCase);
    }

    private _isNoSuggestWord = (word: string, options?: HasOptionsRO) => {
        if (!this.containsNoSuggestWords) return false;
        return !!isNoSuggestWordInAnyDictionary(this.dictionaries, word, options || {});
    };
}

export function createCollection(
    dictionaries: SpellingDictionary[],
    name: string,
    source?: string,
): SpellingDictionaryCollection {
    return new SpellingDictionaryCollectionImpl(dictionaries, name, source);
}

function isWordInAnyDictionary(
    dicts: SpellingDictionary[],
    word: string,
    options: SearchOptionsRO,
): SpellingDictionary | undefined {
    return dicts.find((dict) => dict.has(word, options));
}

function findInAnyDictionary(
    dicts: SpellingDictionary[],
    word: string,
    options: SearchOptionsRO,
): FindResult | undefined {
    const found = dicts.map((dict) => dict.find(word, options)).filter(isDefined);
    if (!found.length) return undefined;
    return found.reduce((a, b) => ({
        found: a.forbidden ? a.found : b.forbidden ? b.found : a.found || b.found,
        forbidden: a.forbidden || b.forbidden,
        noSuggest: a.noSuggest || b.noSuggest,
    }));
}

function isNoSuggestWordInAnyDictionary(
    dicts: SpellingDictionary[],
    word: string,
    options: HasOptionsRO,
): SpellingDictionary | undefined {
    return dicts.find((dict) => dict.isNoSuggestWord(word, options));
}

function isWordForbiddenInAnyDictionary(
    dicts: SpellingDictionary[],
    word: string,
    ignoreCase: boolean | undefined,
): SpellingDictionary | undefined {
    return dicts.find((dict) => dict.isForbidden(word, ignoreCase));
}

export function isSpellingDictionaryCollection(dict: SpellingDictionary): dict is SpellingDictionaryCollection {
    return dict instanceof SpellingDictionaryCollectionImpl;
}

export const __testing__: {
    isWordInAnyDictionary: typeof isWordInAnyDictionary;
    isWordForbiddenInAnyDictionary: typeof isWordForbiddenInAnyDictionary;
} = {
    isWordInAnyDictionary,
    isWordForbiddenInAnyDictionary,
};
