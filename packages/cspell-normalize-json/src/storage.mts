import assert from 'node:assert';

import { Trie } from './Trie.mjs';
import type {
    ArrayElement,
    BigIntElement,
    DateElement,
    Dehydrated,
    Hydrated,
    Index,
    MapElement,
    NormalizeJsonOptions,
    ObjectElement,
    ObjectWrapper,
    Primitive,
    PrimitiveArray,
    PrimitiveObject,
    RegExpElement,
    Serializable,
    SetElement,
    SubStringElement,
} from './types.mjs';
import { blockSplitRegex, dataHeader, ElementType } from './types.mjs';

const collator = new Intl.Collator('en', {
    usage: 'sort',
    numeric: true,
    sensitivity: 'variant',
    caseFirst: 'upper',
    ignorePunctuation: false,
});
const compare = collator.compare;

const forceStringPrimitives = false;
const minSubStringLen = 4;

export class CompactStorage {
    private data = [dataHeader] as Dehydrated;
    private dedupe = true;
    private sortKeys = true;
    private emptyObjIdx = 0;
    /**
     * Cache of primitives and objects that have been added to the data.
     */
    private cache = new Map<unknown, number>([[undefined, 0]]);
    /**
     * Set of indexes that have been referenced by other indexes.
     */
    private referenced = new Set<number>();
    /**
     * Cache of arrays that have been deduped.
     * The key is a hash of the array elements as a function of the index of the element.
     */
    private cachedArrays = new Map<number, { idx: number; v: ArrayElement }[]>();
    /**
     * Cache of strings that have been deduped and stored in the data array.
     */
    private knownStrings = new Trie<TrieData>();
    private cachedElements = new Map<number, CacheMap>();

    constructor(readonly options?: NormalizeJsonOptions) {
        this.dedupe = options?.dedupe ?? true;
        this.sortKeys = options?.sortKeys || this.dedupe;
    }

    private primitiveToIdx(value: Primitive): number {
        if (typeof value === 'string') return this.stringToIdx(value);
        if (typeof value === 'bigint') return this.bigintToIdx(value);

        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(value) - 1;
        this.cache.set(value, idx);
        return idx;
    }

    private addSubStringRef(idxString: number, value: string, offset: number | undefined): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const sub: SubStringElement = offset
            ? [ElementType.SubString, idxString, value.length, offset]
            : [ElementType.SubString, idxString, value.length];
        const idx = this.data.push(sub) - 1;
        this.cache.set(value, idx);
        return idx;
    }

    private addKnownString(idx: number, value: string) {
        if (value.length >= minSubStringLen) {
            this.knownStrings.add(value.length > 256 ? value.slice(0, 256) : value, { idx });
        }
    }

    private addStringPrimitive(value: string): number {
        const idx = this.data.push(value) - 1;
        this.addKnownString(idx, value);
        this.cache.set(value, idx);
        return idx;
    }

    private duplicateIndex(idx: number): number {
        const element = this.data[idx];
        const duplicate = this.data.push(element) - 1;
        return duplicate;
    }

    private stringToIdx(value: string): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        if (forceStringPrimitives || value.length < minSubStringLen || blockSplitRegex.test(value)) {
            return this.addStringPrimitive(value);
        }

        const trieFound = this.knownStrings.find(value);
        if (!trieFound || !trieFound.data || trieFound.found.length < minSubStringLen) {
            return this.addStringPrimitive(value);
        }

        const { data: tData, found: subStr } = trieFound;
        const sIdx = this.addSubStringRef(tData.idx, subStr, tData.offset);
        if (subStr === value) return sIdx;
        const v = [sIdx, this.stringToIdx(value.slice(subStr.length))];
        const idx = this.data.push([ElementType.String, ...v]) - 1;
        this.cache.set(value, idx);
        this.addKnownString(idx, value);
        return idx;
    }

    private objSetToIdx(value: Set<Serializable>): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);
        const keys = [...value];

        const k = this.createUniqueKeys(keys);
        const element: SetElement = [ElementType.Set, k];
        return this.storeElement(value, idx, element);
    }

    private createUniqueKeys(keys: Serializable[]): Index {
        let k = this.arrToIdx(keys);
        const elementKeys = this.data[k] as ArrayElement;
        const uniqueKeys = new Set(elementKeys.slice(1));
        if (uniqueKeys.size !== keys.length) {
            // one or more of the keys got deduped. We need to duplicate it.
            uniqueKeys.clear();
            const indexes = elementKeys.slice(1).map((idx) => {
                if (uniqueKeys.has(idx)) {
                    return this.duplicateIndex(idx);
                }
                uniqueKeys.add(idx);
                return idx;
            });
            k = this.createArrayElementFromIndexValues(this.data.length, indexes);
        }
        return k;
    }

    private objMapToIdx(value: Map<Serializable, Serializable>): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);
        const entries = [...value.entries()];

        const k = this.createUniqueKeys(entries.map(([key]) => key));
        const v = this.arrToIdx(entries.map(([, value]) => value));

        const element: MapElement = [ElementType.Map, k, v];
        return this.storeElement(value, idx, element);
    }

    private objRegExpToIdx(value: RegExp): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);
        const element: RegExpElement = [
            ElementType.RegExp,
            this.stringToIdx(value.source),
            this.stringToIdx(value.flags),
        ];
        return this.storeElement(value, idx, element);
    }

    private objDateToIdx(value: Date): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);
        const element: DateElement = [ElementType.Date, value.getTime()];
        return this.storeElement(value, idx, element);
    }

    private bigintToIdx(value: bigint): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);
        const element: BigIntElement = [
            ElementType.BigInt,
            this.primitiveToIdx(
                value <= Number.MAX_SAFE_INTEGER && value >= -Number.MAX_SAFE_INTEGER
                    ? Number(value)
                    : value.toString(),
            ),
        ];
        return this.storeElement(value, idx, element);
    }

    private objToIdx(value: PrimitiveObject | ObjectWrapper): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found;
        }

        if (isObjectWrapper(value)) {
            const idx = this.data.push({}) - 1;
            this.cache.set(value, idx);
            const element: ObjectElement = [ElementType.Object, 0, this.valueToIdx(value.valueOf())];
            return this.storeElement(value, idx, element);
        }

        const entries = Object.entries(value);

        if (!entries.length) {
            if (this.emptyObjIdx) {
                return this.emptyObjIdx;
            }
            const idx = this.data.push({}) - 1;
            this.emptyObjIdx = idx;
            return idx;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);

        if (this.sortKeys) {
            entries.sort(([a], [b]) => compare(a, b));
        }

        const k = this.arrToIdx(entries.map(([key]) => key));
        const v = this.arrToIdx(entries.map(([, value]) => value));

        const element: ObjectElement = [ElementType.Object, k, v];
        return this.storeElement(value, idx, element);
    }

    private storeElement(value: Serializable | ObjectWrapper, idx: Index, element: CachedElements): number {
        const useIdx = this.dedupe ? this.cacheElement(idx, element) : idx;

        if (useIdx !== idx && idx === this.data.length - 1) {
            this.data.length = idx;
            this.cache.set(value, useIdx);
            return useIdx;
        }

        this.data[idx] = element;
        return idx;
    }

    private cacheElement(elemIdx: Index, element: CachedElements): number {
        let map: CacheMap = this.cachedElements;
        for (let i = 0; i < element.length - 1; i++) {
            const idx = element[i];
            let found = map.get(idx);
            if (!found) {
                found = new Map();
                map.set(idx, found);
            }
            assert(found instanceof Map);
            map = found;
        }
        const idx = element[element.length - 1];
        const foundIdx = map.get(idx);
        if (typeof foundIdx === 'number') {
            return this.referenced.has(elemIdx) ? elemIdx : foundIdx;
        }
        map.set(idx, elemIdx);
        return elemIdx;
    }

    private stashArray(idx: number, element: ArrayElement): number {
        const indexHash = simpleHash(element);
        let found = this.cachedArrays.get(indexHash);
        if (!found) {
            found = [];
            this.cachedArrays.set(indexHash, found);
        }
        const foundIdx = found.find((entry) => isEqual(entry.v, element));
        if (foundIdx) {
            return this.referenced.has(idx) ? idx : foundIdx.idx;
        }
        found.push({ idx, v: element });
        return idx;
    }

    private createArrayElementFromIndexValues(idx: Index, indexValues: Index[]): Index {
        const element: ArrayElement = [ElementType.Array, ...indexValues];
        const useIdx = this.dedupe ? this.stashArray(idx, element) : idx;

        if (useIdx !== idx) {
            assert(this.data.length == idx + 1, `Expected ${idx + 1} but got ${this.data.length}`);
            this.data.length = idx;
            return useIdx;
        }

        this.data[idx] = element;

        return idx;
    }

    private arrToIdx(value: PrimitiveArray): number {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);

        const useIdx = this.createArrayElementFromIndexValues(
            idx,
            value.map((idx) => this.valueToIdx(idx)),
        );

        this.cache.set(value, useIdx);
        return useIdx;
    }

    private valueToIdx(value: Serializable): number {
        if (value === null) {
            return this.primitiveToIdx(value);
        }

        if (typeof value === 'object') {
            if (value instanceof Set) {
                return this.objSetToIdx(value);
            }
            if (value instanceof Map) {
                return this.objMapToIdx(value);
            }
            if (value instanceof RegExp) {
                return this.objRegExpToIdx(value);
            }
            if (Array.isArray(value)) {
                return this.arrToIdx(value);
            }
            if (value instanceof Date) {
                return this.objDateToIdx(value);
            }
            return this.objToIdx(value as PrimitiveObject);
        }

        return this.primitiveToIdx(value);
    }

    private reset(): void {
        this.cache.clear();
        this.cache.set(undefined, 0);
    }

    toJSON<V extends Serializable>(json: V): Dehydrated {
        this.reset();
        this.valueToIdx(json);
        return this.data;
    }
}

interface TrieData {
    idx: number;
    offset?: number;
}

type CacheMap = Map<Index, Index | CacheMap>;
type CachedElements = ObjectElement | SetElement | MapElement | RegExpElement | DateElement | BigIntElement;

function isEqual(a: readonly number[], b: readonly number[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function simpleHash(values: readonly number[]): number {
    let hash = Math.sqrt(values.length);
    for (const value of values) {
        hash += value * value;
    }
    return hash;
}

function isObjectWrapper(value: unknown): value is ObjectWrapper {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as ObjectWrapper).valueOf === 'function' &&
        value.valueOf() !== value
    );
}

export function toJSON<V extends Serializable>(json: V, options?: NormalizeJsonOptions): Dehydrated {
    return new CompactStorage(options).toJSON(json);
}

export function stringify(data: Hydrated): string {
    return JSON.stringify(toJSON(data));
}
