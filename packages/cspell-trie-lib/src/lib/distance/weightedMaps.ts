import { SuggestionCostMapDef } from './suggestionCostsDef';

export type WeightedRepMapTrie = Record<string, WeightedRepTrieNode>;

interface WeightedRepTrieNode {
    /** The nested Trie nodes */
    r?: WeightedRepMapTrie | undefined;
    /** The cost to replace */
    rep?: number | undefined;
    /** The cost to swap */
    swap?: number | undefined;
}

interface TrieCost {
    /** nested trie nodes */
    n?: Record<string, TrieCost>;
    /** the cost to insert/delete */
    c?: number | undefined;
}

interface TrieTrieCost {
    /** nested trie nodes */
    n?: Record<string, TrieTrieCost>;
    /** root of cost trie */
    t?: Record<string, TrieCost>;
}

export interface CostPosition {
    // Starting from word
    a: string;
    // offset within `a`
    ai: number;
    // Goal word
    b: string;
    // offset within `b`
    bi: number;
    // accumulated cost to this point.
    c: number;
}

export interface WeightMap {
    readonly insDel: TrieCost;
    readonly replace: TrieTrieCost;
    readonly swap: TrieTrieCost;

    calcInsDelCosts(pos: CostPosition): Iterable<CostPosition>;
    calcSwapCosts(pos: CostPosition): Iterable<CostPosition>;
    calcReplaceCosts(pos: CostPosition): Iterable<CostPosition>;
}

export function createWeightMap(...defs: SuggestionCostMapDef[]): WeightMap {
    const map = _createWeightMap();
    defs.forEach((def) => addDefToWeightMap(map, def));
    return map;
}

export function addDefToWeightMap(map: WeightMap, def: SuggestionCostMapDef) {
    const mapSets = splitMap(def);

    function addSet(set: string[]) {
        addSetToTrieCost(map.insDel, set, def.insDel);
        addSetToTrieTrieCost(map.replace, set, def.replace);
        addSetToTrieTrieCost(map.swap, set, def.swap);
    }

    mapSets.forEach(addSet);
}

function _createWeightMap(): WeightMap {
    return new _WeightedMap();
}

function lowest(a: number | undefined, b: number | undefined): number | undefined {
    if (a === undefined) return b;
    if (b === undefined) return a;
    return a <= b ? a : b;
}

/**
 * Splits a WeightedMapDef.map
 * @param map
 */
function splitMap(def: Pick<SuggestionCostMapDef, 'map'>): string[][] {
    const { map } = def;

    const sets = map.split('|');
    return sets.map(splitMapSubstrings).filter((s) => s.length > 0);
}

function splitMapSubstrings(map: string): string[] {
    const values = [];
    const len = map.length;

    for (let i = 0; i < len; ++i) {
        const c = map[i];
        if (c !== '(') {
            values.push(c);
            continue;
        }
        const s = i + 1;
        while (map[++i] !== ')' && i < len) {
            // empty
        }
        values.push(map.slice(s, i));
    }

    return values.map((s) => s.trim()).filter((s) => !!s);
}

function addToTrieCost(trie: TrieCost, str: string, cost: number): void {
    if (!str) return;
    let t = trie;
    for (const c of str) {
        const n = (t.n = t.n || Object.create(null));
        t = n[c] = n[c] || Object.create(null);
    }
    t.c = lowest(t.c, cost);
}

function addToTrieTrieCost(trie: TrieTrieCost, left: string, right: string, cost: number): void {
    let t = trie;
    for (const c of left) {
        const n = (t.n = t.n || Object.create(null));
        t = n[c] = n[c] || Object.create(null);
    }
    const trieCost = (t.t = t.t || Object.create(null));
    addToTrieCost(trieCost, right, cost);
}

function addSetToTrieCost(trie: TrieCost, set: string[], cost: number | undefined) {
    if (cost === undefined) return;
    for (const str of set) {
        addToTrieCost(trie, str, cost);
    }
}

function addSetToTrieTrieCost(trie: TrieTrieCost, set: string[], cost: number | undefined) {
    if (cost === undefined) return;
    for (const left of set) {
        for (const right of set) {
            if (left === right) continue;
            addToTrieTrieCost(trie, left, right, cost);
        }
    }
}

function* walkTrieNodes<T extends { n?: Record<string, T> }>(trie: T, str: string, i: number) {
    const len = str.length;

    for (let n = trie.n; i < len && n; ) {
        const t = n[str[i]];
        if (!t) return;
        ++i;
        yield { i, t };
        n = t.n;
    }
}

interface MatchTrieCost {
    i: number;
    c: number;
}

function* findTrieCostPrefixes(trie: TrieCost, str: string, i: number): Iterable<MatchTrieCost> {
    for (const n of walkTrieNodes(trie, str, i)) {
        const c = n.t.c;
        if (c !== undefined) {
            yield { i: n.i, c };
        }
    }
}

interface MatchTrieTrieCost {
    i: number;
    t: TrieCost;
}

function* findTrieTrieCostPrefixes(trie: TrieTrieCost, str: string, i: number): Iterable<MatchTrieTrieCost> {
    for (const n of walkTrieNodes(trie, str, i)) {
        const t = n.t.t;
        if (t !== undefined) {
            yield { i: n.i, t };
        }
    }
}

class _WeightedMap implements WeightMap {
    insDel: TrieCost = {};
    replace: TrieTrieCost = {};
    swap: TrieTrieCost = {};

    *calcInsDelCosts(pos: CostPosition): Iterable<CostPosition> {
        const { a, ai, b, bi, c } = pos;
        for (const del of findTrieCostPrefixes(this.insDel, a, ai)) {
            yield { a, b, ai: del.i, bi, c: c + del.c };
        }
        for (const ins of findTrieCostPrefixes(this.insDel, b, bi)) {
            yield { a, b, ai, bi: ins.i, c: c + ins.c };
        }
    }

    *calcReplaceCosts(pos: CostPosition): Iterable<CostPosition> {
        // Search for matching substrings in `a` to be replaced by
        // matching substrings from `b`. All substrings start at their
        // respective `ai`/`bi` positions.
        const { a, ai, b, bi, c } = pos;
        for (const del of findTrieTrieCostPrefixes(this.replace, a, ai)) {
            for (const ins of findTrieCostPrefixes(del.t, b, bi)) {
                yield { a, b, ai: del.i, bi: ins.i, c: c + ins.c };
            }
        }
    }

    *calcSwapCosts(pos: CostPosition): Iterable<CostPosition> {
        const { a, ai, b, bi, c } = pos;
        const swap = this.swap;

        for (const left of findTrieTrieCostPrefixes(swap, a, ai)) {
            for (const right of findTrieCostPrefixes(left.t, a, left.i)) {
                const sw = a.slice(left.i, right.i) + a.slice(ai, left.i);
                if (b.slice(bi).startsWith(sw)) {
                    const len = sw.length;
                    yield { a, b, ai: ai + len, bi: bi + len, c: c + right.c };
                }
            }
        }
    }
}

export const __testing__ = {
    splitMap,
    splitMapSubstrings,
    findTrieCostPrefixes,
    findTrieTrieCostPrefixes,
};
