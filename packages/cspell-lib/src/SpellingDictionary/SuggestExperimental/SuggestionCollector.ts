import type { SuggestionResult } from './entities';
import { compareResults } from './helpers';

export class SuggestionCollector {
    private results: SuggestionResult[] = [];

    constructor(readonly size: number, public minScore: number) {}

    get collection(): SuggestionResult[] {
        return this.results.concat();
    }

    get sortedCollection(): SuggestionResult[] {
        return this.collection.sort(compareResults);
    }
}
