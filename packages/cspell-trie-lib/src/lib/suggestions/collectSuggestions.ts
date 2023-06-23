import type { Progress, SuggestionGenerator, SuggestionResult } from './SuggestionTypes.js';

function isProgress(v: unknown | Progress): v is Progress {
    if (!v || typeof v !== 'object') return false;
    return (v as Progress).type === 'progress';
}

export function collectSuggestions(sugGen: SuggestionGenerator, maxCost = 300, numSugs = 10): SuggestionResult[] {
    const sugs = new Set<SuggestionResult>();
    const sugMap = new Map<string, SuggestionResult>();

    for (let n = sugGen.next(maxCost); !n.done; n = sugGen.next(maxCost)) {
        const sug = n.value;
        if (!sug || isProgress(sug) || sug.cost > maxCost) continue;
        const pref = sugMap.get(sug.word);
        if (pref && pref.cost <= sug.cost) continue;
        if (pref) {
            sugs.delete(pref);
        }
        sugMap.set(sug.word, sug);
        sugs.add(sug);

        if (sugs.size > numSugs) {
            const sorted = [...sugs].sort(compare);
            maxCost = sorted.slice(0, -1).reduce((a, b) => Math.max(a, b.cost), 0);
            sugs.delete(sorted[sorted.length - 1]);
        }
    }

    return [...sugs].sort(compare);

    function compare(a: SuggestionResult, b: SuggestionResult): number {
        return a.cost - b.cost;
    }
}
