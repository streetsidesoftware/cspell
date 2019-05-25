import { genSequence } from 'gensequence';
import { IterableLike } from '../util/IterableLike';
import { Trie, importTrie, SuggestionCollector, suggestionCollector, SuggestionResult, CompoundWordsMethod } from 'cspell-trie-lib';
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
    suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void;
    mapWord(word: string): string;
    readonly size: number;
    readonly options: SpellingDictionaryOptions;
    readonly isDictionaryCaseSensitive: boolean;
}

export type SuggestArgs = FunctionArgs<SpellingDictionary['suggest']>
    | FunctionArgs<(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number) => SuggestionResult[]>;

export interface SpellingDictionaryOptions {
    repMap?: ReplaceMap;
    useCompounds?: boolean;
    caseSensitive?: boolean;
}

export const defaultNumSuggestions = 10;

export async function createSpellingDictionary(
    wordList: string[] | IterableLike<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions
): Promise<SpellingDictionary> {
    const { caseSensitive = false } = options || {};
    const words = genSequence(wordList)
        .filter(word => typeof word === 'string')
        .map(word => word.trim())
        .filter(w => !!w)
        .concatMap(wordDictionaryFormsCollector(caseSensitive))
        .toArray();
    const trie = Trie.create(words);
    return new SpellingDictionaryFromTrie(trie, name, options, source, words.length);
}

export class SpellingDictionaryFromTrie implements SpellingDictionary {
    static readonly cachedWordsLimit = 50000;
    private _size: number = 0;
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
        size?: number,
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
            for (let r = i.next(); !r.done; r = i.next(deeper)) {
                // count all nodes even though they are not words.
                // because we are not going to all the leaves, this should give a good enough approximation.
                this._size += 1;
                deeper = r.value.text.length < 5;
            }
        }

        return this._size;
    }

    public has(word: string, hasOptions?: HasOptions) {
        const searchOptions = hasOptionToSearchOption(hasOptions);
        const useCompounds = searchOptions.useCompounds === undefined ? this.options.useCompounds : searchOptions.useCompounds;
        const { ignoreCase = true } = searchOptions;
        const mWord = this.mapWord(word);
        const forms = wordSearchForms(mWord, this.isDictionaryCaseSensitive, ignoreCase);
        for (const w of forms) {
            if (this._has(w, false, ignoreCase)) {
                return true;
            }
        }
        if (useCompounds) {
            for (const w of forms) {
                if (this._has(w, true, ignoreCase)) {
                    return true;
                }
            }
        }
        return false;
    }
    private _has = memorizer(
        (word: string, useCompounds: boolean, _ignoreCase: boolean) => this.trie.has(word, useCompounds),
        SpellingDictionaryFromTrie.cachedWordsLimit
    );

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
        const {
            numSuggestions = getDefaultSettings().numSuggestions || defaultNumSuggestions,
            numChanges,
        } = suggestOptions;
        const collector = suggestionCollector(word, numSuggestions, () => true, numChanges);
        this.genSuggestions(collector, suggestOptions);
        return collector.suggestions;
    }

    public genSuggestions(
        collector: SuggestionCollector,
        suggestOptions: SuggestOptions
    ): void {
        const {
            compoundMethod = CompoundWordsMethod.SEPARATE_WORDS,
            ignoreCase = true,
        } = suggestOptions;
        const _compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        wordSearchForms(collector.word, this.isDictionaryCaseSensitive, ignoreCase)
            .forEach(w => this.trie.genSuggestions(impersonateCollector(collector, w), _compoundMethod));
    }
}

function impersonateCollector(collector: SuggestionCollector, word: string): SuggestionCollector {
    return {
        collect: collector.collect,
        add: (suggestion: SuggestionResult) => collector.add(suggestion),
        get suggestions() { return collector.suggestions; },
        get maxCost() { return collector.maxCost; },
        get word() { return word; },
        get maxNumSuggestions() { return collector.maxNumSuggestions; },
    };
}

function wordSearchForms(word: string, isDictionaryCaseSensitive: boolean, ignoreCase: boolean): string[] {
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordNa = removeAccents(word);
    const wordLcNa = removeAccents(wordLc);
    const forms = new Set<string>();
    function add(w: string, prefix: string = '') {
        forms.add(prefix + w);
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
        return [ ...forms ];
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
    return [ ...forms ];
}

interface DictionaryWordForm {
    w: string;  // the word
    p: string;  // prefix to add
}
function *wordDictionaryForms(word: string, isDictionaryCaseSensitive: boolean): IterableIterator<DictionaryWordForm> {
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordNa = removeAccents(word);
    const wordLcNa = removeAccents(wordLc);
    function wf(w: string, p: string = '') {
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
        .filter(w => !knownWords.has(w.w))
        .map(w => w.p + w.w)
        .filter(w => !knownWords.has(w))
        .map(w => (knownWords.add(w), w));
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
    return !opt
    ? {}
    : typeof opt === 'object'
    ? opt
    : { useCompounds: opt };
}

export const __testMethods = {
    wordSearchForms,
    wordDictionaryForms,
    wordDictionaryFormsCollector,
};
