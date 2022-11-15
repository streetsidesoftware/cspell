import { opAppend, pipe } from '@cspell/cspell-pipe/sync';
import { CompoundWordsMethod, SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';
import {
    FindResult,
    HasOptions,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestOptions,
} from './SpellingDictionary';
import { processEntriesToTyposDef, type TypoEntry, type TyposDef } from './Typos';
import { extractIgnoreValues } from './Typos/util';

const symIgnore = Symbol('ignored');

class TyposDictionary implements SpellingDictionary {
    readonly containsNoSuggestWords = false;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'typos';
    readonly size: number;
    private ignoreWords: Set<string>;
    constructor(
        readonly name: string,
        readonly source: string,
        readonly typosDef: TyposDef,
        ignoreList?: Iterable<string>
    ) {
        this.size = Object.keys(typosDef).length;
        this.ignoreWords = new Set(pipe(extractIgnoreValues(typosDef, '!'), opAppend(ignoreList || [])));
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
        const found = this._findForms(word);
        return typeof found === 'string' ? { found, forbidden: true, noSuggest: false } : undefined;
    }

    private _findForms(word: string): string | typeof symIgnore | false {
        const f = this._find(word);
        if (f !== false) return f;
        const lcWord = word.toLowerCase();
        if (lcWord === word) return false;
        return this._find(lcWord);
    }

    private _find(word: string): string | typeof symIgnore | false {
        if (this.ignoreWords.has(word)) return symIgnore;
        if (word in this.typosDef) return word;
        return false;
    }

    isForbidden(word: string): boolean {
        const found = this._findForms(word);
        return typeof found === 'string';
    }

    isNoSuggestWord(_word: string, _options: HasOptions): boolean {
        return false;
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
        return this._suggest(word) || this._suggest(word.toLowerCase()) || [];
    }

    private _suggest(word: string): SuggestionResult[] | undefined {
        if (this.ignoreWords.has(word)) return [];
        if (!(word in this.typosDef)) return undefined;
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
