import assert from 'node:assert';

import { CompactStorage } from './CompactStorage.mjs';
import { optimizeFlatpacked } from './optimizeFlatpacked.mjs';
import { RefCounter } from './RefCounter.mjs';
import { StringTableBuilder } from './stringTable.mjs';
import type {
    ArrayElement,
    BigIntElement,
    DateElement,
    Flatpacked,
    FlatpackIndex,
    FlatpackOptions,
    MapElement,
    ObjectElement,
    ObjectWrapper,
    Primitive,
    PrimitiveArray,
    PrimitiveObject,
    RegExpElement,
    Serializable,
    SetElement,
    UnpackedAnnotation,
    UnpackMetaData,
} from './types.mjs';
import { dataHeaderV2_0, ElementType, isStringTableElement } from './types.mjs';
import { extractUnpackedMetaData } from './unpackedAnnotation.mjs';
import { WeakCache } from './WeakCache.mjs';

type SimpleHash = number;

const collator = new Intl.Collator('en', {
    usage: 'sort',
    numeric: true,
    sensitivity: 'variant',
    caseFirst: 'upper',
    ignorePunctuation: false,
});
const compare = collator.compare;

export class CompactStorageV2 extends CompactStorage {
    private data: Flatpacked;
    private stringTable: StringTableBuilder;
    private dedupe = true;
    private sortKeys = true;
    private emptyObjIdx = 0;
    /**
     * Cache of primitives and objects that have been added to the data.
     */
    private cache = new WeakCache<FlatpackIndex>([[undefined, 0]]);
    /**
     * Set of indexes that have been referenced by other indexes.
     */
    private referenced = new RefCounter<FlatpackIndex>();
    /**
     * Cache of arrays that have been deduped.
     * The key is a hash of the array elements as a function of the index of the element.
     */
    private cachedArrays = new Map<SimpleHash, { idx: number; v: ArrayElement }[]>();
    private cachedElements = new Map<FlatpackIndex, CacheMap>();
    private unpackMetaData: UnpackMetaData | undefined;

    constructor(options?: FlatpackOptions | undefined) {
        super(options);
        this.dedupe = options?.dedupe ?? true;
        this.sortKeys = options?.sortKeys || this.dedupe;
        this.stringTable = new StringTableBuilder();
        this.data = [dataHeaderV2_0, [ElementType.StringTable]];
    }

    private primitiveToIdx(value: Primitive): FlatpackIndex {
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

    private addStringPrimitive(value: string): number {
        return -this.stringTable.add(value);
    }

    private duplicateIndex(idx: FlatpackIndex): FlatpackIndex {
        const element = this.data[idx];
        const duplicate = this.data.push(element) - 1;
        return duplicate;
    }

    private stringToIdx(value: string): FlatpackIndex {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        return this.addStringPrimitive(value);
    }

    private objSetToIdx(value: Set<Serializable>): FlatpackIndex {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);
        const keys = [...value];

        const k = this.createUniqueKeys(keys, false);
        const element: SetElement = [ElementType.Set, k];
        return this.storeElement(value, idx, element);
    }

    private createUniqueKeys(keys: Serializable[], cacheValue = true): FlatpackIndex {
        let k = this.arrToIdx(keys, cacheValue);
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

    private objMapToIdx(value: Map<Serializable, Serializable>): FlatpackIndex {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);
        const entries = [...value.entries()];

        const k = this.createUniqueKeys(
            entries.map(([key]) => key),
            false,
        );
        const v = this.arrToIdx(
            entries.map(([, value]) => value),
            false,
        );

        const element: MapElement = [ElementType.Map, k, v];
        return this.storeElement(value, idx, element);
    }

    private objRegExpToIdx(value: RegExp): FlatpackIndex {
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

    private objDateToIdx(value: Date): FlatpackIndex {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.cache.set(value, idx);
        const element: DateElement = [ElementType.Date, value.getTime()];
        return this.storeElement(value, idx, element);
    }

    private bigintToIdx(value: bigint): FlatpackIndex {
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

    private objToIdx(value: PrimitiveObject | ObjectWrapper): FlatpackIndex {
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

    /**
     * Store an element in the data array, using the cache if deduplication is enabled.
     * @param value - the value being stored, used for caching purposes.
     * @param idx - the index at which to store the element if it is not found in the cache.
     * @param element - the element to store if it is not found in the cache.
     * @returns the index at which the element is stored.
     */
    private storeElement(
        value: Serializable | ObjectWrapper,
        idx: FlatpackIndex,
        element: CachedElements,
    ): FlatpackIndex {
        const useIdx = this.dedupe ? this.cacheElement(idx, element) : idx;

        if (useIdx !== idx && idx === this.data.length - 1) {
            this.data.length = idx;
            this.cache.set(value, useIdx);
            return useIdx;
        }

        this.data[idx] = element;
        return idx;
    }

    private cacheElement(elemIdx: FlatpackIndex, element: CachedElements): FlatpackIndex {
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
            return this.referenced.hasRefs(elemIdx) ? elemIdx : foundIdx;
        }
        map.set(idx, elemIdx);
        return elemIdx;
    }

    private stashArray(idx: FlatpackIndex, element: ArrayElement): FlatpackIndex {
        const indexHash = simpleHash(element);
        let found = this.cachedArrays.get(indexHash);
        if (!found) {
            found = [];
            this.cachedArrays.set(indexHash, found);
        }
        const foundIdx = found.find((entry) => isEqual(entry.v, element));
        if (foundIdx) {
            return this.referenced.hasRefs(idx) ? idx : foundIdx.idx;
        }
        found.push({ idx, v: element });
        return idx;
    }

    private createArrayElementFromIndexValues(idx: FlatpackIndex, indexValues: FlatpackIndex[]): FlatpackIndex {
        const element: ArrayElement = [ElementType.Array, ...indexValues];
        const useIdx = this.dedupe ? this.stashArray(idx, element) : idx;

        if (useIdx !== idx) {
            assert(this.data.length === idx + 1, `Expected ${idx + 1} but got ${this.data.length}`);
            this.data.length = idx;
            return useIdx;
        }

        this.data[idx] = element;

        return idx;
    }

    /**
     * Convert an array to an index.
     * @param value - The array to convert to an index.
     * @param cacheValue - Whether to cache the value.
     * @returns the index of the array.
     */
    private arrToIdx(value: PrimitiveArray, cacheValue = true): FlatpackIndex {
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

        if (cacheValue) {
            this.cache.set(value, useIdx);
        }
        return useIdx;
    }

    private valueToIdx(value: Serializable): FlatpackIndex {
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

    /**
     * Reset things in a way that allows for reuse.
     */
    private softReset(): void {
        this.cache.clear();
        this.cache.set(undefined, 0);
        this.cachedArrays.clear();
        this.cachedElements.clear();
        this.referenced.clear();
        this.data = [dataHeaderV2_0, [ElementType.StringTable]];
    }

    private useFlatpackMetaData(info: UnpackedAnnotation | undefined): void {
        this.useFlatpackData(info?.meta);
    }

    private useFlatpackData(data: UnpackMetaData | undefined): void {
        if (!data || data.flatpack[0] !== dataHeaderV2_0) {
            this.data = [dataHeaderV2_0, [ElementType.StringTable]];
            return;
        }
        this.unpackMetaData = data;
        const flatpack: Flatpacked = [...data.flatpack];
        const st = flatpack[1];
        if (!isStringTableElement(st)) {
            this.data = [dataHeaderV2_0, [ElementType.StringTable]];
            return;
        }
        this.stringTable = new StringTableBuilder(st);
        this.data = flatpack;
        // At the moment, only the string table is used.
        this.data = [dataHeaderV2_0, [ElementType.StringTable]];
    }

    toJSON<V extends Serializable>(json: V): Flatpacked {
        this.softReset();
        this.useFlatpackMetaData(extractUnpackedMetaData(json));
        const lastIdx = this.valueToIdx(json);
        if (lastIdx < 0) {
            this.data.push([ElementType.String, lastIdx]);
        }
        if (this.stringTable) {
            this.data[1] = this.stringTable.build();
        }
        return this.options?.optimize ? optimizeFlatpacked(this.data) : this.data;
    }
}

type CacheMap = Map<FlatpackIndex, FlatpackIndex | CacheMap>;
type CachedElements = ObjectElement | SetElement | MapElement | RegExpElement | DateElement | BigIntElement;

function isEqual(a: readonly number[], b: readonly number[]): boolean {
    if (a === b) return true;
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
