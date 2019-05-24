import { genSequence } from 'gensequence';
import { IterableLike } from '../util/IterableLike';
import { Trie, importTrie, SuggestionCollector, SuggestionResult, CompoundWordsMethod } from 'cspell-trie-lib';
import { createMapper } from '../util/repMap';
import { ReplaceMap } from '../Settings';
import { compareBy } from '../util/Comparable';
import { uniqueFn } from '../util/util';

export {
    CompoundWordsMethod,
    JOIN_SEPARATOR,
    SuggestionCollector,
    suggestionCollector,
    SuggestionResult,
    WORD_SEPARATOR,
} from 'cspell-trie-lib';

export type FilterSuggestionsPredicate = (word: SuggestionResult) => boolean;

export interface SpellingDictionary {
    readonly name: string;
    readonly type: string;
    readonly source: string;
    has(word: string, useCompounds?: boolean): boolean;
    suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void;
    mapWord(word: string): string;
    readonly size: number;
    readonly options: SpellingDictionaryOptions;
}

export interface SpellingDictionaryOptions {
    repMap?: ReplaceMap;
    useCompounds?: boolean;
    caseSensitive?: boolean;
}

const defaultSuggestions = 10;

export class SpellingDictionaryFromSet implements SpellingDictionary {
    private _trie: Trie;
    readonly mapWord: (word: string) => string;
    readonly type = 'SpellingDictionaryFromSet';
    readonly isCaseSensitive: boolean;

    constructor(
        readonly words: Set<string>,
        readonly name: string,
        readonly options: SpellingDictionaryOptions = {},
        readonly source = 'Set of words',
    ) {
        this.mapWord = createMapper(options.repMap || []);
        this.isCaseSensitive = options.caseSensitive || false;
    }

    get trie() {
        this._trie = this._trie || Trie.create(this.words);
        return this._trie;
    }

    public has(word: string, useCompounds?: boolean) {
        useCompounds = useCompounds === undefined ? this.options.useCompounds : useCompounds;
        useCompounds = useCompounds || false;
        const mWord = this.mapWord(word);
        return this.words.has(mWord)
            || this.words.has(mWord.toLowerCase())
            || (useCompounds && this.trie.has(mWord, true))
            || false;
    }

    public suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod: CompoundWordsMethod = CompoundWordsMethod.SEPARATE_WORDS,
        numChanges?: number
    ): SuggestionResult[] {
        word = this.mapWord(word);
        return this.trie.suggestWithCost(word, numSuggestions || defaultSuggestions, compoundMethod, numChanges);
    }

    public genSuggestions(
        collector: SuggestionCollector,
        compoundMethod: CompoundWordsMethod = CompoundWordsMethod.SEPARATE_WORDS
    ): void {
        this.trie.genSuggestions(collector, compoundMethod);
    }

    public get size() {
        return this.words.size;
    }
}

export async function createSpellingDictionary(
    wordList: string[] | IterableLike<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions
): Promise<SpellingDictionary> {
    const mapCase: (v: string) => string = options && options.caseSensitive ? a => a : a => a.toLowerCase();
    const words = new Set(genSequence(wordList)
        .filter(word => typeof word === 'string')
        .map(mapCase)
        .filter(word => !!word)
    );
    return new SpellingDictionaryFromSet(words, name, options, source);
}

export class SpellingDictionaryFromTrie implements SpellingDictionary {
    static readonly unknownWordsLimit = 1000;
    private _size: number = 0;
    readonly knownWords = new Set<string>();
    readonly unknownWords = new Set<string>();
    readonly mapWord: (word: string) => string;
    readonly type = 'SpellingDictionaryFromTrie';
    readonly isCaseSensitive: boolean;

    constructor(
        readonly trie: Trie,
        readonly name: string,
        readonly options: SpellingDictionaryOptions = {},
        readonly source = 'from trie',
    ) {
        trie.root.f = 0;
        this.mapWord = createMapper(options.repMap || []);
        this.isCaseSensitive = options.caseSensitive || false;
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

    public has(word: string, useCompounds?: boolean) {
        return this._has(word.toLowerCase(), useCompounds)
            || (this.isCaseSensitive &&  this._has(word, useCompounds));
    }

    private _has(word: string, useCompounds?: boolean) {
        useCompounds = useCompounds === undefined ? this.options.useCompounds : useCompounds;
        useCompounds = useCompounds || false;
        word = this.mapWord(word);
        const wordX = word + '|' + useCompounds;
        if (this.knownWords.has(wordX)) return true;
        if (this.unknownWords.has(wordX)) return false;

        const r = this.trie.has(word, useCompounds);
        // Cache the result.
        if (r) {
            this.knownWords.add(wordX);
        } else {
            // clear the unknown word list if it has grown too large.
            if (this.unknownWords.size > SpellingDictionaryFromTrie.unknownWordsLimit) {
                this.unknownWords.clear();
            }
            this.unknownWords.add(wordX);
        }

        return r;
    }

    public suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod: CompoundWordsMethod = CompoundWordsMethod.SEPARATE_WORDS,
        numChanges?: number
    ): SuggestionResult[] {
        word = this.mapWord(word);
        const wordLc = word.toLowerCase();
        compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        const numSugs = numSuggestions || defaultSuggestions;
        const suggestions = this.trie.suggestWithCost(word, numSugs, compoundMethod, numChanges);
        if (word === wordLc) {
            return suggestions
        }
        return mergeSuggestions(
            numSugs,
            suggestions,
            this.trie.suggestWithCost(wordLc, numSugs, compoundMethod, numChanges)
        );
    }

    public genSuggestions(
        collector: SuggestionCollector,
        compoundMethod: CompoundWordsMethod = CompoundWordsMethod.SEPARATE_WORDS
    ): void {
        compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        this.trie.genSuggestions(collector, compoundMethod);
    }
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

function mergeSuggestions(maxNum: number, ...collections: SuggestionResult[][]): SuggestionResult[] {
    if (collections.length < 2) {
        if (!collections.length) {
            return [];
        }
        const sugs = collections[0];
        sugs.length = Math.min(sugs.length, maxNum);
        return sugs;
    }

    // Note would could make this a linear merge.
    // Logic: make sure the word suggestions are unique (keep the cheapest) and sort by the cost.
    const sugsByWord = collections[0].concat(collections[1]).sort(compareBy('word', 'cost'));
    const sugs = sugsByWord.filter(uniqueFn(a => a.word)).sort(compareBy('cost', 'word'));
    sugs.length = Math.min(sugs.length, maxNum);
    return mergeSuggestions(maxNum, sugs, ...collections.slice(2));
}
