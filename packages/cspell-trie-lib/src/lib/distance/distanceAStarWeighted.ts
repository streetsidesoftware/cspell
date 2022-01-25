import { PairingHeap } from '../utils/PairingHeap';
import { WeightMap } from './weightedMaps';

/**
 * Calculate the edit distance between two words using an A* algorithm.
 *
 * Using basic weights, this algorithm has the same results as the Damerau-Levenshtein algorithm.
 */
export function distanceAStarWeighted(wordA: string, wordB: string, map: WeightMap, cost = 100): number {
    const best = _distanceAStarWeightedEx(wordA, wordB, map, cost);
    return best ? best.c + best.p : -1;
}

export interface ExResult {
    a: string;
    b: string;
    cost: number;
    segments: {
        a: string;
        b: string;
        c: number;
        p: number;
    }[];
}

export function distanceAStarWeightedEx(
    wordA: string,
    wordB: string,
    map: WeightMap,
    cost = 100
): ExResult | undefined {
    const best = _distanceAStarWeightedEx(wordA, wordB, map, cost);
    if (!best) return undefined;

    const aa = '^' + wordA + '$';
    const bb = '^' + wordB + '$';

    const result: ExResult = {
        a: aa,
        b: bb,
        cost: best.c + best.p,
        segments: [],
    };
    const segments = result.segments;

    for (let n: Node | undefined = best; n.f; n = n.f) {
        const f = n.f;
        const a = aa.slice(f.ai, n.ai);
        const b = bb.slice(f.bi, n.bi);
        const c = n.c - f.c;
        const p = n.p - f.p;
        segments.push({ a, b, c, p });
    }
    segments.reverse();

    return result;
}

function _distanceAStarWeightedEx(wordA: string, wordB: string, map: WeightMap, cost = 100): Node | undefined {
    // Add ^ and $ for begin/end detection.
    const a = '^' + wordA + '$';
    const b = '^' + wordB + '$';
    const aN = a.length;
    const bN = b.length;

    const candidates = new PairingHeap(compare);

    candidates.add({ ai: 0, bi: 0, c: 0, p: 0, f: undefined });

    /** Substitute / Replace */
    function opSub(n: Node) {
        const { ai, bi, c, p } = n;
        if (ai < aN && bi < bN) {
            const cc = a[ai] === b[bi] ? c : c + cost;
            candidates.add({ ai: ai + 1, bi: bi + 1, c: cc, p, f: n });
        }
    }

    /** Insert */
    function opIns(n: Node) {
        const { ai, bi, c, p } = n;
        if (bi < bN) {
            candidates.add({ ai: ai, bi: bi + 1, c: c + cost, p, f: n });
        }
    }

    /** Delete */
    function opDel(n: Node) {
        const { ai, bi, c, p } = n;
        if (ai < aN) {
            candidates.add({ ai: ai + 1, bi: bi, c: c + cost, p, f: n });
        }
    }

    /** Swap adjacent letters */
    function opSwap(n: Node) {
        const { ai, bi, c, p } = n;
        if (a[ai] === b[bi + 1] && a[ai + 1] === b[bi]) {
            candidates.add({ ai: ai + 2, bi: bi + 2, c: c + cost, p, f: n });
        }
    }

    function opMap(n: Node) {
        const { ai, bi, c, p } = n;
        const pos = { a, b, ai, bi, c, p };
        const costCalculations = [map.calcInsDelCosts(pos), map.calcSwapCosts(pos), map.calcReplaceCosts(pos)];
        costCalculations.forEach((iter) => {
            for (const nn of iter) {
                candidates.add({ ...nn, f: n });
            }
        });
    }

    let best: Node | undefined;
    // const bc2 = 2 * bc;
    while ((best = candidates.dequeue())) {
        if (best.ai === aN && best.bi === bN) break;

        opSwap(best);
        opIns(best);
        opDel(best);
        opMap(best);
        opSub(best);
    }

    return best;
}

interface Pos {
    /** the offset in string `a` */
    ai: number;
    /** the offset in string `b` */
    bi: number;
}

interface Node extends Pos {
    /** the current cost */
    c: number;
    /** the current penalty */
    p: number;
    /** from node */
    f: Node | undefined;
}

function compare(a: Node, b: Node): number {
    // Choose lowest cost or farthest Manhattan distance.
    return a.c - b.c || b.ai + b.bi - a.ai - a.bi;
}
