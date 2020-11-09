import { genSequence } from 'gensequence';
import { IterableLike } from '../util/IterableLike';
import {
    Trie,
    importTrie,
    SuggestionCollector,
    suggestionCollector,
    SuggestionResult,
    CompoundWordsMethod,
} from 'cspell-trie-lib';
import { createMapper } from '../util/repMap';
import { ReplaceMap, getDefaultSettings } from '../Settings';
import { ucFirst, removeAccents, isUpperCase } from '../util/text';
import { memorizer } from '../util/Memorizer';
import { FunctionArgs } from '../util/types';

// cspell:word café

export {
    CompoundWordsMethod,
    JOIN_SEPARATOR,
    SuggestionCollector,
    suggestionCollector,
    SuggestionResult,
    WORD_SEPARATOR,
} from 'cspell-trie-lib';

export type FilterSuggestionsPredicate = (word: SuggestionResult) => boolean;

export const PREFIX_NO_CASE = '>';
export const regexPrefix = /^[>]/;

export interface SearchOptions {
    useCompounds?: boolean | number;
    ignoreCase?: boolean;
}

export interface SuggestOptions {
    compoundMethod?: CompoundWordsMethod;
    numSuggestions?: number;
    numChanges?: number;
    ignoreCase?: boolean;
}

export type HasOptions = boolean | SearchOptions;

export interface SpellingDictionary {
    readonly name: string;
    readonly type: string;
    readonly source: string;
    has(word: string, useCompounds: boolean): boolean;
    has(word: string, options: HasOptions): boolean;
    has(word: string, options?: HasOptions): boolean;
    suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number
    ): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void;
    mapWord(word: string): string;
    readonly size: number;
    readonly options: SpellingDictionaryOptions;
    readonly isDictionaryCaseSensitive: boolean;
}

export type SuggestArgs =
    | FunctionArgs<SpellingDictionary['suggest']>
    | FunctionArgs<
          (
              word: string,
              numSuggestions?: number,
              compoundMethod?: CompoundWordsMethod,
              numChanges?: number
          ) => SuggestionResult[]
      >;

export interface SpellingDictionaryOptions {
    repMap?: ReplaceMap;
    useCompounds?: boolean;
    caseSensitive?: boolean;
}

export const defaultNumSuggestions = 10;

export function createSpellingDictionary(
    wordList: string[] | IterableLike<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions
): SpellingDictionary {
    // console.log(`createSpellingDictionary ${name} ${source}`);
    const opts = options || {};
    const { caseSensitive = false } = opts;
    const words = new Set(
        genSequence(wordList)
            .filter((word) => typeof word === 'string')
            .map((word) => word.trim())
            .filter((w) => !!w)
            .concatMap(wordDictionaryFormsCollector(caseSensitive))
    );
    const mapWord = createMapper(opts.repMap || []);
    let trieDict: SpellingDictionaryFromTrie | undefined;
    function getTrie() {
        if (trieDict) {
            return trieDict;
        }
        // console.log(`Build Trie ${name}`);
        return (trieDict = new SpellingDictionaryFromTrie(Trie.create(words), name, options, source, words.size));
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

            const useCompounds =
                searchOptions.useCompounds === undefined ? opts.useCompounds : searchOptions.useCompounds;
            if (isDictionaryCaseSensitive || useCompounds || searchOptions.ignoreCase === false) {
                return getTrie().has(word, hasOptions);
            }

            return false;
        },
        suggest: (...args: SuggestArgs) => getTrie().suggest(...(args as FunctionArgs<SpellingDictionary['suggest']>)),
        genSuggestions: (collector: SuggestionCollector, suggestOptions: SuggestOptions) =>
            getTrie().genSuggestions(collector, suggestOptions),
    };
    return dict;
}

export class SpellingDictionaryFromTrie implements SpellingDictionary {
    static readonly cachedWordsLimit = 50000;
    private _size = 0;
    readonly knownWords = new Set<string>();
    readonly unknownWords = new Set<string>();
    readonly mapWord: (word: string) => string;
    readonly type = 'SpellingDictionaryFromTrie';
    readonly isDictionaryCaseSensitive: boolean;

    constructor(
        readonly trie: Trie,
        readonly name: string,
        readonly options: SpellingDictionaryOptions = {},
        readonly source = 'from trie',
        size?: number
    ) {
        trie.root.f = 0;
        this.mapWord = createMapper(options.repMap || []);
        this.isDictionaryCaseSensitive = options.caseSensitive || false;
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
        const useCompounds =
            searchOptions.useCompounds === undefined ? this.options.useCompounds : searchOptions.useCompounds;
        const { ignoreCase = true } = searchOptions;
        return this._has(word, useCompounds, ignoreCase);
    }
    private _has = memorizer(
        (word: string, useCompounds: number | boolean | undefined, ignoreCase: boolean) =>
            this.hasAnyForm(word, useCompounds, ignoreCase),
        SpellingDictionaryFromTrie.cachedWordsLimit
    );

    private hasAnyForm(word: string, useCompounds: number | boolean | undefined, ignoreCase: boolean) {
        const mWord = this.mapWord(word);
        const forms = wordSearchForms(mWord, this.isDictionaryCaseSensitive, ignoreCase);
        for (const w of forms) {
            if (this.trie.has(w, false)) {
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

    public suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number
    ): SuggestionResult[];
    public suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    public suggest(...args: SuggestArgs): SuggestionResult[] {
        const [word, options, compoundMethod, numChanges] = args;
        const suggestOptions: SuggestOptions =
            typeof options === 'object'
                ? options
                : {
                      numSuggestions: options,
                      compoundMethod,
                      numChanges,
                  };
        return this._suggest(word, suggestOptions);
    }

    private _suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[] {
        const {
            numSuggestions = getDefaultSettings().numSuggestions || defaultNumSuggestions,
            numChanges,
            ignoreCase = true,
        } = suggestOptions;
        function filter(word: string): boolean {
            return ignoreCase || word[0] !== PREFIX_NO_CASE;
        }
        const collector = suggestionCollector(word, numSuggestions, filter, numChanges);
        this.genSuggestions(collector, suggestOptions);
        return collector.suggestions.map((r) => ({ ...r, word: r.word.replace(regexPrefix, '') }));
    }

    public genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void {
        const { compoundMethod = CompoundWordsMethod.SEPARATE_WORDS, ignoreCase = true } = suggestOptions;
        const _compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        wordSearchForms(collector.word, this.isDictionaryCaseSensitive, ignoreCase).forEach((w) =>
            this.trie.genSuggestions(impersonateCollector(collector, w), _compoundMethod)
        );
    }
}

function impersonateCollector(collector: SuggestionCollector, word: string): SuggestionCollector {
    return {
        collect: collector.collect,
        add: (suggestion: SuggestionResult) => collector.add(suggestion),
        get suggestions() {
            return collector.suggestions;
        },
        get maxCost() {
            return collector.maxCost;
        },
        get word() {
            return word;
        },
        get maxNumSuggestions() {
            return collector.maxNumSuggestions;
        },
    };
}

function wordSearchForms(word: string, isDictionaryCaseSensitive: boolean, ignoreCase: boolean): string[] {
    // if (!isDictionaryCaseSensitive) {
    //     return [word.toLowerCase()];
    // }
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordNa = removeAccents(word);
    const wordLcNa = removeAccents(wordLc);
    const forms = new Set<string>();
    function add(w: string, prefix = '') {
        forms.add(prefix + w);
    }

    if (!isDictionaryCaseSensitive) {
        add(wordLc);
    }
    add(word);

    // HOUSE -> House, house
    if (isUpperCase(word)) {
        add(wordLc);
        add(ucFirst(wordLc));
    }

    if (!isDictionaryCaseSensitive) {
        add(wordLc);
        add(wordNa);
        add(wordLcNa);
        return [...forms];
    }

    // House -> house
    if (word === ucFirst(wordLc)) {
        add(wordLc);
    }

    // Café -> >café, >cafe
    if (ignoreCase) {
        add(wordNa, PREFIX_NO_CASE);
        add(wordLcNa, PREFIX_NO_CASE);
        if (isUpperCase(word)) {
            add(ucFirst(wordLcNa), PREFIX_NO_CASE);
        }
    }
    return [...forms];
}

interface DictionaryWordForm {
    w: string; // the word
    p: string; // prefix to add
}
function* wordDictionaryForms(word: string, isDictionaryCaseSensitive: boolean): IterableIterator<DictionaryWordForm> {
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordNa = removeAccents(word);
    const wordLcNa = removeAccents(wordLc);
    function wf(w: string, p = '') {
        return { w, p };
    }

    const prefix = isDictionaryCaseSensitive ? PREFIX_NO_CASE : '';
    yield wf(word);
    yield wf(wordNa, prefix);
    yield wf(wordLc, prefix);
    yield wf(wordLcNa, prefix);
}

function wordDictionaryFormsCollector(isDictionaryCaseSensitive: boolean): (word: string) => Iterable<string> {
    const knownWords = new Set<string>();

    return (word: string) => {
        return genSequence(wordDictionaryForms(word, isDictionaryCaseSensitive))
            .filter((w) => !knownWords.has(w.w))
            .map((w) => w.p + w.w)
            .filter((w) => !knownWords.has(w))
            .map((w) => (knownWords.add(w), w));
    };
}

export async function createSpellingDictionaryTrie(
    data: IterableLike<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions
): Promise<SpellingDictionary> {
    const trieNode = importTrie(data);
    const trie = new Trie(trieNode);
    return new SpellingDictionaryFromTrie(trie, name, options, source);
}

export function hasOptionToSearchOption(opt: HasOptions | undefined): SearchOptions {
    return !opt ? {} : typeof opt === 'object' ? opt : { useCompounds: opt };
}

export const __testMethods = {
    wordSearchForms,
    wordDictionaryForms,
    wordDictionaryFormsCollector,
};
