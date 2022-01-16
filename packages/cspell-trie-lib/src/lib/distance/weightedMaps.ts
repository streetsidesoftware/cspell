import { SuggestionCostMapDef } from './suggestionCostsDef';

export type WeightedMapTrie = Record<string, WeightedMapTrieNode>;

interface WeightedMapTrieNode {
    /** The nested Tri nodes */
    t?: WeightedMapTrie | undefined;
    /** the cost to insert/delete this string */
    insDel?: number | undefined;
    /** the related replacement Tri Map */
    r?: WeightedRepMapTrie | undefined;
}

export type WeightedRepMapTrie = Record<string, WeightedRepTrieNode>;

interface WeightedRepTrieNode {
    /** The nested Trie nodes */
    r?: WeightedRepMapTrie | undefined;
    /** The cost to replace */
    rep?: number | undefined;
    /** The cost to swap */
    swap?: number | undefined;
}

export function buildWeightedMapTrie(defs: SuggestionCostMapDef[]): WeightedMapTrie {
    const trie: WeightedMapTrie = createMapTrie();
    defs.forEach((def) => addWeightedDefMapToTrie(def, trie));
    return trie;
}

/**
 * Add weighted map definitions to a WeightedMapTrie
 * @param def - the def to add
 * @param trie - the trie to add it to. NOTE: this trie is modified!
 * @returns the modified trie
 */
export function addWeightedDefMapToTrie(
    def: SuggestionCostMapDef,
    trie: WeightedMapTrie = createMapTrie()
): WeightedMapTrie {
    const mapSets = splitMap(def);

    function addRepToNode(mapSet: string[], n: WeightedMapTrieNode) {
        const root = createRepTrieNode((n.r = n.r || createRepTrie()));
        for (const s of mapSet) {
            let n = root;
            for (const c of s) {
                const r = (n.r = n.r || createRepTrie());
                n = r[c] = r[c] || createRepTrieNode();
            }
            addWeightsToRepNode(n, def);
        }
    }

    function addSet(mapSet: string[]) {
        const r = createMapTrieNode(trie);
        for (const s of mapSet) {
            let n = r;
            for (const c of s) {
                const t = (n.t = n.t || createMapTrie());
                n = t[c] = t[c] || createMapTrieNode();
            }
            addWeightsToNode(n, def);
            if (def.replace !== undefined || def.swap !== undefined) {
                addRepToNode(mapSet, n);
            }
        }
    }

    mapSets.forEach(addSet);

    return trie;
}

function createMapTrie(): WeightedMapTrie {
    return Object.create(null);
}

function createMapTrieNode(t?: WeightedMapTrie): WeightedMapTrieNode {
    const n: WeightedMapTrieNode = {};
    return assignIfDefined(n, 't', t);
}

function createRepTrie(): WeightedRepMapTrie {
    return Object.create(null);
}

function createRepTrieNode(r?: WeightedRepMapTrie): WeightedRepTrieNode {
    const n: WeightedRepTrieNode = {};
    return assignIfDefined(n, 'r', r);
}

function addWeightsToNode(n: WeightedMapTrieNode, def: SuggestionCostMapDef) {
    assignIfDefined(n, 'insDel', lowest(n.insDel, def.insDel));
}

function addWeightsToRepNode(n: WeightedRepTrieNode, def: SuggestionCostMapDef) {
    assignIfDefined(n, 'rep', lowest(n.rep, def.replace));
    assignIfDefined(n, 'swap', lowest(n.swap, def.swap));
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
    return sets.map(splitMapSubstrings);
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

    return values;
}

function assignIfDefined<T, K extends keyof T>(r: T, key: K, v: T[K] | undefined): T {
    if (v === undefined) return r;
    r[key] = v;
    return r;
}

export const __testing__ = {
    splitMap,
    splitMapSubstrings,
};
