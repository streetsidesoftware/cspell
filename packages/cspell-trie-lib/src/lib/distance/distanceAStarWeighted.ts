import { PairingHeap } from '../utils/PairingHeap';
import { WeightedMapTrie, WeightedRepMapTrie } from './weightedMaps';

/**
 * Calculate the edit distance between two words using an A* algorithm.
 *
 * Using basic weights, this algorithm has the same results as the Damerau-Levenshtein algorithm.
 */
export function distanceAStarWeighted(a: string, b: string, map: WeightedMapTrie, cost = 100): number {
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

        function ins(ai: number, bi: number, m: WeightedMapTrie | undefined) {
            if (bi >= bN || !m) return;
            const n = m[b[bi]];
            if (!n) return;
            const cost = n.insDel;
            ++bi;
            if (cost !== undefined) {
                candidates.add({ ai, bi, c: c + cost });
            }
            ins(ai, bi, n.t);
        }

        function del(ai: number, bi: number, m: WeightedMapTrie | undefined) {
            if (ai >= aN || !m) return;
            const n = m[a[ai]];
            if (!n) return;
            ++ai;
            const cost = n.insDel;
            if (cost !== undefined) {
                candidates.add({ ai, bi, c: c + cost });
            }
            del(ai, bi, n.t);
        }

        function repApply(ai: number, bi: number, m: WeightedRepMapTrie | undefined) {
            if (!m || bi >= bN) return;
            const char = b[bi];
            const n = m[char];
            if (!n) return;
            ++bi;
            const cost = n.rep;
            if (cost !== undefined) {
                candidates.add({ ai, bi, c: c + cost });
            }
            repApply(ai, bi, n.r);
        }

        function rep(ai: number, bi: number, m: WeightedMapTrie | undefined) {
            if (!m || ai >= aN || bi >= bN) return;
            const n = m[a[ai]];
            if (!n) return;
            ++ai;
            repApply(ai, bi, n.r);
            rep(ai, bi, n.t);
        }

        function swap(ai: number, bi: number, m: WeightedMapTrie | undefined) {
            if (!m || ai >= aN || bi >= bN) return;

            function apply(mid: number, right: number, cost: number | undefined) {
                if (cost === undefined) return;
                const swap = a.slice(mid, right) + a.slice(ai, mid);
                const len = swap.length;

                const subB = b.slice(bi, bi + len);
                if (swap === subB) {
                    candidates.add({ ai: ai + len, bi: bi + len, c: cost });
                }
            }

            function right(aim: number, ail: number, m: WeightedRepMapTrie | undefined) {
                if (!m || ail >= aN) return;
                const n = m[a[ail]];
                if (!n) return;
                ++ail;
                apply(aim, ail, n.swap);
                right(aim, ail, n.r);
            }

            function left(aim: number, m: WeightedMapTrie | undefined) {
                if (!m || aim >= aN) return;
                const n = m[a[aim]];
                if (!n) return;
                ++aim;
                right(aim, aim, n.r);
                left(aim, n.t);
            }

            left(ai, m);
        }

        ins(ai, bi, map);
        del(ai, bi, map);
        rep(ai, bi, map);
        swap(ai, bi, map);
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
