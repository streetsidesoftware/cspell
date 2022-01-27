import { SuggestionCostMapDef } from '../models/suggestionCostsDef';

export type WeightedRepMapTrie = Record<string, WeightedRepTrieNode>;

interface WeightedRepTrieNode {
    /** The nested Trie nodes */
    r?: WeightedRepMapTrie | undefined;
    /** The cost to replace */
    rep?: number | undefined;
    /** The cost to swap */
    swap?: number | undefined;
}

/**
 * Costs are minimized while penalties are maximized.
 */
interface Cost {
    /**
     * The cost of an operation
     * `c'' = min(c, c')`
     */
    c?: number | undefined;
    /**
     * The penalties applied
     * `p'' = max(p, p')`
     */
    p?: number | undefined;
}

interface TrieCost extends Cost {
    /** nested trie nodes */
    n?: Record<string, TrieCost>;
}

interface TrieTrieCost {
    /** nested trie nodes */
    n?: Record<string, TrieTrieCost>;
    /** root of cost trie */
    t?: Record<string, TrieCost>;
}

export interface CostPosition {
    // Word to start with
    a: string;
    // offset within `a`
    ai: number;
    // Word to end with
    b: string;
    // offset within `b`
    bi: number;
    // accumulated cost to this point.
    c: number;
    // accumulated penalties to this point.
    p: number;
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
    addDefsToWeightMap(map, defs);
    return map;
}

export function addDefToWeightMap(
    map: WeightMap,
    def: SuggestionCostMapDef,
    ...defs: SuggestionCostMapDef[]
): WeightMap;
export function addDefToWeightMap(map: WeightMap, ...defs: SuggestionCostMapDef[]): WeightMap {
    return addDefsToWeightMap(map, defs);
}

export function addDefsToWeightMap(map: WeightMap, defs: SuggestionCostMapDef[]): WeightMap {
    function addSet(set: string[], def: SuggestionCostMapDef) {
        addSetToTrieCost(map.insDel, set, def.insDel, def.penalty);
        addSetToTrieTrieCost(map.replace, set, def.replace, def.penalty);
        addSetToTrieTrieCost(map.swap, set, def.swap, def.penalty);
    }

    for (const def of defs) {
        const mapSets = splitMap(def);
        mapSets.forEach((s) => addSet(s, def));
    }
    return map;
}
function _createWeightMap(): WeightMap {
    return new _WeightedMap();
}

function lowest(a: number | undefined, b: number | undefined): number | undefined {
    if (a === undefined) return b;
    if (b === undefined) return a;
    return a <= b ? a : b;
}

function highest(a: number | undefined, b: number | undefined): number | undefined {
    if (a === undefined) return b;
    if (b === undefined) return a;
    return a >= b ? a : b;
}

export function* splitMapSubstringsIterable(map: string): Iterable<string> {
    let seq = '';
    let mode = 0;
    for (const char of map) {
        if (mode && char === ')') {
            yield seq;
            mode = 0;
            continue;
        }
        if (mode) {
            seq += char;
            continue;
        }
        if (char === '(') {
            mode = 1;
            seq = '';
            continue;
        }
        yield char;
    }
}

export function splitMapSubstrings(map: string): string[] {
    return [...splitMapSubstringsIterable(map)];
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

function addToTrieCost(trie: TrieCost, str: string, cost: number, penalties: number | undefined): void {
    if (!str) return;
    let t = trie;
    for (const c of str) {
        const n = (t.n = t.n || Object.create(null));
        t = n[c] = n[c] || Object.create(null);
    }
    t.c = lowest(t.c, cost);
    t.p = highest(t.p, penalties);
}

function addToTrieTrieCost(
    trie: TrieTrieCost,
    left: string,
    right: string,
    cost: number,
    penalties: number | undefined
): void {
    let t = trie;
    for (const c of left) {
        const n = (t.n = t.n || Object.create(null));
        t = n[c] = n[c] || Object.create(null);
    }
    const trieCost = (t.t = t.t || Object.create(null));
    addToTrieCost(trieCost, right, cost, penalties);
}

function addSetToTrieCost(trie: TrieCost, set: string[], cost: number | undefined, penalties: number | undefined) {
    if (cost === undefined) return;
    for (const str of set) {
        addToTrieCost(trie, str, cost, penalties);
    }
}

function addSetToTrieTrieCost(
    trie: TrieTrieCost,
    set: string[],
    cost: number | undefined,
    penalties: number | undefined
) {
    if (cost === undefined) return;
    for (const left of set) {
        for (const right of set) {
            if (left === right) continue;
            addToTrieTrieCost(trie, left, right, cost, penalties);
        }
    }
}

function* searchTrieNodes<T extends { n?: Record<string, T> }>(trie: T, str: string, i: number) {
    const len = str.length;

    for (let n = trie.n; i < len && n; ) {
        const t = n[str[i]];
        if (!t) return;
        ++i;
        yield { i, t };
        n = t.n;
    }
}

function* walkTrieNodes<T extends { n?: Record<string, T> }>(
    t: T | undefined,
    s: string
): Generator<{ s: string; t: T }> {
    if (!t) return;

    yield { s, t };

    if (!t.n) return;

    for (const [k, v] of Object.entries(t.n)) {
        yield* walkTrieNodes(v, s + k);
    }
}

function* walkTrieCost(trie: TrieCost): Generator<{ s: string; c: number; p: number | undefined }> {
    for (const { s, t } of walkTrieNodes(trie, '')) {
        if (t.c) {
            yield { s, c: t.c, p: t.p };
        }
    }
}

function* walkTrieTrieCost(trie: TrieTrieCost): Generator<{ a: string; b: string; c: number; p: number | undefined }> {
    for (const { s: a, t } of walkTrieNodes(trie, '')) {
        if (t.t) {
            for (const { s: b, c, p } of walkTrieCost(t.t)) {
                yield { a, b, c, p };
            }
        }
    }
}

interface MatchTrieCost {
    i: number;
    c: number;
    p: number;
}

function* findTrieCostPrefixes(trie: TrieCost, str: string, i: number): Iterable<MatchTrieCost> {
    for (const n of searchTrieNodes(trie, str, i)) {
        const { c, p } = n.t;
        if (c !== undefined) {
            yield { i: n.i, c, p: p || 0 };
        }
    }
}

interface MatchTrieTrieCost {
    i: number;
    t: TrieCost;
}

function* findTrieTrieCostPrefixes(trie: TrieTrieCost, str: string, i: number): Iterable<MatchTrieTrieCost> {
    for (const n of searchTrieNodes(trie, str, i)) {
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
        const { a, ai, b, bi, c, p } = pos;
        for (const del of findTrieCostPrefixes(this.insDel, a, ai)) {
            yield { a, b, ai: del.i, bi, c: c + del.c, p: p + del.p };
        }
        for (const ins of findTrieCostPrefixes(this.insDel, b, bi)) {
            yield { a, b, ai, bi: ins.i, c: c + ins.c, p: p + ins.p };
        }
    }

    *calcReplaceCosts(pos: CostPosition): Iterable<CostPosition> {
        // Search for matching substrings in `a` to be replaced by
        // matching substrings from `b`. All substrings start at their
        // respective `ai`/`bi` positions.
        const { a, ai, b, bi, c, p } = pos;
        for (const del of findTrieTrieCostPrefixes(this.replace, a, ai)) {
            for (const ins of findTrieCostPrefixes(del.t, b, bi)) {
                yield { a, b, ai: del.i, bi: ins.i, c: c + ins.c, p: p + ins.p };
            }
        }
    }

    *calcSwapCosts(pos: CostPosition): Iterable<CostPosition> {
        const { a, ai, b, bi, c, p } = pos;
        const swap = this.swap;

        for (const left of findTrieTrieCostPrefixes(swap, a, ai)) {
            for (const right of findTrieCostPrefixes(left.t, a, left.i)) {
                const sw = a.slice(left.i, right.i) + a.slice(ai, left.i);
                if (b.slice(bi).startsWith(sw)) {
                    const len = sw.length;
                    yield { a, b, ai: ai + len, bi: bi + len, c: c + right.c, p: p + right.p };
                }
            }
        }
    }
}

function prettyPrintInsDel(trie: TrieCost, pfx = '', indent = '  '): string {
    function* walk() {
        for (const { s, c, p } of walkTrieCost(trie)) {
            const pm = p ? ` + ${p}` : '';
            yield indent + `(${s}) = ${c}${pm}`;
        }
    }
    return ['InsDel:', ...[...walk()].sort()].map((line) => pfx + line + '\n').join('');
}

export function prettyPrintReplace(trie: TrieTrieCost, pfx = '', indent = '  '): string {
    function* walk() {
        for (const { a, b, c, p } of walkTrieTrieCost(trie)) {
            const pm = p ? ` + ${p}` : '';
            yield indent + `(${a}) -> (${b}) = ${c}${pm}`;
        }
    }
    return ['Replace:', ...[...walk()].sort()].map((line) => pfx + line + '\n').join('');
}

export function prettyPrintSwap(trie: TrieTrieCost, pfx = '', indent = '  '): string {
    function* walk() {
        for (const { a, b, c, p } of walkTrieTrieCost(trie)) {
            const pm = p ? ` + ${p}` : '';
            yield indent + `(${a}) <-> (${b}) = ${c}${pm}`;
        }
    }
    return ['Swap:', ...[...walk()].sort()].map((line) => pfx + line + '\n').join('');
}

export function prettyPrintWeightMap(map: WeightMap): string {
    return [prettyPrintInsDel(map.insDel), prettyPrintReplace(map.replace), prettyPrintSwap(map.swap)].join('\n');
}

export function lookupReplaceCost(map: WeightMap, a: string, b: string): undefined | number {
    const trie = map.replace;

    let tt: TrieTrieCost | undefined = trie;
    for (let ai = 0; ai < a.length && tt; ++ai) {
        tt = tt.n?.[a[ai]];
    }
    if (!tt) return undefined;

    let t: TrieCost | undefined = tt.t;
    for (let bi = 0; bi < b.length && t; ++bi) {
        t = t.n?.[b[bi]];
    }

    return t?.c;
}

export const __testing__ = {
    splitMap,
    splitMapSubstrings,
    findTrieCostPrefixes,
    findTrieTrieCostPrefixes,
};
