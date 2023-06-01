import { levenshteinDistance } from '../lib/distance/levenshtein.js';

export interface NearestWords {
    word: string;
    dist: number;
}

export function selectNearestWordsBruteForce(
    word: string,
    words: Iterable<string>,
    count: number,
    maxEdits: number
): NearestWords[] {
    const result: NearestWords[] = [];

    for (const b of words) {
        const dist = levenshteinDistance(word, b);
        if (dist <= maxEdits) {
            result.push({ word: b, dist });
        }
    }

    result.sort((a, b) => a.dist - b.dist);
    return result.slice(0, count);
}
