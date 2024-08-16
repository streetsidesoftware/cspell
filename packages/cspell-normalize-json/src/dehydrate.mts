import assert from 'node:assert';

type Primitive = string | number | boolean | null | undefined | RegExp | Date | bigint;

type PrimitiveSet = Set<Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap>;
type PrimitiveMap = Map<
    Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap,
    Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap
>;

interface PrimitiveObject {
    readonly [key: string]: Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap;
}

interface ObjectWrapper {
    valueOf(): PrimitiveObject;
}

type PrimitiveArray = readonly (Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap)[];

type PrimitiveElement = Primitive;

type Serializable = Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap;

enum ElementType {
    Array = 0,
    Object = 1,
    String = 2,
    SubString = 3,
    Set = 4,
    Map = 5,
    RegExp = 6,
    Date = 7,
    BigInt = 8,
}

interface EmptyObject {
    readonly t?: ElementType.Object;
}

type ObjectBasedElements = EmptyObject;
type ArrayBasedElements =
    | ArrayElement
    | BigIntElement
    | DateElement
    | MapElement
    | ObjectElement
    | RegExpElement
    | SetElement
    | StringElement
    | SubStringElement;

type Index = number;

type StringElement = readonly [type: ElementType.String, ...Index[]];
type SubStringElement = readonly [type: ElementType.SubString, Index, len: number, offset?: number];
type ObjectElement = readonly [type: ElementType.Object, keys: Index, values: Index];
type SetElement = readonly [type: ElementType.Set, keys: Index];
type MapElement = readonly [type: ElementType.Map, keys: Index, values: Index];
type RegExpElement = readonly [type: ElementType.RegExp, pattern: Index, flags: Index];
type DateElement = readonly [type: ElementType.Date, value: number];
type BigIntElement = readonly [type: ElementType.BigInt, value: Index];

type ArrayElement = readonly [type: ElementType.Array, ...Index[]];

type Element = Readonly<PrimitiveElement | ObjectBasedElements | ArrayBasedElements>;

type Header = string;

type Dehydrated = [Header, ...Element[]];

type Hydrated = Readonly<Serializable>;

const blockSplitRegex = /^sha\d/;

export interface NormalizeJsonOptions {
    sortKeys?: boolean;
    /**
     * Dedupe objects and arrays.
     * Implies `sortKeys`.
     */
    dedupe?: boolean;
}

const dataHeader = 'Dehydrated JSON v1';

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

export function toJSON<V extends Serializable>(json: V, options?: NormalizeJsonOptions): Dehydrated {
    const data = [dataHeader] as Dehydrated;
    const dedupe = options?.dedupe ?? true;
    const sortKeys = options?.sortKeys || dedupe;
    let emptyObjIdx = 0;

    const cache = new Map<unknown, number>([[undefined, 0]]);
    const referenced = new Set<number>();
    const cachedArrays = new Map<number, { idx: number; v: ArrayElement }[]>();

    interface TrieData {
        idx: number;
        offset?: number;
    }

    const knownStrings = new Trie<TrieData>();

    /**
     * To dedupe objects, Sets, Maps, etc.
     * ```ts
     * cacheObjs.get(type)?.get(keyIdx)?.get(valueIdx);
     * ```
     */
    type CacheMap = Map<Index, Index | CacheMap>;
    const cachedElements = new Map<number, CacheMap>();
    type CachedElements = ObjectElement | SetElement | MapElement | RegExpElement | DateElement | BigIntElement;

    function primitiveToIdx(value: Primitive): number {
        if (typeof value === 'string') return stringToIdx(value);
        if (typeof value === 'bigint') return bigintToIdx(value);

        const found = cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = data.push(value) - 1;
        cache.set(value, idx);
        return idx;
    }

    function addSubStringRef(idxString: number, value: string, offset: number | undefined): number {
        const found = cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const sub: SubStringElement = offset
            ? [ElementType.SubString, idxString, value.length, offset]
            : [ElementType.SubString, idxString, value.length];
        const idx = data.push(sub) - 1;
        cache.set(value, idx);
        return idx;
    }

    function addKnownString(idx: number, value: string) {
        if (value.length >= minSubStringLen) {
            knownStrings.add(value.length > 256 ? value.slice(0, 256) : value, { idx });
        }
    }

    function addStringPrimitive(value: string): number {
        const idx = data.push(value) - 1;
        addKnownString(idx, value);
        cache.set(value, idx);
        return idx;
    }

    function duplicateIndex(idx: number): number {
        const element = data[idx];
        const duplicate = data.push(element) - 1;
        return duplicate;
    }

    function stringToIdx(value: string): number {
        const found = cache.get(value);
        if (found !== undefined) {
            return found;
        }

        if (forceStringPrimitives || value.length < minSubStringLen || blockSplitRegex.test(value)) {
            return addStringPrimitive(value);
        }

        const trieFound = knownStrings.find(value);
        if (!trieFound || !trieFound.data || trieFound.found.length < minSubStringLen) {
            return addStringPrimitive(value);
        }

        const { data: tData, found: subStr } = trieFound;
        const sIdx = addSubStringRef(tData.idx, subStr, tData.offset);
        if (subStr === value) return sIdx;
        const v = [sIdx, stringToIdx(value.slice(subStr.length))];
        const idx = data.push([ElementType.String, ...v]) - 1;
        cache.set(value, idx);
        addKnownString(idx, value);
        return idx;
    }

    function objSetToIdx(value: Set<Serializable>): number {
        const found = cache.get(value);
        if (found !== undefined) {
            referenced.add(found);
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);
        const keys = [...value];

        const k = createUniqueKeys(keys);
        const element: SetElement = [ElementType.Set, k];
        return storeElement(value, idx, element);
    }

    function createUniqueKeys(keys: Serializable[]): Index {
        let k = arrToIdx(keys);
        const elementKeys = data[k] as ArrayElement;
        const uniqueKeys = new Set(elementKeys.slice(1));
        if (uniqueKeys.size !== keys.length) {
            // one or more of the keys got deduped. We need to duplicate it.
            uniqueKeys.clear();
            const indexes = elementKeys.slice(1).map((idx) => {
                if (uniqueKeys.has(idx)) {
                    return duplicateIndex(idx);
                }
                uniqueKeys.add(idx);
                return idx;
            });
            k = createArrayElementFromIndexValues(data.length, indexes);
        }
        return k;
    }

    function objMapToIdx(value: Map<Serializable, Serializable>): number {
        const found = cache.get(value);
        if (found !== undefined) {
            referenced.add(found);
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);
        const entries = [...value.entries()];

        const k = createUniqueKeys(entries.map(([key]) => key));
        const v = arrToIdx(entries.map(([, value]) => value));

        const element: MapElement = [ElementType.Map, k, v];
        return storeElement(value, idx, element);
    }

    function objRegExpToIdx(value: RegExp): number {
        const found = cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);
        const element: RegExpElement = [ElementType.RegExp, stringToIdx(value.source), stringToIdx(value.flags)];
        return storeElement(value, idx, element);
    }

    function objDateToIdx(value: Date): number {
        const found = cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);
        const element: DateElement = [ElementType.Date, value.getTime()];
        return storeElement(value, idx, element);
    }

    function bigintToIdx(value: bigint): number {
        const found = cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);
        const element: BigIntElement = [
            ElementType.BigInt,
            primitiveToIdx(
                value <= Number.MAX_SAFE_INTEGER && value >= -Number.MAX_SAFE_INTEGER
                    ? Number(value)
                    : value.toString(),
            ),
        ];
        return storeElement(value, idx, element);
    }

    function objToIdx(value: PrimitiveObject | ObjectWrapper): number {
        const found = cache.get(value);
        if (found !== undefined) {
            referenced.add(found);
            return found;
        }

        if (isObjectWrapper(value)) {
            const idx = data.push({}) - 1;
            cache.set(value, idx);
            const element: ObjectElement = [ElementType.Object, 0, valueToIdx(value.valueOf())];
            return storeElement(value, idx, element);
        }

        const entries = Object.entries(value);

        if (!entries.length) {
            if (emptyObjIdx) {
                return emptyObjIdx;
            }
            const idx = data.push({}) - 1;
            emptyObjIdx = idx;
            return idx;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);

        if (sortKeys) {
            entries.sort(([a], [b]) => compare(a, b));
        }

        const k = arrToIdx(entries.map(([key]) => key));
        const v = arrToIdx(entries.map(([, value]) => value));

        const element: ObjectElement = [ElementType.Object, k, v];
        return storeElement(value, idx, element);
    }

    function storeElement(value: Serializable | ObjectWrapper, idx: Index, element: CachedElements): number {
        const useIdx = dedupe ? cacheElement(idx, element) : idx;

        if (useIdx !== idx && idx === data.length - 1) {
            data.length = idx;
            cache.set(value, useIdx);
            return useIdx;
        }

        data[idx] = element;
        return idx;
    }

    function cacheElement(elemIdx: Index, element: CachedElements): number {
        let map: CacheMap = cachedElements;
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
            return referenced.has(elemIdx) ? elemIdx : foundIdx;
        }
        map.set(idx, elemIdx);
        return elemIdx;
    }

    function stashArray(idx: number, element: ArrayElement): number {
        const indexHash = simpleHash(element);
        let found = cachedArrays.get(indexHash);
        if (!found) {
            found = [];
            cachedArrays.set(indexHash, found);
        }
        const foundIdx = found.find((entry) => isEqual(entry.v, element));
        if (foundIdx) {
            return referenced.has(idx) ? idx : foundIdx.idx;
        }
        found.push({ idx, v: element });
        return idx;
    }

    function createArrayElementFromIndexValues(idx: Index, indexValues: Index[]): Index {
        const element: ArrayElement = [ElementType.Array, ...indexValues];
        const useIdx = dedupe ? stashArray(idx, element) : idx;

        if (useIdx !== idx) {
            assert(data.length == idx + 1, `Expected ${idx + 1} but got ${data.length}`);
            data.length = idx;
            return useIdx;
        }

        data[idx] = element;

        return idx;
    }

    function arrToIdx(value: PrimitiveArray): number {
        const found = cache.get(value);
        if (found !== undefined) {
            referenced.add(found);
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);

        const useIdx = createArrayElementFromIndexValues(
            idx,
            value.map((idx) => valueToIdx(idx)),
        );

        cache.set(value, useIdx);
        return useIdx;
    }

    function valueToIdx(value: Serializable): number {
        if (value === null) {
            // eslint-disable-next-line unicorn/no-null
            return primitiveToIdx(null);
        }

        if (typeof value === 'object') {
            if (value instanceof Set) {
                return objSetToIdx(value);
            }
            if (value instanceof Map) {
                return objMapToIdx(value);
            }
            if (value instanceof RegExp) {
                return objRegExpToIdx(value);
            }
            if (Array.isArray(value)) {
                return arrToIdx(value);
            }
            if (value instanceof Date) {
                return objDateToIdx(value);
            }
            return objToIdx(value as PrimitiveObject);
        }

        return primitiveToIdx(value);
    }

    valueToIdx(json);

    return data;
}

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

export function fromJSON(data: Dehydrated): Hydrated {
    const [header] = data;

    if (header !== dataHeader) {
        throw new Error('Invalid header');
    }

    const cache = new Map<number | number[], Hydrated>([[0, undefined]]);
    /**
     * indexes that have been referenced by other objects.
     */
    const referenced = new Set<number>();

    function mergeKeysValues<K>(keys: readonly K[], values: PrimitiveArray): [K, Serializable][] {
        return keys.map((key, i) => [key, values[i]]);
    }

    function toSet(idx: number, elem: SetElement): PrimitiveSet {
        const [_, k] = elem;
        const s: PrimitiveSet = k ? (new Set(idxToArr(k)) as PrimitiveSet) : new Set();
        cache.set(idx, s);
        return s;
    }

    function toMap(idx: number, elem: MapElement): PrimitiveMap {
        const [_, k, v] = elem;
        const m: PrimitiveMap =
            !k || !v ? new Map() : (new Map(mergeKeysValues(idxToArr(k), idxToArr(v))) as PrimitiveMap);
        cache.set(idx, m);
        return m;
    }

    function toRegExp(idx: number, elem: RegExpElement): RegExp {
        const [_, pattern, flags] = elem;
        const p = idxToValue(pattern) as string;
        const f = idxToValue(flags) as string;
        const r = new RegExp(p, f);
        cache.set(idx, r);
        return r;
    }

    function toBigInt(idx: number, elem: BigIntElement): bigint {
        const [_, vIdx] = elem;
        const r = BigInt(idxToValue(vIdx) as string | number);
        cache.set(idx, r);
        return r;
    }

    function toDate(idx: number, elem: DateElement): Date {
        const [_, value] = elem;
        const r = new Date(value);
        cache.set(idx, r);
        return r;
    }

    function toString(idx: number, elem: StringElement | string): string {
        const s = typeof elem === 'string' ? elem : idxToValue(elem.slice(1) as number[]);
        cache.set(idx, s);
        return s as string;
    }

    function toObj(idx: number, elem: ObjectElement): PrimitiveObject {
        const [_, k, v] = elem;

        // Object Wrapper
        if (!k && v) {
            const obj = Object(idxToValue(v));
            cache.set(idx, obj);
            return obj as PrimitiveObject;
        }

        const obj = {};
        cache.set(idx, obj);

        if (!k || !v) return obj;
        const keys = idxToArr(k) as string[];
        const values = idxToArr(v);
        Object.assign(obj, Object.fromEntries(mergeKeysValues(keys, values)));
        return obj;
    }

    function idxToArr(idx: number): PrimitiveArray {
        const element = data[idx];
        assert(isArrayElement(element));
        return toArr(idx, element);
    }

    function toArr(idx: number, element: ArrayElement): PrimitiveArray {
        const placeHolder: Serializable[] = [];
        const refs = element.slice(1);
        cache.set(idx, placeHolder);
        const arr = refs.map(idxToValue);
        // check if the array has been referenced by another object.
        if (!referenced.has(idx)) {
            // It has not, just replace the placeholder with the array.
            cache.set(idx, arr);
            return arr;
        }
        placeHolder.push(...arr);
        return placeHolder;
    }

    function handleSubStringElement(idx: number, refs: SubStringElement): string {
        const [_t, sIdx, len, offset = 0] = refs;
        const s = `${idxToValue(sIdx)}`.slice(offset, offset + len);
        cache.set(idx, s);
        return s;
    }

    function handleArrayElement(
        idx: number,
        element: ArrayBasedElements,
    ): PrimitiveArray | Primitive | PrimitiveObject | PrimitiveSet | PrimitiveMap {
        switch (element[0]) {
            case ElementType.Array: {
                break;
            }
            case ElementType.Object: {
                return toObj(idx, element as ObjectElement);
            }
            case ElementType.String: {
                return toString(idx, element as StringElement);
            }
            case ElementType.SubString: {
                return handleSubStringElement(idx, element as SubStringElement);
            }
            case ElementType.Set: {
                return toSet(idx, element as SetElement);
            }
            case ElementType.Map: {
                return toMap(idx, element as MapElement);
            }
            case ElementType.RegExp: {
                return toRegExp(idx, element as RegExpElement);
            }
            case ElementType.Date: {
                return toDate(idx, element as DateElement);
            }
            case ElementType.BigInt: {
                return toBigInt(idx, element as BigIntElement);
            }
        }
        return toArr(idx, element as ArrayElement);
    }

    function idxToValue(idx: number | number[]): Serializable {
        if (!idx) return undefined;
        const found = cache.get(idx);
        if (found !== undefined) {
            if (typeof idx === 'number') referenced.add(idx);
            return found as Serializable;
        }

        if (Array.isArray(idx)) {
            // it is a nested string;
            const parts = idx.map((i) => idxToValue(i));
            return joinToString(parts);
        }

        const element = data[idx];

        if (typeof element === 'object') {
            // eslint-disable-next-line unicorn/no-null
            if (element === null) return null;
            if (Array.isArray(element)) return handleArrayElement(idx, element as ArrayBasedElements);
            return {};
        }
        return element;
    }

    return idxToValue(1);
}

function joinToString(parts: PrimitiveArray): string {
    return parts.map((a) => (Array.isArray(a) ? joinToString(a) : a)).join('');
}

function isArrayElement(value: Element): value is ArrayElement {
    return Array.isArray(value) && value[0] === ElementType.Array;
}

function isObjectWrapper(value: unknown): value is ObjectWrapper {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as ObjectWrapper).valueOf === 'function' &&
        value.valueOf() !== value
    );
}

type ChildMap<T> = Map<string, TrieNode<T>>;

interface TrieNode<T> {
    d?: T | undefined;
    c?: ChildMap<T>;
}

interface RootNode<T> extends TrieNode<T> {
    d: undefined;
}

class Trie<T> {
    root: RootNode<T> = { d: undefined, c: new Map() };

    add(key: string, data: T): void {
        let node: TrieNode<T> = this.root;
        for (const k of key) {
            let c = node.c;
            if (!c) {
                node.c = c = new Map();
            }
            let n = c.get(k);
            if (!n) {
                c.set(k, (n = { d: data }));
            }
            node = n;
        }
    }

    find(key: string): { data: T | undefined; found: string } | undefined {
        let node: TrieNode<T> = this.root;
        let found = '';
        for (const k of key) {
            const c = node.c;
            if (!c) {
                break;
            }
            const n = c.get(k);
            if (!n) {
                break;
            }
            found += k;
            node = n;
        }
        return { data: node.d, found };
    }
}

export function parse(data: string): Hydrated {
    return fromJSON(JSON.parse(data));
}

export function stringify(data: Hydrated): string {
    return JSON.stringify(toJSON(data));
}
