import type {
    FindFullResult,
    FindWordOptions,
    ITrie,
    SuggestionCollector,
    SuggestionResult,
    WeightMap,
} from 'cspell-trie-lib';
import { CompoundWordsMethod, decodeTrie, suggestionCollector } from 'cspell-trie-lib';

import { clean } from '../util/clean.js';
import { measurePerf } from '../util/performance.js';
import * as Defaults from './defaults.js';
import type {
    FindOptionsRO,
    FindResult,
    HasOptionsRO,
    MapWordMultipleFn,
    MapWordSingleFn,
    PreferredSuggestion,
    SpellingDictionary,
    SpellingDictionaryOptionsRO,
} from './SpellingDictionary.js';
import {
    createWeightMapFromDictionaryInformation,
    defaultNumSuggestions,
    hasOptionToSearchOption,
    impersonateCollector,
    wordSearchAlternateForms,
    wordSuggestForms,
} from './SpellingDictionaryMethods.js';
import type { SuggestOptions } from './SuggestOptions.js';

export class SpellingDictionaryFromTrie implements SpellingDictionary {
    private _size = 0;
    readonly knownWords: Set<string> = new Set<string>();
    readonly unknownWords: Set<string> = new Set<string>();
    readonly mapWord: MapWordSingleFn | undefined;
    readonly remapWord: MapWordMultipleFn | undefined;
    readonly trie: ITrie;
    readonly type = 'SpellingDictionaryFromTrie';
    readonly isDictionaryCaseSensitive: boolean;
    readonly containsNoSuggestWords: boolean;
    readonly #locale: string | undefined;
    #ignoreForbiddenWords = false;
    #findWordOptionsCaseSensitive: FindWordOptions = { caseSensitive: true };
    #findWordOptionsNotCaseSensitive: FindWordOptions = { caseSensitive: false };

    private weightMap: WeightMap | undefined;

    constructor(
        trie: ITrie,
        readonly name: string,
        readonly options: SpellingDictionaryOptionsRO,
        readonly source = 'from trie',
        size?: number,
    ) {
        this.trie = trie.withReplacements(options.repMap, options.dictionaryInformation?.ignore);
        this.mapWord = this.trie.mapWord;
        this.remapWord = this.trie.remapWord;

        this.isDictionaryCaseSensitive = options.caseSensitive ?? true;
        this.containsNoSuggestWords = options.noSuggest || false;
        this.#locale = options.locale;
        this._size = size || 0;
        this.weightMap = options.weightMap || createWeightMapFromDictionaryInformation(options.dictionaryInformation);
        this.#ignoreForbiddenWords = !!options.ignoreForbiddenWords;
        if (this.#ignoreForbiddenWords) {
            this.#findWordOptionsCaseSensitive.checkForbidden = true;
            this.#findWordOptionsNotCaseSensitive.checkForbidden = true;
        }
    }

    public get size(): number {
        if (!this._size) {
            // walk the trie and get the approximate size.
            const i = this.trie.iterate();
            // eslint-disable-next-line no-useless-assignment
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
    public has(word: string, hasOptions?: HasOptionsRO): boolean {
        const { useCompounds, ignoreCase } = this.resolveOptions(hasOptions);
        const r = this._find(word, useCompounds, ignoreCase, undefined);
        return (r && !r.forbidden && !!r.found) || false;
    }

    public find(word: string, hasOptions?: FindOptionsRO): FindResult | undefined {
        const { useCompounds, ignoreCase } = this.resolveOptions(hasOptions);
        const r = this._find(word, useCompounds, ignoreCase, hasOptions?.compoundSeparator);
        const { forbidden = this.#isForbidden(word) } = r || {};
        if (this.#ignoreForbiddenWords && forbidden) {
            return undefined;
        }
        if (!r && !forbidden) return undefined;
        const { found = forbidden ? word : false } = r || {};
        const noSuggest = found !== false && this.containsNoSuggestWords;
        return { found, forbidden, noSuggest };
    }

    private resolveOptions(hasOptions?: FindOptionsRO): {
        useCompounds: HasOptionsRO['useCompounds'] | undefined;
        ignoreCase: boolean;
    } {
        const { useCompounds = this.options.useCompounds, ignoreCase = Defaults.ignoreCase } =
            hasOptionToSearchOption(hasOptions);
        return { useCompounds, ignoreCase };
    }

    private _find = (
        word: string,
        useCompounds: number | boolean | undefined,
        ignoreCase: boolean,
        compoundSeparator: string | undefined,
    ) => this.findAnyForm(word, useCompounds, ignoreCase, compoundSeparator);

    private findAnyForm(
        word: string,
        useCompounds: number | boolean | undefined,
        ignoreCase: boolean,
        compoundSeparator: string | undefined,
    ): FindAnyFormResult | undefined {
        for (const form of outerWordForms(word)) {
            const r = this._findAnyForm(form, useCompounds, ignoreCase, compoundSeparator);
            if (r) return r;
        }
        return undefined;
    }

    private _findAnyForm(
        mWord: string,
        useCompounds: number | boolean | undefined,
        ignoreCase: boolean,
        compoundSeparator: string | undefined,
    ): FindAnyFormResult | undefined {
        let opts: FindWordOptions = ignoreCase
            ? this.#findWordOptionsNotCaseSensitive
            : this.#findWordOptionsCaseSensitive;

        if (compoundSeparator) {
            opts = { ...opts, compoundSeparator };
        }
        const findResult = this.trie.findWord(mWord, opts);
        if (findResult.found !== false) {
            return findResult;
        }
        const forms = wordSearchAlternateForms(mWord, this.isDictionaryCaseSensitive, ignoreCase, this.#locale);
        for (const w of forms) {
            const findResult = this.trie.findWord(w, opts);
            if (findResult.found !== false) {
                return findResult;
            }
        }
        if (useCompounds) {
            const optsUseCompounds = { ...opts, useLegacyWordCompounds: useCompounds };
            const findResult = this.trie.findWord(mWord, optsUseCompounds);
            if (findResult.found !== false) {
                return findResult;
            }
            for (const w of forms) {
                const findResult = this.trie.findWord(w, optsUseCompounds);
                if (findResult.found !== false) {
                    return findResult;
                }
            }
        }
        return undefined;
    }

    public isNoSuggestWord(word: string, options?: HasOptionsRO): boolean {
        return this.containsNoSuggestWords ? this.has(word, options) : false;
    }

    public isForbidden(word: string, _ignoreCaseAndAccents?: boolean): boolean {
        return this.#ignoreForbiddenWords ? false : this.#isForbidden(word, _ignoreCaseAndAccents);
    }

    #isForbidden(word: string, _ignoreCaseAndAccents?: boolean): boolean {
        return this.trie.isForbiddenWord(word);
    }

    public suggest(word: string, suggestOptions: SuggestOptions = {}): SuggestionResult[] {
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
            }),
        );
        this.genSuggestions(collector, suggestOptions);
        return collector.suggestions.map((r) => ({ ...r, word: r.word }));
    }

    public genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void {
        if (this.options.noSuggest) return;
        const _compoundMethod =
            suggestOptions.compoundMethod ??
            (this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : CompoundWordsMethod.NONE);
        for (const w of wordSuggestForms(collector.word)) {
            this.trie.genSuggestions(impersonateCollector(collector, w), _compoundMethod);
        }
    }

    public getPreferredSuggestions(word: string): PreferredSuggestion[] {
        if (!this.trie.hasPreferredSuggestions) return [];
        const sugs = [...this.trie.getPreferredSuggestions(word)];
        return sugs.map((sug, i) => ({ word: sug, cost: i + 1, isPreferred: true }));
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
    data: string | Uint8Array<ArrayBuffer>,
    name: string,
    source: string,
    options: SpellingDictionaryOptionsRO,
): SpellingDictionary {
    const endPerf = measurePerf('createSpellingDictionaryFromTrieFile');
    const trie = decodeTrie(data);
    const d = new SpellingDictionaryFromTrie(trie, name, options, source);
    endPerf();
    return d;
}

// eslint-disable-next-line no-control-regex
const isAsciiRange = /^[\u0000-\u007F]*$/;

function* outerWordForms(word: string): Iterable<string> {
    yield word;

    // this function is called for every word lookup, so needs to be efficient.
    if (isAsciiRange.test(word)) return;

    const nfc = word.normalize('NFC');
    if (nfc !== word) yield nfc;

    const nfd = word.normalize('NFD');
    if (nfd !== word && nfd !== nfc) yield nfd;
}

export const __testing__: {
    outerWordForms: typeof outerWordForms;
} = { outerWordForms };
