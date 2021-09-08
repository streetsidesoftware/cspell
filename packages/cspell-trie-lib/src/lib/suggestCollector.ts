import { createTimer } from './timer';
import { JOIN_SEPARATOR, WORD_SEPARATOR } from './walker';

const defaultMaxNumberSuggestions = 10;

const baseCost = 100;
const maxNumChanges = 5;
const maxCostScale = 0.5;
// max allowed cost scale should be a bit over 50% to allow for suggestions to short words, but not too high to have too many suggestions.
const maxAllowedCostScale = 1.03 * maxCostScale;

const collator = new Intl.Collator();

const regexSeparator = new RegExp(`[${regexQuote(JOIN_SEPARATOR + WORD_SEPARATOR)}]`, 'g');

const wordLengthCost = [0, 50, 25, 5, 0];
const extraWordsCost = 5;

/** time in ms */
const defaultCollectorTimeout = 1000;

export type Cost = number;
export type MaxCost = Cost;

export interface SuggestionResult {
    word: string;
    cost: Cost;
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

const symStopProcessing = Symbol('Collector Stop Processing');

export type GenerateNextParam = MaxCost | symbol | undefined;
export type GenerateSuggestionResult = SuggestionResult | Progress | undefined;

/**
 * Ask for the next result.
 * maxCost - sets the max cost for following suggestions
 * This is used to limit which suggestions are emitted.
 * If the `iterator.next()` returns `undefined`, it is to request a value for maxCost.
 *
 * The SuggestionIterator is generally the
 */
export type SuggestionGenerator = Generator<GenerateSuggestionResult, void, GenerateNextParam>;

// comparison function for Suggestion Results.
export function compSuggestionResults(a: SuggestionResult, b: SuggestionResult): number {
    return a.cost - b.cost || a.word.length - b.word.length || collator.compare(a.word, b.word);
}

export interface SuggestionCollector {
    /**
     * Collection suggestions from a SuggestionIterator
     * @param src - the SuggestionIterator used to generate suggestions.
     * @param timeout - the amount of time in milliseconds to allow for suggestions.
     * before sending `symbolStopProcessing`
     * Iterator implementation:
     * @example
     * r = yield(suggestion);
     * if (r === collector.symbolStopProcessing) // ...stop generating suggestions.
     */
    collect: (src: SuggestionGenerator, timeout?: number) => void;
    add: (suggestion: SuggestionResult) => SuggestionCollector;
    readonly suggestions: SuggestionResult[];
    readonly maxNumChanges: number;
    readonly maxCost: number;
    readonly word: string;
    readonly maxNumSuggestions: number;
    readonly includesTies: boolean;
    readonly ignoreCase: boolean;
    /**
     * Possible value sent to the SuggestionIterator telling it to stop processing.
     */
    readonly symbolStopProcessing: symbol;
}

export interface SuggestionCollectorOptions {
    /**
     * number of best matching suggestions.
     */
    numSuggestions: number;

    /**
     * An optional filter function that can be used to limit remove unwanted suggestions.
     * I.E. to remove forbidden terms.
     */
    filter?: (word: string, cost: number) => boolean;

    /**
     * The number of letters that can be changed when looking for a match
     */
    changeLimit: number | undefined;

    /**
     * Include suggestions with tied cost even if the number is greater than `numSuggestions`.
     */
    includeTies?: boolean;

    /**
     * specify if case / accents should be ignored when looking for suggestions.
     */
    ignoreCase: boolean | undefined;
}

export const defaultSuggestionCollectorOptions: SuggestionCollectorOptions = {
    numSuggestions: defaultMaxNumberSuggestions,
    filter: () => true,
    changeLimit: maxNumChanges,
    includeTies: true,
    ignoreCase: true,
};

export function suggestionCollector(wordToMatch: string, options: SuggestionCollectorOptions): SuggestionCollector {
    const { filter = () => true, changeLimit = maxNumChanges, includeTies = false, ignoreCase = true } = options;
    const numSuggestions = Math.max(options.numSuggestions, 0) || 0;
    const sugs = new Map<string, SuggestionResult>();
    let maxCost: number = baseCost * Math.min(wordToMatch.length * maxAllowedCostScale, changeLimit);

    function dropMax() {
        if (sugs.size < 2) {
            sugs.clear();
            return;
        }
        const sorted = [...sugs.values()].sort(compSuggestionResults);
        let i = numSuggestions - 1;
        maxCost = sorted[i].cost;
        for (; i < sorted.length && sorted[i].cost <= maxCost; ++i) {
            /* empty */
        }
        for (; i < sorted.length; ++i) {
            sugs.delete(sorted[i].word);
        }
    }

    function adjustCost(sug: SuggestionResult): SuggestionResult {
        const words = sug.word.split(regexSeparator);
        const extraCost =
            words.map((w) => wordLengthCost[w.length] || 0).reduce((a, b) => a + b, 0) +
            (words.length - 1) * extraWordsCost;
        return { word: sug.word, cost: sug.cost + extraCost };
    }

    function handleProgress(_progress: Progress) {
        // Do nothing.
    }

    function collectSuggestion(suggestion: SuggestionResult): MaxCost {
        const { word, cost } = adjustCost(suggestion);
        if (cost <= maxCost && filter(suggestion.word, cost)) {
            const known = sugs.get(word);
            if (known) {
                known.cost = Math.min(known.cost, cost);
            } else {
                sugs.set(word, { word, cost });
                if (cost < maxCost && sugs.size > numSuggestions) {
                    dropMax();
                }
            }
        }
        return maxCost;
    }

    /**
     * Collection suggestions from a SuggestionIterator
     * @param src - the SuggestionIterator used to generate suggestions.
     * @param timeout - the amount of time in milliseconds to allow for suggestions.
     */
    function collect(src: SuggestionGenerator, timeout = defaultCollectorTimeout) {
        let stop: false | symbol = false;
        const timer = createTimer();

        let ir: IteratorResult<SuggestionResult | Progress | undefined>;
        while (!(ir = src.next(stop || maxCost)).done) {
            if (timer.elapsed() > timeout) {
                stop = symStopProcessing;
            }
            const { value } = ir;
            if (!value) continue;
            if (isSuggestionResult(value)) {
                collectSuggestion(value);
                continue;
            }
            handleProgress(value);
        }
    }

    function suggestions() {
        const sorted = [...sugs.values()].sort(compSuggestionResults);
        if (!includeTies && sorted.length > numSuggestions) {
            sorted.length = numSuggestions;
        }
        return sorted;
    }

    const collector: SuggestionCollector = {
        collect,
        add: function (suggestion: SuggestionResult) {
            collectSuggestion(suggestion);
            return this;
        },
        get suggestions() {
            return suggestions();
        },
        get maxCost() {
            return maxCost;
        },
        get word() {
            return wordToMatch;
        },
        get maxNumSuggestions() {
            return numSuggestions;
        },
        get maxNumChanges() {
            return changeLimit;
        },
        includesTies: includeTies,
        ignoreCase,
        symbolStopProcessing: symStopProcessing,
    };

    return collector;
}

export function isSuggestionResult(s: GenerateSuggestionResult): s is SuggestionResult {
    const r = s as Partial<SuggestionResult> | undefined;
    return r?.cost !== undefined && r.word != undefined;
}

/**
 *
 * @param text verbatim text to be inserted into a regexp
 * @returns text that can be used in a regexp.
 */
function regexQuote(text: string): string {
    return text.replace(/[[\]\-+(){},|*.\\]/g, '\\$1');
}
