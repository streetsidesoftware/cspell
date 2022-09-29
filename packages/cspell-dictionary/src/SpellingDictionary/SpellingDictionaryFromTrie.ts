import type {
    FindFullResult,
    FindWordOptions,
    SuggestionCollector,
    SuggestionResult,
    WeightMap,
} from 'cspell-trie-lib';
import { CompoundWordsMethod, importTrie, suggestionCollector, Trie } from 'cspell-trie-lib';
import { createMapper } from '../util/repMap';
import { clean } from '../util/clean';
import {
    FindResult,
    HasOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestOptions,
} from './SpellingDictionary';
import {
    createWeightMapFromDictionaryInformation,
    defaultNumSuggestions,
    hasOptionToSearchOption,
    impersonateCollector,
    SuggestArgs,
    suggestArgsToSuggestOptions,
    wordSearchForms,
    wordSuggestFormsArray,
} from './SpellingDictionaryMethods';
import { autoCache, createCache01 } from '../util/AutoCache';
import { pipe, opConcatMap } from '@cspell/cspell-pipe/sync';
import * as Defaults from './defaults';

const findWordOptionsCaseSensitive: FindWordOptions = Object.freeze({ caseSensitive: true });
const findWordOptionsNotCaseSensitive: FindWordOptions = Object.freeze({ caseSensitive: false });

export class SpellingDictionaryFromTrie implements SpellingDictionary {
    static readonly cachedWordsLimit = 50000;
    private _size = 0;
    readonly knownWords = new Set<string>();
    readonly unknownWords = new Set<string>();
    readonly mapWord: (word: string) => string;
    readonly type = 'SpellingDictionaryFromTrie';
    readonly isDictionaryCaseSensitive: boolean;
    readonly containsNoSuggestWords: boolean;

    private weightMap: WeightMap | undefined;

    constructor(
        readonly trie: Trie,
        readonly name: string,
        readonly options: SpellingDictionaryOptions,
        readonly source = 'from trie',
        size?: number
    ) {
        this.mapWord = createMapper(options.repMap, options.dictionaryInformation?.ignore);
        this.isDictionaryCaseSensitive = options.caseSensitive ?? !trie.isLegacy;
        this.containsNoSuggestWords = options.noSuggest || false;
        this._size = size || 0;
        this.weightMap = options.weightMap || createWeightMapFromDictionaryInformation(options.dictionaryInformation);
    }

    public get size(): number {
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
    public has(word: string, hasOptions?: HasOptions): boolean {
        const { useCompounds, ignoreCase } = this.resolveOptions(hasOptions);
        const r = this._find(word, useCompounds, ignoreCase);
        return !!r && !r.forbidden && !!r.found;
    }

    public find(word: string, hasOptions?: HasOptions): FindResult | undefined {
        const { useCompounds, ignoreCase } = this.resolveOptions(hasOptions);
        const r = this._find(word, useCompounds, ignoreCase);
        const { forbidden = this.isForbidden(word) } = r || {};
        if (!r && !forbidden) return undefined;
        const { found = forbidden ? word : false } = r || {};
        const noSuggest = found !== false && this.containsNoSuggestWords;
        return { found, forbidden, noSuggest };
    }

    private resolveOptions(hasOptions?: HasOptions): {
        useCompounds: HasOptions['useCompounds'] | undefined;
        ignoreCase: boolean;
    } {
        const { useCompounds = this.options.useCompounds, ignoreCase = Defaults.ignoreCase } =
            hasOptionToSearchOption(hasOptions);
        return { useCompounds, ignoreCase };
    }

    private _find = findCache((word: string, useCompounds: number | boolean | undefined, ignoreCase: boolean) =>
        this.findAnyForm(word, useCompounds, ignoreCase)
    );

    private findAnyForm(
        word: string,
        useCompounds: number | boolean | undefined,
        ignoreCase: boolean
    ): FindAnyFormResult | undefined {
        const outerForms = outerWordForms(word, this.mapWord);

        for (const form of outerForms) {
            const r = this._findAnyForm(form, useCompounds, ignoreCase);
            if (r) return r;
        }
        return undefined;
    }

    private _findAnyForm(
        mWord: string,
        useCompounds: number | boolean | undefined,
        ignoreCase: boolean
    ): FindAnyFormResult | undefined {
        const opts: FindWordOptions = ignoreCase ? findWordOptionsNotCaseSensitive : findWordOptionsCaseSensitive;
        const findResult = this.trie.findWord(mWord, opts);
        if (findResult.found !== false) {
            return findResult;
        }
        const forms = wordSearchForms(mWord, this.isDictionaryCaseSensitive, ignoreCase);
        for (const w of forms) {
            const findResult = this.trie.findWord(w, opts);
            if (findResult.found !== false) {
                return findResult;
            }
        }
        if (useCompounds) {
            const optsUseCompounds = { ...opts, useLegacyWordCompounds: useCompounds };
            for (const w of forms) {
                const findResult = this.trie.findWord(w, optsUseCompounds);
                if (findResult.found !== false) {
                    return findResult;
                }
            }
        }
        return undefined;
    }

    public isNoSuggestWord(word: string, options?: HasOptions): boolean {
        return this.containsNoSuggestWords ? this.has(word, options) : false;
    }

    public isForbidden(word: string): boolean {
        return this._isForbidden(word);
    }

    private _isForbidden = autoCache((word: string): boolean => {
        return this.trie.isForbiddenWord(word);
    });

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

    private _suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[] {
        const { numSuggestions = defaultNumSuggestions, numChanges, includeTies, ignoreCase, timeout } = suggestOptions;
        function filter(_word: string): boolean {
            return true;
        }
        const collector = suggestionCollector(
            word,
            clean({
                numSuggestions,
                filter,
                changeLimit: numChanges,
                includeTies,
                ignoreCase,
                timeout,
                weightMap: this.weightMap,
            })
        );
        this.genSuggestions(collector, suggestOptions);
        return collector.suggestions.map((r) => ({ ...r, word: r.word }));
    }

    public genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void {
        if (this.options.noSuggest) return;
        const _compoundMethod =
            suggestOptions.compoundMethod ??
            (this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : CompoundWordsMethod.NONE);
        wordSuggestFormsArray(collector.word).forEach((w) =>
            this.trie.genSuggestions(impersonateCollector(collector, w), _compoundMethod)
        );
    }

    public getErrors(): Error[] {
        return [];
    }
}

type FindAnyFormResult = FindFullResult;

/**
 * Create a dictionary from a trie file.
 * @param data - contents of a trie file.
 * @param name - name of dictionary
 * @param source - filename or uri
 * @param options - options.
 * @returns SpellingDictionary
 */
export function createSpellingDictionaryFromTrieFile(
    data: Iterable<string> | string,
    name: string,
    source: string,
    options: SpellingDictionaryOptions
): SpellingDictionary {
    data = typeof data === 'string' ? data.split('\n') : data;
    const trieNode = importTrie(data);
    const trie = new Trie(trieNode);
    return new SpellingDictionaryFromTrie(trie, name, options, source);
}

type FindFunction = (
    word: string,
    useCompounds: number | boolean | undefined,
    ignoreCase: boolean
) => FindAnyFormResult | undefined;

interface CachedFind {
    useCompounds: number | boolean | undefined;
    ignoreCase: boolean;
    findResult: FindAnyFormResult | undefined;
}

function findCache(fn: FindFunction, size = 2000): FindFunction {
    const cache = createCache01<CachedFind>(size);

    function find(
        word: string,
        useCompounds: number | boolean | undefined,
        ignoreCase: boolean
    ): FindAnyFormResult | undefined {
        const r = cache.get(word);
        if (r !== undefined) {
            if (r.useCompounds === useCompounds && r.ignoreCase === ignoreCase) {
                return r.findResult;
            }
        }
        const findResult = fn(word, useCompounds, ignoreCase);
        cache.set(word, { useCompounds, ignoreCase, findResult });
        return findResult;
    }

    return find;
}

function outerWordForms(word: string, mapWord: (word: string) => string): Set<string> {
    const forms = pipe(
        [word],
        opConcatMap((word) => [word, word.normalize('NFC'), word.normalize('NFD')]),
        opConcatMap((word) => [word, mapWord(word)])
    );

    return new Set(forms);
}

export const __testing__ = { outerWordForms };
