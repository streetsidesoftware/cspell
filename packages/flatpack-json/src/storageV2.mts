import { CompactStorage } from './CompactStorage.mjs';
import { FlatpackData } from './FlatpackData.mjs';
import {
    extractObjectKeyAndValueIndexes,
    extractObjectKeyAndValueIndexesFrom,
    getFlatpackedRootIdx,
} from './flatpacked.mjs';
import { optimizeFlatpacked } from './optimizeFlatpacked.mjs';
import { RefCounter } from './RefCounter.mjs';
import type { StringTableBuilder } from './stringTable.mjs';
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
    UnpackMetaData,
} from './types.mjs';
import { dataHeaderV2_0, ElementType } from './types.mjs';
import { extractUnpackedAnnotation } from './unpackedAnnotation.mjs';
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
    private data: FlatpackData;
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
    private referencedFromCache = new RefCounter<FlatpackIndex>();
    /**
     * Cache of arrays that have been deduped.
     * The key is a hash of the array elements as a function of the index of the element.
     */
    private cachedArrays = new Map<SimpleHash, FlatpackIndex[]>();
    private cachedElementsTrie = new Trie<unknown, FlatpackIndex>();
    private unpackMetaData: UnpackMetaData | undefined;
    private used: Set<FlatpackIndex> = new Set();

    constructor(options?: FlatpackOptions | undefined) {
        super(options);
        this.dedupe = options?.dedupe ?? true;
        this.sortKeys = options?.sortKeys || this.dedupe;
        this.unpackMetaData = undefined;
        this.data = new FlatpackData(undefined);
        this.stringTable = this.data.stringTable;
        if (options?.meta) {
            this.useFlatpackMetaData(options.meta);
        }
    }

    private primitiveToIdx(value: Primitive): FlatpackIndex {
        if (typeof value === 'string') return this.stringToIdx(value);
        if (typeof value === 'bigint') return this.bigintToIdx(value);
        if (value === undefined) return 0;

        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined && this.data.get(found) === value) {
            return found;
        }

        return this.#setElement(value);
    }

    private addStringPrimitive(value: string): number {
        return -this.stringTable.add(value);
    }

    private stringToIdx(value: string): FlatpackIndex {
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        return this.addStringPrimitive(value);
    }

    private objSetToIdx(value: Set<Serializable>): FlatpackIndex {
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.#reserverForValue(value);
        const keys = [...value];

        const k = this.createUniqueKeys(keys, false);
        const element: SetElement = [ElementType.Set, k];
        return this.storeElement(value, idx, element);
    }

    private createUniqueKeys(keys: Serializable[], cacheValue = true): FlatpackIndex {
        let k = this.arrToIdx(keys, cacheValue);
        const elementKeys = this.data.get(k) as ArrayElement;
        const uniqueKeys = new Set(elementKeys.slice(1));
        if (uniqueKeys.size !== keys.length) {
            // one or more of the keys got deduped. We need to duplicate it.
            uniqueKeys.clear();
            const indexes = elementKeys.slice(1).map((idx) => {
                if (uniqueKeys.has(idx)) {
                    return this.data.duplicateIndex(idx);
                }
                uniqueKeys.add(idx);
                return idx;
            });
            k = this.createArrayElementFromIndexValues(this.data.reserve(), indexes);
        }
        return k;
    }

    private objMapToIdx(value: Map<Serializable, Serializable>): FlatpackIndex {
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.#reserverForValue(value);
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

        const idx = this.#reserverForValue(value);
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

        const idx = this.#reserverForValue(value);
        const element: DateElement = [ElementType.Date, value.getTime()];
        return this.storeElement(value, idx, element);
    }

    private bigintToIdx(value: bigint): FlatpackIndex {
        const found = this.#getFromCacheAndReference(value);
        if (found !== undefined) {
            return found;
        }

        const idx = this.#reserverForValue(value);
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
            const idx = this.data.add({});
            this.#cacheValue(value, idx);
            const element: ObjectElement = [ElementType.Object, 0, this.valueToIdx(value.valueOf())];
            return this.storeElement(value, idx, element);
        }

        const entries = Object.entries(value);

        if (!entries.length) {
            if (this.emptyObjIdx) {
                return this.emptyObjIdx;
            }
            const idx = this.data.add({});
            this.emptyObjIdx = idx;
            return idx;
        }

        if (this.sortKeys) {
            entries.sort(([a], [b]) => compare(a, b));
        }

        const idx = this.#reserverForValue(value);
        const kvp = this.#getObjectKeyValueIndexesFromMetaData(idx);
        const k = this.objectKeysOrValuesToIdx(
            entries.map(([key]) => key),
            kvp?.[0],
        );
        const v = this.objectKeysOrValuesToIdx(
            entries.map(([, value]) => value),
            kvp?.[1],
        );
        const element: ObjectElement = [ElementType.Object, k, v];
        return this.storeElement(value, idx, element);
    }

    private objectKeysOrValuesToIdx(keys: Serializable[], idx: FlatpackIndex | undefined): FlatpackIndex {
        const element: ArrayElement = [ElementType.Array, ...this.mapValuesToIndexes(keys)];
        const cachedIdx = this.cacheElement(element, idx);
        const useIdx = idx ?? cachedIdx;
        this.data.set(useIdx, element);
        return useIdx;
    }

    private mapValuesToIndexes(values: Serializable[]): FlatpackIndex[] {
        return values.map((value) => this.valueToIdx(value));
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
        element: CacheableElements,
    ): FlatpackIndex {
        const useIdx = this.dedupe ? this.cacheElement(element, idx) : idx;

        if (useIdx !== idx) {
            this.data.delete(idx);
            return this.#cacheValue(value, useIdx);
        }

        this.data.set(idx, element);
        return idx;
    }

    private cacheElement(element: CacheableElements, elemIdx: FlatpackIndex | undefined): FlatpackIndex {
        const foundIdx = this.cachedElementsTrie.get(element);
        if (foundIdx === undefined) {
            const idx = elemIdx ?? this.data.reserve();
            this.cachedElementsTrie.set(element, idx);
            return idx;
        }
        if (elemIdx && this.referencedFromCache.isReferenced(elemIdx)) {
            if (!this.referencedFromCache.isReferenced(foundIdx)) {
                this.cachedElementsTrie.set(element, elemIdx);
            }
            return elemIdx;
        }
        const foundElement = this.data.get(foundIdx);
        if (!this.referencedFromCache.isReferenced(foundIdx) && !isArrayEqual(foundElement, element)) {
            const idx = elemIdx ?? this.data.reserve();
            this.cachedElementsTrie.set(element, idx);
            return idx;
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
        // It is possible for an array to have a circular reference to itself (possibly through a nested object).
        // In that case, we want to treat it as a unique array and not dedupe
        // it with other arrays that have the same content.
        if (this.referencedFromCache.isReferenced(idx)) {
            found.push(idx);
            return idx;
        }
        const foundIdx = found.find((entryIdx) => isArrayEqual(this.data.get(entryIdx), element));
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
            this.data.delete(idx);
            this.data.markUsed(useIdx);
            return useIdx;
        }

        this.data.set(idx, element);

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

        const idx = this.#reserverForValue(value, cacheValue);

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

    #reserverForValue(value: Serializable, cacheValue = true): FlatpackIndex {
        const valueIdx = this.#getAvailableValueIndexFromAnnotation(value);
        const idx = valueIdx ?? this.data.reserve();
        this.data.markUsed(idx);
        if (cacheValue) {
            this.cache.set(value, idx);
        }
        return idx;
    }

    #getAvailableValueIndexFromAnnotation(value: Serializable): FlatpackIndex | undefined {
        const idx = this.#getValueIndexFromAnnotation(value);
        return idx !== undefined && !this.data.isUsed(idx) ? idx : undefined;
    }

    #getValueIndexFromAnnotation(value: Serializable): FlatpackIndex | undefined {
        const annotation = extractUnpackedAnnotation(value);
        if (!annotation || annotation.meta !== this.unpackMetaData) return undefined;
        return annotation.index;
    }

    #getSrcElementFromMetaData(idx: FlatpackIndex): FlattenedElement | undefined {
        const flatpack = this.unpackMetaData?.flatpack;
        return flatpack?.[idx];
    }

    #getObjectKeyValueIndexesFromMetaData(
        idx: FlatpackIndex,
    ): [key: FlatpackIndex | undefined, value: FlatpackIndex | undefined] | undefined {
        const kvp = extractObjectKeyAndValueIndexesFrom(this.#getSrcElementFromMetaData(idx));
        if (!kvp) return undefined;
        const [k, v] = kvp;
        const key = (k && this.data.claimOwnership(k, idx) === idx && k) || undefined;
        const value = (v && this.data.claimOwnership(v, idx) === idx && v) || undefined;
        return [key, value];
    }

    #setElement(value: FlattenedElement): FlatpackIndex {
        const idx = this.data.add(value);
        this.#cacheValue(value, idx);
        return idx;
    }

    /**
     * Reset things in a way that allows for reuse.
     */
    private softReset(): void {
        this.cache.clear();
        this.cache.set(undefined, 0);
        this.cachedArrays.clear();
        this.cachedElementsTrie.clear();
        this.referencedFromCache.clear();
        this.used.clear();
        this.data = new FlatpackData([dataHeaderV2_0, this.stringTable.build()]);
        this.stringTable = this.data.stringTable;
        this.emptyObjIdx = 0;
    }

    useFlatpackMetaData(data: UnpackMetaData | undefined): void {
        if (!data || data.flatpack[0] !== dataHeaderV2_0) {
            return;
        }
        this.softReset();
        this.unpackMetaData = data;
        this.data = new FlatpackData(data.flatpack);
        this.stringTable = this.data.stringTable;
        this.initFromFlatpackData();
        // Clear the referenced indexes since we don't want to treat them as referenced when we re-pack the data.
        this.referencedFromCache.clear();
    }

    /**
     * Cache the primitives from the unpacked data to improve performance when re-packing the same data.
     */
    private initFromFlatpackData(): void {
        const data = this.data.flatpack;
        const rootIndex = getFlatpackedRootIdx(data);
        const idxOfObjectKeysAndValues = new Set<FlatpackIndex>();
        for (let i = rootIndex; i < data.length; ++i) {
            const objKeysAndValues = extractObjectKeyAndValueIndexes(data[i]);
            for (const idx of objKeysAndValues) {
                idxOfObjectKeysAndValues.add(idx);
            }
        }
        for (let i = rootIndex + 1; i < data.length; ++i) {
            this.useFlattenedElement(data[i], i, idxOfObjectKeysAndValues);
        }
    }

    private useFlattenedElement(
        element: FlattenedElement,
        index: number,
        idxOfObjectKeysAndValues: Set<FlatpackIndex>,
    ): void {
        // Primitives and null are cached directly.
        if (!element || typeof element !== 'object') {
            this.cache.set(element, index);
            return;
        }
        if (!Array.isArray(element)) return;
        // Arrays are cached based on their content, so we need to handle them separately.
        if (!idxOfObjectKeysAndValues.has(index) && element[0] === ElementType.Array) {
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
            this.data.markUsed(found);
            this.#addReference(found);
        }
        return found;
    }

    #addReference(idx: FlatpackIndex): void {
        this.referencedFromCache.add(idx);
    }

    toJSON<V extends Serializable>(json: V): Flatpacked {
        this.softReset();
        const annotation = extractUnpackedAnnotation(json);
        this.useFlatpackMetaData(this.unpackMetaData ?? annotation?.meta);
        const lastIdx = this.valueToIdx(json);
        if (lastIdx < 0) {
            this.data.add([ElementType.String, lastIdx]);
        }
        const data = this.data.finalize();
        return this.options?.optimize ? optimizeFlatpacked(data) : data;
    }
}

type CacheableElements =
    | ArrayElement // only object keys and object values can be cached using cacheElement
    | ObjectElement
    | SetElement
    | MapElement
    | RegExpElement
    | DateElement
    | BigIntElement;

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
