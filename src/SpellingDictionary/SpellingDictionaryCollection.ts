import {
    CompoundWordsMethod,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestionCollector,
    suggestionCollector,
    SuggestionResult,
} from './SpellingDictionary';
import { genSequence } from 'gensequence';

export class SpellingDictionaryCollection implements SpellingDictionary {
    readonly options: SpellingDictionaryOptions = {};
    readonly mapWord = (word: string) => word;
    readonly wordsToFlag: Set<string>;
    constructor(
        readonly dictionaries: SpellingDictionary[],
        readonly name: string,
        wordsToFlag: string[],
    ) {
        this.dictionaries = this.dictionaries.filter(a => !!a.size);
        this.wordsToFlag = new Set(wordsToFlag.map(w => w.toLowerCase()));
    }

    public has(word: string, useCompounds?: boolean) {
        word = word.toLowerCase();
        return !this.wordsToFlag.has(word) && isWordInAnyDictionary(this.dictionaries, word, useCompounds);
    }

    public suggest(word: string, numSuggestions: number, compoundMethod: CompoundWordsMethod = CompoundWordsMethod.SEPARATE_WORDS): SuggestionResult[] {
        word = word.toLowerCase();
        compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        const collector = this.genSuggestions(
            suggestionCollector(word, numSuggestions, word => !this.wordsToFlag.has(word) ),
            compoundMethod,
        );
        return collector.suggestions;
    }

    public get size() {
        return this.dictionaries.reduce((a, b) => a + b.size, 0);
    }

    public genSuggestions(collector: SuggestionCollector, compoundMethod: CompoundWordsMethod = CompoundWordsMethod.SEPARATE_WORDS): SuggestionCollector {
        compoundMethod = this.options.useCompounds ? CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        this.dictionaries.forEach(dict => dict.genSuggestions(collector, compoundMethod));
        return collector;
    }
}

export function createCollection(dictionaries: SpellingDictionary[], name: string, wordsToFlag: string[] = []) {
    return new SpellingDictionaryCollection(dictionaries, name, wordsToFlag);
}

export function isWordInAnyDictionary(dicts: SpellingDictionary[], word: string, useCompounds?: boolean) {
    return !!genSequence(dicts)
        .first(dict => dict.has(word, useCompounds));
}

export function createCollectionP(
    dicts: Promise<SpellingDictionary>[],
    name: string,
    wordsToFlag: string[],
): Promise<SpellingDictionaryCollection> {
    return Promise.all(dicts)
        .then(dicts => new SpellingDictionaryCollection(dicts, name, wordsToFlag));
}
