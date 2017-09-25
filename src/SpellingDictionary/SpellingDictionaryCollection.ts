import { SpellingDictionary, SuggestionResult, SuggestionCollector, suggestionCollector } from './SpellingDictionary';
import { genSequence } from 'gensequence';

export class SpellingDictionaryCollection implements SpellingDictionary {
    readonly options = {};
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

    public has(word: string) {
        word = word.toLowerCase();
        return !this.wordsToFlag.has(word) && isWordInAnyDictionary(this.dictionaries, word);
    }

    public suggest(word: string, numSuggestions: number): SuggestionResult[] {
        const collector = this.genSuggestions(suggestionCollector(word, numSuggestions, word => !this.wordsToFlag.has(word) ));
        return collector.suggestions;
    }

    public get size() {
        return this.dictionaries.reduce((a, b) => a + b.size, 0);
    }

    public genSuggestions(collector: SuggestionCollector): SuggestionCollector {
        this.dictionaries.forEach(dict => dict.genSuggestions(collector));
        return collector;
    }
}

export function createCollection(dictionaries: SpellingDictionary[], name: string, wordsToFlag: string[] = []) {
    return new SpellingDictionaryCollection(dictionaries, name, wordsToFlag);
}

export function isWordInAnyDictionary(dicts: SpellingDictionary[], word: string) {
    return !!genSequence(dicts)
        .first(dict => dict.has(word));
}

export function createCollectionP(
    dicts: Promise<SpellingDictionary>[],
    name: string,
    wordsToFlag: string[],
): Promise<SpellingDictionaryCollection> {
    return Promise.all(dicts)
        .then(dicts => new SpellingDictionaryCollection(dicts, name, wordsToFlag));
}
