import { SuggestionResult } from './suggest';
import { genSequence } from 'gensequence';
import * as Rx from 'rxjs/Rx';
import { IterableLike } from '../util/IterableLike';
import {Trie, importTrieRx} from 'cspell-trie';

export interface SpellingDictionary {
    readonly name: string;
    has(word: string): boolean;
    suggest(word: string, numSuggestions?: number): SuggestionResult[];
    readonly size: number;
}

const defaultSuggestions = 10;

export class SpellingDictionaryFromSet implements SpellingDictionary {
    private _trie: Trie;

    constructor(readonly words: Set<string>, readonly name: string) {
    }

    get trie() {
        this._trie = this._trie || Trie.create(this.words);
        return this._trie;
    }

    public has(word: string) {
        return this.words.has(word.toLowerCase());
    }

    public suggest(word: string, numSuggestions?: number): SuggestionResult[] {
        return this.trie.suggestWithCost(word, numSuggestions || defaultSuggestions);
    }

    public get size() {
        return this.words.size;
    }
}

export function createSpellingDictionary(wordList: string[] | IterableLike<string>, name: string): SpellingDictionary {
    const words = new Set(genSequence(wordList).map(word => word.toLowerCase().trim()));
    return new SpellingDictionaryFromSet(words, name);
}

export function createSpellingDictionaryRx(words: Rx.Observable<string>, name: string): Promise<SpellingDictionary> {
    const promise = words
        .map(word => word.toLowerCase().trim())
        .reduce((words, word) => words.add(word), new Set<string>())
        .map(words => new SpellingDictionaryFromSet(words, name))
        .toPromise();
    return promise;
}



export class SpellingDictionaryFromTrie implements SpellingDictionary {
    static readonly unknownWordsLimit = 1000;
    private _size: number = 0;
    readonly knownWords = new Set<string>();
    readonly unknownWords = new Set<string>();

    constructor(readonly trie: Trie, readonly name: string) {}

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

    public has(word: string) {
        word = word.toLowerCase();
        if (this.knownWords.has(word)) return true;
        if (this.unknownWords.has(word)) return false;

        const r = this.trie.has(word);
        // Cache the result.
        if (r) {
            this.knownWords.add(word);
        } else {
            // clear the unknown word list if it has grown too large.
            if (this.unknownWords.size > SpellingDictionaryFromTrie.unknownWordsLimit) {
                this.unknownWords.clear();
            }
            this.unknownWords.add(word);
        }

        return r;
    }

    public suggest(word: string, numSuggestions?: number): SuggestionResult[] {
        return this.trie.suggestWithCost(word, numSuggestions || defaultSuggestions);
    }
}

export function createSpellingDictionaryTrie(data: Rx.Observable<string>, name: string): Promise<SpellingDictionary> {
    const promise = importTrieRx(data)
        .map(node => new Trie(node))
        .map(trie => new SpellingDictionaryFromTrie(trie, name))
        .take(1)
        .toPromise();
    return promise;
}
