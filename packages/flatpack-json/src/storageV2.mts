import assert from 'node:assert';

import { CompactStorage } from './CompactStorage.mjs';
import { optimizeFlatpacked } from './optimizeFlatpacked.mjs';
import { RefCounter } from './RefCounter.mjs';
import { StringTableBuilder } from './stringTable.mjs';
import { Trie } from './Trie.mjs';
import type {
    ArrayElement,
    BigIntElement,
    DateElement,
    Flatpacked,
    FlatpackIndex,
    FlatpackOptions,
    FlattenedElement,
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
    private cachedArrays = new Map<SimpleHash, number[]>();
    private cachedElementsTrie = new Trie<unknown, FlatpackIndex>();
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
        this.#cacheValue(value, idx);
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
        this.#cacheValue(value, idx);
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
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.#cacheValue(value, idx);
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
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.#cacheValue(value, idx);
        const element: RegExpElement = [
            ElementType.RegExp,
            this.stringToIdx(value.source),
            this.stringToIdx(value.flags),
        ];
        return this.storeElement(value, idx, element);
    }

    private objDateToIdx(value: Date): FlatpackIndex {
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.#cacheValue(value, idx);
        const element: DateElement = [ElementType.Date, value.getTime()];
        return this.storeElement(value, idx, element);
    }

    private bigintToIdx(value: bigint): FlatpackIndex {
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.data.push(0) - 1;
        this.#cacheValue(value, idx);
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
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        if (isObjectWrapper(value)) {
            const idx = this.data.push({}) - 1;
            this.#cacheValue(value, idx);
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
        this.#cacheValue(value, idx);

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
            return this.#cacheValue(value, useIdx);
        }

        this.data[idx] = element;
        return idx;
    }

    private cacheElement(elemIdx: FlatpackIndex, element: CachedElements): FlatpackIndex {
        const foundIdx = this.cachedElementsTrie.get(element);
        if (foundIdx === undefined) {
            this.cachedElementsTrie.set(element, elemIdx);
            return elemIdx;
        }
        if (this.referenced.hasRefs(elemIdx)) {
            if (!this.referenced.hasRefs(foundIdx)) {
                this.cachedElementsTrie.set(element, elemIdx);
            }
            return elemIdx;
        }
        const foundElement = this.data[foundIdx];
        if (!this.referenced.hasRefs(foundIdx) && !isArrayEqual(foundElement, element)) {
            this.cachedElementsTrie.set(element, elemIdx);
            return elemIdx;
        }
        return foundIdx;
    }

    private stashArray(idx: FlatpackIndex, element: ArrayElement): FlatpackIndex {
        const indexHash = simpleHash(element);
        let found = this.cachedArrays.get(indexHash);
        if (!found) {
            found = [];
            this.cachedArrays.set(indexHash, found);
        }
        // It is possible for an array to have a circular reference to itself (possibly through a nested object.).
        // In that case, we want to treat it as a unique array and not dedupe
        // it with other arrays that have the same content.
        if (this.referenced.hasRefs(idx)) {
            found.push(idx);
            return idx;
        }
        const foundIdx = found.find((entry) => isArrayEqual(this.data[entry], element));
        if (foundIdx) {
            return foundIdx;
        }
        found.push(idx);
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
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
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
        this.cachedElementsTrie.clear();
        this.referenced.clear();
        this.data = [dataHeaderV2_0, [ElementType.StringTable]];
    }

    private useFlatpackAnnotation(info: UnpackedAnnotation | undefined): void {
        this.useFlatpackMetaData(info?.meta);
    }

    private useFlatpackMetaData(data: UnpackMetaData | undefined): void {
        if (!data || data.flatpack[0] !== dataHeaderV2_0) {
            return;
        }
        this.unpackMetaData = data;
        const flatpack: Flatpacked = [...data.flatpack];
        const st = flatpack[1];
        assert(isStringTableElement(st), 'Expected a string table element in the flatpack meta data');
        this.stringTable = new StringTableBuilder(st);
        this.data = flatpack;
        this.initFromFlatpackData(flatpack);
        // Clear the referenced indexes since we don't want to treat them as referenced when we re-pack the data.
        this.referenced.clear();
        this.softReset();
    }

    /**
     * Cache the primitives from the unpacked data to improve performance when re-packing the same data.
     */
    private initFromFlatpackData(data: Flatpacked): void {
        for (let i = 3; i < data.length; ++i) {
            this.useFlattenedElement(data[i], i);
        }
    }

    private useFlattenedElement(element: FlattenedElement, index: number): void {
        // Primitives and null are cached directly.
        if (!element || typeof element !== 'object') {
            this.cache.set(element, index);
            return;
        }
        if (!Array.isArray(element)) return;
        // Arrays are cached based on their content, so we need to handle them separately.
        if (element[0] === ElementType.Array) {
            this.stashArray(index, element as ArrayElement);
            return;
        }
        // Other objects are cached based on their identity, so we can cache them directly.
        this.cachedElementsTrie.set(element, index);
    }

    #cacheValue(value: unknown, idx: FlatpackIndex): FlatpackIndex {
        this.cache.set(value, idx);
        return idx;
    }

    #getFromCacheAndReference(value: unknown): FlatpackIndex | undefined {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
        }
        return found;
    }

    toJSON<V extends Serializable>(json: V): Flatpacked {
        this.softReset();
        this.useFlatpackAnnotation(extractUnpackedMetaData(json));
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

type CachedElements = ObjectElement | SetElement | MapElement | RegExpElement | DateElement | BigIntElement;

function isArrayEqual(a: readonly unknown[] | unknown, b: readonly unknown[]): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
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
