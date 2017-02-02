import { suggest, SuggestionResult } from './suggest';
import { Trie, createTrie, addWordToTrie } from './Trie';
import { genSequence } from 'gensequence';
import * as Rx from 'rxjs/Rx';
import { IterableLike } from '../util/IterableLike';

export interface SpellingDictionary {
    has(word: string): boolean;
    suggest(word: string, numSuggestions?: number): SuggestionResult[];
    size: number;
}

export class SpellingDictionaryInstance implements SpellingDictionary {
    private _trie: Trie;

    constructor(readonly words: Set<string>) {
    }

    get trie() {
        this._trie = this._trie || buildTrieFromSet(this.words);
        return this._trie;
    }

    public has(word: string) {
        return this.words.has(word.toLowerCase());
    }

    public suggest(word: string, numSuggestions?: number): SuggestionResult[] {
        return suggest(this.trie, word.toLowerCase(), numSuggestions);
    }

    public get size() {
        return this.words.size;
    }
}

function buildTrieFromSet(words: Set<string>): Trie {
    return genSequence(words)
        .reduce((trie, word) => addWordToTrie(trie, word), createTrie());
}

export function createSpellingDictionary(wordList: string[] | IterableLike<string>): SpellingDictionary {
    const words = new Set(genSequence(wordList).map(word => word.toLowerCase().trim()));
    return new SpellingDictionaryInstance(words);
}

export function createSpellingDictionaryRx(words: Rx.Observable<string>): Promise<SpellingDictionary> {
    const promise = words
        .map(word => word.toLowerCase().trim())
        .reduce((words, word) => words.add(word), new Set<string>())
        .map(words => new SpellingDictionaryInstance(words))
        .toPromise();
    return promise;
}

