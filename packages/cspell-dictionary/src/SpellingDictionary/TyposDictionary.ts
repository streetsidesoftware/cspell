import { CompoundWordsMethod, SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';
import {
    FindResult,
    HasOptions,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestOptions,
} from './SpellingDictionary';
import { processEntriesToTyposDef, TypoEntry, TyposDef } from './Typos';

class TyposDictionary implements SpellingDictionary {
    readonly containsNoSuggestWords = false;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'typos';
    readonly size: number;
    constructor(readonly name: string, readonly source: string, readonly typosDef: TyposDef) {
        this.size = Object.keys(typosDef).length;
    }

    /**
     * A Forbidden word list does not "have" valid words.
     * Therefore it always returns false.
     * @param _word - the word
     * @param _options - options
     * @returns always false
     */
    has(_word: string, _options?: HasOptions): boolean {
        return false;
    }

    /** A more detailed search for a word, might take longer than `has` */
    find(word: string, _options?: SearchOptions): FindResult | undefined {
        const forbidden = this.isForbidden(word);
        return forbidden ? { found: word, forbidden, noSuggest: true } : undefined;
    }

    isForbidden(word: string): boolean {
        return word in this.typosDef;
    }

    isNoSuggestWord(word: string, _options: HasOptions): boolean {
        return this.isForbidden(word);
    }

    suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number,
        ignoreCase?: boolean
    ): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    public suggest(word: string): SuggestionResult[] {
        if (!(word in this.typosDef)) return [];
        const sug = this.typosDef[word];
        if (!sug) return [];
        if (typeof sug === 'string') {
            return [
                {
                    word: sug,
                    cost: 1,
                    isPreferred: true,
                },
            ];
        }
        return sug.map((word, index) => ({ word, cost: index + 1 }));
    }

    genSuggestions(collector: SuggestionCollector): void {
        const sugs = this.suggest(collector.word);
        sugs.forEach((result) => collector.add(result));
    }
    mapWord(word: string): string {
        return word;
    }
    readonly isDictionaryCaseSensitive: boolean = true;
    getErrors?(): Error[] {
        return [];
    }
}

/**
 * Create a dictionary where all words are to be forbidden.
 * @param entries - list of Typos Entries
 * @param name
 * @param source
 * @param options
 * @returns
 */
export function createTyposDictionary(
    entries: string[] | TyposDef | readonly TypoEntry[],
    name: string,
    source: string
): SpellingDictionary {
    const def = processEntriesToTyposDef(entries);
    return new TyposDictionary(name, source, def);
}
