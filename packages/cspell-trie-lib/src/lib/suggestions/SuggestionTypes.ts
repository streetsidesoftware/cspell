export type Cost = number;
export type MaxCost = Cost;

export interface SuggestionResultBase {
    /** The suggested word */
    word: string;

    /** The edit cost 100 = 1 edit */
    cost: Cost;

    /**
     * This suggestion is the preferred suggestion.
     * Setting this to `true` implies that an auto fix is possible.
     */
    isPreferred?: boolean | undefined;
}

export interface SuggestionResult extends SuggestionResultBase {
    /** The suggested word with compound marks, generally a `•` */
    compoundWord?: string | undefined;
}

export interface Progress {
    type: 'progress';
    /** Number of Completed Tasks so far */
    completed: number;
    /**
     * Number of tasks remaining, this number is allowed to increase over time since
     * completed tasks can generate new tasks.
     */
    remaining: number;
}

export type GenerateNextParam = MaxCost | symbol | undefined;
export type GenerateSuggestionResult = SuggestionResultBase | Progress | undefined;
/**
 * Ask for the next result.
 * maxCost - sets the max cost for following suggestions
 * This is used to limit which suggestions are emitted.
 * If the `iterator.next()` returns `undefined`, it is to request a value for maxCost.
 *
 * The SuggestionIterator is generally the
 */

export type SuggestionGenerator = Generator<GenerateSuggestionResult, void, GenerateNextParam>;
