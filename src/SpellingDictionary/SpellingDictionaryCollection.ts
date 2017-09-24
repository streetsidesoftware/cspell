import { SpellingDictionary, SuggestionResult, SuggestionCollector, suggestionCollector } from './SpellingDictionary';
import { genSequence } from 'gensequence';

export class SpellingDictionaryCollection implements SpellingDictionary {
    readonly options = {};
    readonly mapWord = (word: string) => word;
    constructor(readonly dictionaries: SpellingDictionary[], readonly name: string) {
        this.dictionaries = this.dictionaries.filter(a => !!a.size);
    }

    public has(word: string) {
        return isWordInAnyDictionary(this.dictionaries, word);
    }

    public suggest(word: string, numSuggestions: number): SuggestionResult[] {
        const collector = this.genSuggestions(suggestionCollector(word, numSuggestions));
        return collector.suggestions;
    }

    public get size() {
        return this.dictionaries.reduce((a, b) => a + b.size, 0);
    }

    public genSuggestions(collector: SuggestionCollector): SuggestionCollector {
        makeSuggestions(this.dictionaries, collector);
        return collector;
    }
}

export function createCollection(dictionaries: SpellingDictionary[], name: string) {
    return new SpellingDictionaryCollection(dictionaries, name);
}

export function isWordInAnyDictionary(dicts: SpellingDictionary[], word: string) {
    return !!genSequence(dicts)
        .first(dict => dict.has(word));
}

export function makeSuggestions(dicts: SpellingDictionary[], collector: SuggestionCollector) {
    dicts.forEach(dict => dict.genSuggestions(collector));
}

export function createCollectionP(dicts: Promise<SpellingDictionary>[], name: string): Promise<SpellingDictionaryCollection> {
    return Promise.all(dicts)
        .then(dicts => new SpellingDictionaryCollection(dicts, name));
}
