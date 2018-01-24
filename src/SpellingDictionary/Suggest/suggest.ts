import {
    Trie,
    WalkerIterator,
} from 'cspell-trie';

import {
    SuggestionResult,
} from './entities';

import {
    wordToFeatures
} from './helpers';

const defaultMinScore = 0.35;

const wPrefix = '^';
const wSuffix = '$';
// const wMidFix = '*';

export interface SuggestionIterator extends IterableIterator<SuggestionResult> {
    /**
     * Ask for the next result.
     * minValue - is used to filter out all suggestions with a matching value less than minValue
     */
    next: (minValue: number) => IteratorResult<SuggestionResult>;
    [Symbol.iterator]: () => SuggestionIterator;
}

export function* suggest(
    trie: Trie,
    word: string,
    minScore: number = defaultMinScore,
): SuggestionIterator {
    yield *suggestIteration(trie.iterate(), word, minScore);
}

export function* suggestIteration(
    i: WalkerIterator,
    word: string,
    minScore: number = defaultMinScore
): SuggestionIterator {

    let goDeeper: boolean = true;

    const fA = wordToFeatures(wPrefix + word + wSuffix);

    for (let r = i.next(goDeeper); !r.done; r = i.next(goDeeper)) {
        const {text, node} = r.value;

        const fB = wordToFeatures(wPrefix + text);
        const rawScore = fA.intersectionScore(fB);
        const bestPossibleScore = fA.count / (fA.count + fB.count - rawScore);
        goDeeper = bestPossibleScore > minScore;

        if (goDeeper && node.f) {
            const fB = wordToFeatures(wPrefix + text + wSuffix);
            const rawScore = fA.intersectionScore(fB);
            const score = rawScore / (fA.count + fB.count - rawScore);
            if (score >= minScore) {
                const r = { word: text, score };
                minScore = (yield r) || minScore;
            }
        }
    }
}

