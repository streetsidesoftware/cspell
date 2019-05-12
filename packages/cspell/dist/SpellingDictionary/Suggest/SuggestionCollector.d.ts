import { SuggestionResult } from './entities';
export declare class SuggestionCollector {
    readonly size: number;
    minScore: number;
    private results;
    constructor(size: number, minScore: number);
    readonly collection: SuggestionResult[];
    readonly sortedCollection: SuggestionResult[];
}
