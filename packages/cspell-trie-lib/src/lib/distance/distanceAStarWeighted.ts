import { PairingHeap } from '../utils/PairingHeap';
import { WeightMap } from './weightedMaps';

/**
 * Calculate the edit distance between two words using an A* algorithm.
 *
 * Using basic weights, this algorithm has the same results as the Damerau-Levenshtein algorithm.
 */
export function distanceAStarWeighted(wordA: string, wordB: string, map: WeightMap, cost = 100): number {
    // Add ^ and $ for begin/end detection.
    const a = '^' + wordA + '$';
    const b = '^' + wordB + '$';
    const aN = a.length;
    const bN = b.length;

    const candidates = new PairingHeap(compare);

    candidates.add({ ai: 0, bi: 0, c: 0 });

    function opSub(n: Node) {
        const { ai, bi, c } = n;
        if (ai < aN && bi < bN) {
            const cc = a[ai] === b[bi] ? c : c + cost;
            candidates.add({ ai: ai + 1, bi: bi + 1, c: cc });
        }
    }

    function opIns(n: Node) {
        const { ai, bi, c } = n;
        if (bi < bN) {
            candidates.add({ ai: ai, bi: bi + 1, c: c + cost });
        }
    }

    function opDel(n: Node) {
        const { ai, bi, c } = n;
        if (ai < aN) {
            candidates.add({ ai: ai + 1, bi: bi, c: c + cost });
        }
    }

    function opSwap(n: Node) {
        const { ai, bi, c } = n;
        if (a[ai] === b[bi + 1] && a[ai + 1] === b[bi]) {
            candidates.add({ ai: ai + 2, bi: bi + 2, c: c + cost });
        }
    }

    function opMap(n: Node) {
        const { ai, bi, c } = n;
        const pos = { a, b, ai, bi, c };
        const costCalculations = [map.calcInsDelCosts(pos), map.calcSwapCosts(pos), map.calcReplaceCosts(pos)];
        costCalculations.forEach((iter) => {
            for (const nn of iter) {
                candidates.add(nn);
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

    // istanbul ignore else
    return best ? best.c : -1;
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
}

function compare(a: Node, b: Node): number {
    // Choose lowest cost or farthest Manhattan distance.
    return a.c - b.c || b.ai + b.bi - a.ai - a.bi;
}
