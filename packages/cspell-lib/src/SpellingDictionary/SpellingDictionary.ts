import { genSequence } from 'gensequence';
import { IterableLike } from '../util/IterableLike';
import { Trie, importTrie, SuggestionCollector, SuggestionResult, CompoundWordsMethod } from 'cspell-trie-lib';
import { createMapper } from '../util/repMap';
import { ReplaceMap } from '../Settings';
import { compareBy } from '../util/Comparable';
import { uniqueFn } from '../util/util';
import { ucFirst, removeAccents, isUpperCase } from '../util/text';
import { memorizer } from '../util/Memorizer';

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

export type HasOptions = boolean | SearchOptions;

export interface SpellingDictionary {
    readonly name: string;
    readonly type: string;
    readonly source: string;
    has(word: string, useCompounds: boolean): boolean;
    has(word: string, options: HasOptions): boolean;
    has(word: string, options?: HasOptions): boolean;
    suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void;
    mapWord(word: string): string;
    readonly size: number;
    readonly options: SpellingDictionaryOptions;
    readonly isDictionaryCaseSensitive: boolean;
}

export interface SpellingDictionaryOptions {
    repMap?: ReplaceMap;
    useCompounds?: boolean;
    caseSensitive?: boolean;
}

const defaultSuggestions = 10;

export async function createSpellingDictionary(
    wordList: string[] | IterableLike<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions
): Promise<SpellingDictionary> {
    const { caseSensitive = false } = options || {};
    const mapCase: (v: string) => { w: string, p: boolean }[] = !caseSensitive
        ? a => [
            { w: a, p: false },
            { w: a.toLowerCase(), p: false },
            { w: removeAccents(a), p: false },
            { w: removeAccents(a.toLowerCase()), p: false },
        ]
        : a => {
            const lc = a.toLowerCase();
            const na = removeAccents(a);
            const lc_na = removeAccents(lc);
            return [
                { w: a, p: false },
                { w: na, p: true },
                { w: lc, p: true },
                { w: lc_na, p: true },
            ];
        };
    const words = genSequence(wordList)
        .filter(word => typeof word === 'string')
        .map(word => word.trim())
        .filter(w => !!w)
        .concatMap(mapCase)
        .reduce((s, w) => {
            if (!s.has(w.w)) {
                s.add(w.p ? PREFIX_NO_CASE + w.w : w.w);
            }
            return s;
        }, new Set<string>());
    const trie = Trie.create(words);
    return new SpellingDictionaryFromTrie(trie, name, options, source, words.size);
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
        const { ignoreCase = false } = searchOptions;
        const mWord = this.mapWord(word);
        const forms = wordForms(mWord, this.isDictionaryCaseSensitive, ignoreCase);
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
            return suggestions;
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

function wordForms(word: string, isDictionaryCaseSensitive: boolean, ignoreCase: boolean): string[] {
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();

    if (!isDictionaryCaseSensitive) {
        return [ word, wordLc ];
    }

    const forms = [ word, wordLc ];

    if (ignoreCase) {
        forms.push(PREFIX_NO_CASE + removeAccents(wordLc));
    }
    if (isUpperCase(word)) {
        forms.push(ucFirst(wordLc));
    }
    return forms;
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

export function hasOptionToSearchOption(opt: HasOptions | undefined): SearchOptions {
    return !opt
    ? {}
    : typeof opt === 'object'
    ? opt
    : { useCompounds: opt };
}
