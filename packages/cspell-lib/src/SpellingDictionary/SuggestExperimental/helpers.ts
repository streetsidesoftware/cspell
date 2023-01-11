import type { SuggestionResult, Feature } from './entities';

/**
 * Comparison function to return the best (highest score) results first.
 * @param a Result A
 * @param b Result B
 */
export function compareResults(a: SuggestionResult, b: SuggestionResult): number {
    return b.score - a.score || a.word.localeCompare(b.word);
}

export function wordToFeatures(word: string): FeatureMap {
    const map: FeatureMap = new FeatureMap();
    mergeFeatures(map, wordToSingleLetterFeatures(word));
    mergeFeatures(map, wordToTwoLetterFeatures(word));
    return map;
}

export function mergeFeatures(map: FeatureMap, features: Feature[]): void {
    map.append(features);
}

export function wordToSingleLetterFeatures(word: string): Feature[] {
    return word.split('').map((a) => [a, 1] as Feature);
}

export function wordToTwoLetterFeatures(word: string): Feature[] {
    return segmentString(word, 2).map((s) => [s, 1] as Feature);
}

export function segmentString(s: string, segLen: number): string[] {
    const count = Math.max(0, s.length - segLen + 1);
    const result: string[] = new Array<string>(count);
    for (let i = 0; i < count; ++i) {
        result[i] = s.substr(i, segLen);
    }
    return result;
}

export class FeatureMap extends Map<string, number> {
    private _count = 0;

    constructor() {
        super();
    }

    get count(): number {
        return this._count;
    }

    append(features: Feature[]): this {
        features.forEach(([k, v]) => {
            this.set(k, (this.get(k) || 0) + v);
            this._count += v;
        });
        return this;
    }

    correlationScore(m: FeatureMap): number {
        const score = this.intersectionScore(m);
        return score / (this._count + m._count - score);
    }

    intersectionScore(m: FeatureMap): number {
        let score = 0;
        for (const [k, v] of this) {
            score += Math.min(v, m.get(k) || 0);
        }
        return score;
    }
}
