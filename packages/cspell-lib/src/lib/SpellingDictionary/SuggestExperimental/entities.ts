export type Feature = readonly [string, number];

export interface SuggestionResult {
    word: string;
    score: number;
}
