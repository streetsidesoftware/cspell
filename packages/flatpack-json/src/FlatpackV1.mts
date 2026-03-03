import assert from 'node:assert';

import { FlatpackedWrapper } from './flatpackUtil.mjs';
import { proxyDate, proxyObject, proxySet } from './proxy.mjs';
import type { RefElements, StringRefElements } from './RefElements.mjs';
import {
    ArrayRefElement,
    BigIntRefElement,
    DateRefElement,
    isStringRefElements,
    MapRefElement,
    ObjectRefElement,
    ObjectWrapperRefElement,
    PrimitiveRefElement,
    PrimitiveRefElementBase,
    RegExpRefElement,
    SetRefElement,
    StringConcatRefElement,
    StringPrimitiveRefElement,
    SubStringRefElement,
} from './RefElements.mjs';
import { stringifyFlatpacked } from './stringify.mjs';
import { Trie } from './Trie.mjs';
import type {
    Flatpacked,
    FlatpackOptions,
    ObjectWrapper,
    PrimitiveArray,
    PrimitiveObject,
    Serializable,
    SimplePrimitive,
    Unpacked,
} from './types.mjs';
import { blockSplitRegex, dataHeader } from './types.mjs';
import { fromJSON } from './unpack.mjs';

const collator = new Intl.Collator('en', {
    usage: 'sort',
    numeric: true,
    sensitivity: 'variant',
    caseFirst: 'upper',
    ignorePunctuation: false,
});
const compare = collator.compare;

const forceStringPrimitives = false;
const minSubStringLen = 8;
const minSubStringSuffixLen = 16;
const useSuffix = true;

const maxCachedStringLen = 256;

export class FlatpackStore {
    private knownElements = new Set<RefElements>();
    private assignedElements = new Map<RefElements, number>();
    private elements: (RefElements | undefined)[] = [undefined];
    private root: RefElements | undefined = undefined;

    private dedupe = true;
    private sortKeys = true;
    private emptyObjIdx: ObjectRefElement | undefined = undefined;

    private ids = 0;

    /**
     * Cache of primitives and objects that have been added to the data.
     */
    private cache = new Map<unknown, RefElements>();
    /**
     * Set of elements that have been referenced by other indexes.
     */
    private referenced = new Set<RefElements>();
    /**
     * Cache of arrays that have been deduped.
     * The key is a hash of the array elements as a function of the index of the element.
     */
    private cachedArrays = new Map<number, ArrayRefElement[]>();
    private cachedObjects = new Map<ArrayRefElement | undefined, Map<ArrayRefElement | undefined, ObjectRefElement>>();
    private cachedSets = new Map<ArrayRefElement | undefined, SetRefElement>();
    private cachedMaps = new Map<ArrayRefElement | undefined, Map<ArrayRefElement | undefined, MapRefElement>>();

    private cachedProxies = new WeakMap<RefElements, Serializable>();

    /**
     * Cache of strings that have been deduped and stored in the data array.
     */
    private knownStrings = new Trie<TrieData>();
    /**
     * Cache of reversed strings that have been deduped and stored in the data array.
     * This is used to find matching suffixes.
     */
    private knownStringsRev = new Trie<TrieData>();

    private refUndefined: PrimitiveRefElement<undefined>;

    constructor(
        value: Serializable | FlatpackedWrapper,
        readonly options?: FlatpackOptions | undefined,
    ) {
        this.dedupe = options?.dedupe ?? true;
        this.sortKeys = options?.sortKeys || this.dedupe;
        this.refUndefined = this.addValueAndElement(undefined, new PrimitiveRefElement(undefined));

        if (value instanceof FlatpackedWrapper) {
            this.#fromWrapper(value);
        } else {
            this.#setValue(value);
        }
    }

    #fromWrapper(wrapper: FlatpackedWrapper) {
        this.elements = wrapper.toRefElements();
        this.root = this.elements[1];
        for (let i = 1; i < this.elements.length; i++) {
            const element = this.elements[i];
            if (!element) continue;
            this.knownElements.add(element);
            if (element instanceof PrimitiveRefElement) {
                this.addValueAndElement(element.value, element);
            }
            if (isStringRefElements(element)) {
                this.addStringElement(element.value, element);
            }
        }
        this.ids = this.elements.length;
        this.#resolveRefs();
    }

    setValue(value: Serializable): void {
        this.#setValue(value);
    }

    #setValue(value: Serializable) {
        this.softReset();
        this.root = this.valueToRef(value);
        this.#resolveRefs();
        return this.root;
    }

    private nextId(): number {
        return this.ids++;
    }

    private addElement<T extends RefElements>(element: T): T {
        if (this.knownElements.has(element)) return element;
        element.setId(this.nextId());
        this.knownElements.add(element);
        return element;
    }

    private addValueAndElement<T extends RefElements>(value: unknown, element: T, cache = true): T {
        this.addElement(element);
        if (cache) {
            this.cache.set(value, element);
        }
        return element;
    }

    private primitiveToRef(value: string): StringRefElements;
    private primitiveToRef(value: number): PrimitiveRefElement<number>;
    private primitiveToRef(value: null): PrimitiveRefElement<null>;
    private primitiveToRef(value: boolean): PrimitiveRefElement<boolean>;
    private primitiveToRef(value: bigint): BigIntRefElement;
    private primitiveToRef(value: undefined): PrimitiveRefElement<undefined>;
    private primitiveToRef(value: number): PrimitiveRefElement<number>;
    private primitiveToRef(value: string | number): StringRefElements | PrimitiveRefElement<number>;
    private primitiveToRef(value: SimplePrimitive | bigint): RefElements;
    private primitiveToRef(value: SimplePrimitive | bigint): RefElements {
        if (typeof value === 'string') return this.stringToRef(value);
        if (typeof value === 'bigint') return this.cvtBigintToRef(value);

        const found = this.cache.get(value);
        if (found !== undefined) {
            return found;
        }

        return this.addValueAndElement(value, new PrimitiveRefElement(value));
    }

    private createSubStringRef(baseString: StringRefElements, value: string, offset?: number): SubStringRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found as SubStringRefElement;
        }

        return this.addStringElement(value, new SubStringRefElement(baseString, value.length, offset));
    }

    private addKnownString(ref: StringRefElements, value: string) {
        if (value.length >= minSubStringLen) {
            this.knownStrings.add(prefix(value, maxCachedStringLen), ref);
            const rev = reverse(suffix(value, maxCachedStringLen));
            this.knownStringsRev.add(rev, ref);
        }
    }

    private addStringPrimitive(value: string): StringPrimitiveRefElement {
        return this.addStringElement(value, new StringPrimitiveRefElement(value));
    }

    private addStringElement<T extends StringRefElements>(value: string, element: T): T {
        this.addKnownString(element, value);
        return this.addValueAndElement(value, element);
    }

    private stringPrefix(value: string): SubStringRefElement | undefined {
        // if (value.length < maxCachedStringLen * 2) return undefined;
        const trieFound = this.knownStrings.find(value);
        if (!trieFound || !trieFound.data || trieFound.found.length < minSubStringLen) {
            return undefined;
        }

        const { data: tData, found: subStr } = trieFound;
        // assert(subStr === value.slice(0, subStr.length));
        return this.createSubStringRef(tData, subStr);
    }

    private stringSuffix(value: string): SubStringRefElement | undefined {
        if (!useSuffix) return undefined;
        const rev = reverse(value);
        const trieFound = this.knownStringsRev.find(rev);
        if (!trieFound || !trieFound.data || trieFound.found.length < minSubStringSuffixLen) {
            return undefined;
        }

        const { data: tData, found: subStr } = trieFound;
        // assert(subStr === value.slice(0, subStr.length));
        return this.createSubStringRef(tData, value.slice(-subStr.length), tData.length - subStr.length);
    }

    private stringToRef(value: string): StringRefElements {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found as StringRefElements;
        }

        if (forceStringPrimitives || value.length < minSubStringLen || blockSplitRegex.test(value)) {
            return this.addStringPrimitive(value);
        }

        const partialsPfx: StringRefElements[] = [];
        const partialsSfx: StringRefElements[] = [];
        let subStr = value;
        while (subStr.length) {
            const prefix = this.stringPrefix(subStr);
            const suffix = this.stringSuffix(subStr);
            if (!prefix && !suffix) break;
            if (prefix && prefix.length >= (suffix?.length || 0)) {
                partialsPfx.push(prefix);
                subStr = subStr.slice(prefix.length);
            } else {
                const sfx = suffix!;
                partialsSfx.push(sfx);
                subStr = subStr.slice(0, -sfx.length);
            }
        }
        partialsSfx.reverse();

        if (!partialsPfx.length && !partialsSfx.length) {
            return this.addStringPrimitive(value);
        }
        if (subStr.length) {
            partialsPfx.push(this.stringToRef(subStr));
        }
        const partials = [...partialsPfx, ...partialsSfx];
        return this.addStringElement(value, partials.length === 1 ? partials[0] : new StringConcatRefElement(partials));
    }

    private cvtSetToRef(value: Set<Serializable>): SetRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found as SetRefElement;
        }

        const element = this.addValueAndElement(value, new SetRefElement());
        element.setValues(this.createUniqueKeys([...value]));
        return this.dedupeSetRefs(value, element);
    }

    private dedupeSetRefs(value: Set<Serializable>, element: SetRefElement): SetRefElement {
        if (!this.dedupe) return element;
        const values = element.valueRefs();
        const found = this.cachedSets.get(values);
        if (!found) {
            this.cachedSets.set(values, element);
            return element;
        }
        if (this.referenced.has(element)) return element;
        this.knownElements.delete(element);
        this.cache.set(value, found);
        return found;
    }

    private proxySetRef(ref: SetRefElement): Set<Serializable> {
        return proxySet(new Set(this.#toValue(ref.valueRefs()) as Serializable[]), () => {});
    }

    private createUniqueKeys(keys: Serializable[]): ArrayRefElement {
        const cacheValue = false;
        let k = this.arrToRef(keys, cacheValue);
        const uniqueKeys = new Set(k.valueRefs());
        if (uniqueKeys.size !== keys.length) {
            // one or more of the keys got deduped. We need to duplicate it.
            uniqueKeys.clear();
            const values = k.valueRefs().map((ref) => {
                if (uniqueKeys.has(ref)) {
                    return this.addElement(ref.clone());
                }
                uniqueKeys.add(ref);
                return ref;
            });
            k = this.addValueAndElement(keys, new ArrayRefElement(values), cacheValue);
        }
        return k;
    }

    private cvtMapToRef(value: Map<Serializable, Serializable>): MapRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found as MapRefElement;
        }

        const element = this.addValueAndElement(value, new MapRefElement());
        element.setKeysAndValues(this.createUniqueKeys([...value.keys()]), this.arrToRef([...value.values()], false));
        return this.dedupeMapRefs(value, element);
    }

    private dedupeMapRefs(value: Map<Serializable, Serializable>, element: MapRefElement): MapRefElement {
        if (!this.dedupe) return element;
        const keys = element.keyRefs();
        const values = element.valueRefs();
        let found = this.cachedMaps.get(keys);
        if (!found) {
            found = new Map();
            found.set(values, element);
            this.cachedMaps.set(keys, found);
            return element;
        }
        const foundValue = found.get(values);
        if (foundValue) {
            if (this.referenced.has(element)) return element;
            this.knownElements.delete(element);
            this.cache.set(value, foundValue);
            return foundValue;
        }
        found.set(values, element);
        return element;
    }

    private proxyMapRef(_ref: MapRefElement): Map<Serializable, Serializable> {
        return new Map();
    }

    private cvtRegExpToRef(value: RegExp): RegExpRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found as RegExpRefElement;
        }

        return this.addValueAndElement(
            value,
            new RegExpRefElement(this.stringToRef(value.source), this.stringToRef(value.flags)),
        );
    }

    private cvtDateToRef(value: Date): DateRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found as DateRefElement;
        }

        return this.addValueAndElement(value, new DateRefElement(value.getTime()));
    }

    private proxyDateRef(ref: DateRefElement): Date {
        return proxyDate(ref.value, (date) => ref.setTime(date.getTime()));
    }

    private cvtBigintToRef(value: bigint): BigIntRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found as BigIntRefElement;
        }

        const valElement = this.primitiveToRef(
            value <= Number.MAX_SAFE_INTEGER && value >= -Number.MAX_SAFE_INTEGER ? Number(value) : value.toString(),
        );
        return this.addValueAndElement(value, new BigIntRefElement(valElement));
    }

    private cvtObjToRef(value: PrimitiveObject | ObjectWrapper): ObjectRefElement | ObjectWrapperRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found as ObjectRefElement;
        }

        if (isObjectWrapper(value)) {
            const element = this.addValueAndElement(value, new ObjectWrapperRefElement());
            element.setValue(this.valueToRef(value.valueOf()));
            return element;
        }

        const entries = Object.entries(value);

        if (!entries.length) {
            if (this.emptyObjIdx) {
                return this.emptyObjIdx;
            }
            this.emptyObjIdx = this.addValueAndElement(value, new ObjectRefElement());
            return this.emptyObjIdx;
        }

        if (this.sortKeys) {
            entries.sort((a, b) => compare(a[0], b[0]));
        }
        const element = this.addValueAndElement(value, new ObjectRefElement());
        const k = this.arrToRef(
            entries.map(([key]) => key),
            false,
        );
        const v = this.arrToRef(
            entries.map(([, value]) => value),
            false,
        );

        element.setKeysAndValues(k, v);
        return this.dedupeObject(value, element);
    }

    private dedupeObject(value: PrimitiveObject | ObjectWrapper, element: ObjectRefElement): ObjectRefElement {
        if (!this.dedupe) return element;
        const keys = element.keyRefs();
        const values = element.valueRefs();
        let found = this.cachedObjects.get(keys);
        if (!found) {
            found = new Map();
            found.set(values, element);
            this.cachedObjects.set(keys, found);
            return element;
        }
        const foundValue = found.get(values);
        if (foundValue) {
            if (this.referenced.has(element)) return element;
            this.knownElements.delete(element);
            this.cache.set(value, foundValue);
            return foundValue;
        }
        found.set(values, element);
        return element;
    }

    private proxyObjectRef(ref: ObjectRefElement): PrimitiveObject {
        const keys = this.#toValue(ref.keyRefs()) as string[] | undefined;
        const values = this.#toValue(ref.valueRefs()) as Serializable[] | undefined;
        const obj = keys && values ? Object.fromEntries(keys.map((key, i) => [key, values[i]])) : {};
        return proxyObject(obj, (_value) => {});
    }

    private proxyObjectWrapperRef(ref: ObjectWrapperRefElement): PrimitiveObject {
        const value = Object(this.#toValue(ref.valueRef())) as PrimitiveObject;
        return proxyObject(value, (_value) => {});
    }

    /**
     *
     * @param value - The array converted to an ArrayRefElement.
     * @param element - the element to dedupe.
     * @param cacheValue - Whether to cache the value. It is false when it is a dynamic array, like object keys,
     *      in that case, we want to dedupe the keys and values.
     * @returns the element to use.
     */
    private dedupeArray(value: PrimitiveArray, element: ArrayRefElement, cacheValue: boolean): ArrayRefElement {
        if (cacheValue && !this.dedupe) return element;
        const indexHash = element.hash;
        let cached = this.cachedArrays.get(indexHash);
        if (!cached) {
            cached = [];
            this.cachedArrays.set(indexHash, cached);
        }
        const found = cached.find((entry) => element.isEqual(entry));
        if (found) {
            if (this.referenced.has(element)) return element;
            this.knownElements.delete(element);
            if (cacheValue || this.cache.has(value)) {
                this.cache.set(value, found);
            }
            return found;
        }
        cached.push(element);
        return element;
    }

    /**
     * Convert an array to an index.
     * @param value - The array to convert to an index.
     * @param cacheValue - Whether to cache the value.
     * @returns the index of the array.
     */
    private arrToRef(value: PrimitiveArray, cacheValue = true): ArrayRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            this.referenced.add(found);
            return found as ArrayRefElement;
        }

        const element = this.addValueAndElement(value, new ArrayRefElement(), cacheValue);
        element.setValues(value.map((v) => this.valueToRef(v)));
        return this.dedupeArray(value, element, cacheValue);
    }

    private proxyArrayRef(ref: ArrayRefElement): PrimitiveArray {
        const arr = ref.valueRefs().map((v) => this.#toValue(v));
        return proxyObject(arr, (_value) => {});
    }

    private valueToRef(value: Serializable): RefElements {
        if (value === null) {
            return this.primitiveToRef(value);
        }

        if (typeof value === 'object') {
            if (value instanceof Set) {
                return this.cvtSetToRef(value);
            }
            if (value instanceof Map) {
                return this.cvtMapToRef(value);
            }
            if (value instanceof RegExp) {
                return this.cvtRegExpToRef(value);
            }
            if (Array.isArray(value)) {
                return this.arrToRef(value);
            }
            if (value instanceof Date) {
                return this.cvtDateToRef(value);
            }
            return this.cvtObjToRef(value as PrimitiveObject);
        }

        return this.primitiveToRef(value);
    }

    /**
     * Reset things in a way that allows for reuse.
     */
    private softReset(): void {
        this.referenced.clear();
        if (this.root) {
            const idx = this.assignedElements.get(this.root);
            if (idx) {
                this.elements[idx] = undefined;
                this.assignedElements.delete(this.root);
            }
        }
        this.root = undefined;
    }

    #resolveRefs() {
        if (!this.root) return;

        const elements = this.elements;
        const assigned = this.assignedElements;
        const referenced = this.referenced;
        const availableIndexes: number[] = [];

        function addElement(ref: RefElements) {
            if (assigned.has(ref)) return false;
            const emptyCell = availableIndexes.pop();
            if (emptyCell) {
                assigned.set(ref, emptyCell);
                elements[emptyCell] = ref;
                return true;
            }
            const i = elements.push(ref) - 1;
            assigned.set(ref, i);
            return true;
        }

        function walk(ref: RefElements, action: (ref: RefElements) => boolean): void {
            function _walk(ref: RefElements): void {
                if (!action(ref)) return;
                const deps = ref.getDependencies();
                if (!deps) return;
                for (const dep of deps) {
                    _walk(dep);
                }
            }

            _walk(ref);
        }

        function calcReferences(root: RefElements) {
            referenced.clear();
            walk(root, (ref) => {
                if (referenced.has(ref)) return false;
                referenced.add(ref);
                return true;
            });
        }

        function calcAvailableIndexes() {
            availableIndexes.length = 0;
            for (let i = 1; i < elements.length; i++) {
                const ref = elements[i];
                if (!ref || !referenced.has(ref)) {
                    availableIndexes.push(i);
                    if (ref) {
                        assigned.delete(ref);
                    }
                    elements[i] = undefined;
                } else {
                    assigned.set(ref, i);
                }
            }
            availableIndexes.reverse();
        }

        function addElements(root: RefElements) {
            walk(root, addElement);

            let i = elements.length - 1;
            for (; i > 0 && elements[i] === undefined; i--) {
                // empty
            }
            elements.length = i + 1;
        }

        calcReferences(this.root);
        elements[0] = this.refUndefined;
        assigned.set(this.refUndefined, 0);
        calcAvailableIndexes();
        addElements(this.root);
        this.#cleanCache();
    }

    /**
     * Remove objects from the cache after the FlatpackStore has been built.
     */
    #cleanCache() {
        const toRemove = new Set<unknown>();

        for (const key of this.cache.keys()) {
            if (key && typeof key === 'object') {
                toRemove.add(key);
            }
        }

        for (const key of toRemove) {
            this.cache.delete(key);
        }
    }

    #resolveToValueProxy(ref: RefElements | undefined): Unpacked {
        if (!ref) return undefined;
        if (ref instanceof ArrayRefElement) return this.proxyArrayRef(ref);
        if (ref instanceof ObjectRefElement) return this.proxyObjectRef(ref);
        if (ref instanceof PrimitiveRefElementBase) return ref.value;
        if (isStringRefElements(ref)) return ref.value;
        if (ref instanceof MapRefElement) return this.proxyMapRef(ref);
        if (ref instanceof SetRefElement) return this.proxySetRef(ref);
        if (ref instanceof BigIntRefElement) return ref.value;
        if (ref instanceof RegExpRefElement) return ref.value;
        if (ref instanceof DateRefElement) return this.proxyDateRef(ref);
        if (ref instanceof ObjectWrapperRefElement) return this.proxyObjectWrapperRef(ref);
        assert(false, 'Unknown ref type');
    }

    #toValue(ref: RefElements | undefined): Unpacked {
        if (!ref) return undefined;
        return getOrResolve(this.cachedProxies, ref, (ref) => this.#resolveToValueProxy(ref));
    }

    toJSON(): Flatpacked {
        const data = [dataHeader] as Flatpacked;
        const idxLookup = this.assignedElements;
        const lookup = (ref: RefElements | undefined) => (ref && idxLookup.get(ref)) || 0;

        const elements = this.elements;
        for (let i = 1; i < elements.length; i++) {
            const element = elements[i];
            if (!element) {
                data.push(0);
                continue;
            }
            const value = element.toElement(lookup);
            if (value === undefined) continue;
            data.push(value);
        }

        return data;
    }

    static fromJSON(data: Flatpacked): FlatpackStore {
        return new FlatpackStore(new FlatpackedWrapper(data));
    }

    static parse(content: string): FlatpackStore {
        return new FlatpackStore(FlatpackedWrapper.parse(content));
    }

    stringify(): string {
        return stringifyFlatpacked(this.toJSON());
    }

    toValue(): Unpacked {
        return fromJSON(this.toJSON());
    }

    _toValueProxy(): Unpacked {
        return this.#toValue(this.root);
    }
}

type TrieData = StringRefElements;

function isObjectWrapper(value: unknown): value is ObjectWrapper {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as ObjectWrapper).valueOf === 'function' &&
        value.valueOf() !== value
    );
}

function prefix(value: string, len: number): string | string[] {
    return value.length > len ? [...value].slice(0, len) : value;
}

function suffix(value: string, len: number): string | string[] {
    return value.length > len ? [...value].slice(-len) : value;
}

function reverse(value: string | string[]): string[] {
    return [...value].reverse();
}

export function toJSON<V extends Serializable>(json: V, options?: FlatpackOptions): Flatpacked {
    return new FlatpackStore(json, options).toJSON();
}

export function stringify(data: Unpacked, pretty = true): string {
    return pretty ? stringifyFlatpacked(toJSON(data)) : JSON.stringify(toJSON(data));
}

type WeakOrNever<K, V> = K extends WeakKey ? WeakMap<K, V> : never;
type SupportedMap<K, V> = Map<K, V> | WeakOrNever<K, V>;

function getOrResolve<K, V>(map: SupportedMap<K, V>, key: K, resolver: (key: K) => V): V {
    let value = map.get(key);
    if (value === undefined && !map.has(key)) {
        value = resolver(key);
        map.set(key, value);
    }
    return value as V;
}
