import {
    ArrayRefElement,
    BigIntRefElement,
    DateRefElement,
    MapRefElement,
    ObjectRefElement,
    ObjectWrapperRefElement,
    PrimitiveRefElement,
    RefElement,
    RefElements,
    RegExpRefElement,
    SetRefElement,
    StringConcatRefElement,
    StringPrimitiveRefElement,
    StringRefElements,
    SubStringRefElement,
} from './RefElements.mjs';
import { stringifyFlatpacked } from './stringify.mjs';
import { Trie } from './Trie.mjs';
import type {
    Flatpacked,
    NormalizeJsonOptions,
    ObjectWrapper,
    PrimitiveArray,
    PrimitiveObject,
    Serializable,
    SimplePrimitive,
    Unpacked,
} from './types.mjs';
import { blockSplitRegex, dataHeader } from './types.mjs';

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

const maxCachedStringLen = 256;

export class FlatpackStore {
    private elements = new Set<RefElements>();
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
     * Set of indexes that have been referenced by other indexes.
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

    /**
     * Cache of strings that have been deduped and stored in the data array.
     */
    private knownStrings = new Trie<TrieData>();
    /**
     * Cache of reversed strings that have been deduped and stored in the data array.
     * This is used to find matching suffixes.
     */
    private knownStringsRev = new Trie<TrieData>();

    constructor(
        json: Serializable,
        readonly options?: NormalizeJsonOptions,
    ) {
        this.dedupe = options?.dedupe ?? true;
        this.sortKeys = options?.sortKeys || this.dedupe;
        this.addValueAndElement(undefined, new PrimitiveRefElement(undefined));
        this.root = this.valueToRef(json);
    }

    setValue(value: Serializable): void {
        this.softReset();
        this.root = this.valueToRef(value);
    }

    private nextId(): number {
        return this.ids++;
    }

    private addElement<T extends RefElements>(element: T): T {
        if (this.elements.has(element)) return element;
        element.setId(this.nextId());
        this.elements.add(element);
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

    private createSubStringRef(baseString: StringRefElements, value: string): SubStringRefElement {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found as SubStringRefElement;
        }

        return this.addStringElement(value, new SubStringRefElement(baseString, value.length));
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
        const trieFound = this.knownStrings.find(value);
        if (!trieFound || !trieFound.data || trieFound.found.length < minSubStringLen) {
            return undefined;
        }

        const { data: tData, found: subStr } = trieFound;
        // assert(subStr === value.slice(0, subStr.length));
        return this.createSubStringRef(tData, subStr);
    }

    private stringToRef(value: string): StringRefElements {
        const found = this.cache.get(value);
        if (found !== undefined) {
            return found as StringRefElements;
        }

        if (forceStringPrimitives || value.length < minSubStringLen || blockSplitRegex.test(value)) {
            return this.addStringPrimitive(value);
        }

        const partials: StringRefElements[] = [];
        let subStr = value;
        for (let prefix = this.stringPrefix(subStr); prefix; prefix = this.stringPrefix(subStr)) {
            partials.push(prefix);
            subStr = subStr.slice(prefix.length);
        }

        if (!partials.length) {
            return this.addStringPrimitive(value);
        }
        if (subStr.length) {
            partials.push(this.stringToRef(subStr));
        }
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
        const values = element.values();
        const found = this.cachedSets.get(values);
        if (!found) {
            this.cachedSets.set(values, element);
            return element;
        }
        if (this.referenced.has(element)) return element;
        this.elements.delete(element);
        this.cache.set(value, found);
        return found;
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
        const keys = element.keys();
        const values = element.values();
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
            this.elements.delete(element);
            this.cache.set(value, foundValue);
            return foundValue;
        }
        found.set(values, element);
        return element;
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
        const keys = element.keys();
        const values = element.values();
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
            this.elements.delete(element);
            this.cache.set(value, foundValue);
            return foundValue;
        }
        found.set(values, element);
        return element;
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
            this.elements.delete(element);
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
    }

    toJSON(): Flatpacked {
        const data = [dataHeader] as Flatpacked;
        const root = this.root;
        if (root === undefined) return data;

        const idxLookup = new Map<RefElement<unknown>, number>();
        const refUndef = this.cache.get(undefined);
        const elements: RefElement<unknown>[] = [];

        if (refUndef) {
            idxLookup.set(refUndef, 0);
        }
        function calcIndex(ref: RefElement<unknown> | undefined): number {
            if (!ref) return 0;
            let idx = idxLookup.get(ref);
            if (idx === undefined) {
                idx = idxLookup.size;
                idxLookup.set(ref, idx);
            }
            return idx;
        }

        function walkRefs(ref: RefElement<unknown>): void {
            const s = idxLookup.size;
            calcIndex(ref);
            if (s === idxLookup.size) return;
            elements.push(ref);
            const deps = ref.getDependencies();
            if (!deps) return;
            const sorted = [...deps].sort((a, b) => a.i - b.i);
            for (const dep of sorted) {
                walkRefs(dep);
            }
        }

        walkRefs(root);

        for (const element of elements) {
            const idx = element.toElement((ref) => (ref && idxLookup.get(ref)) || 0);
            if (idx === undefined) continue;
            data.push(idx);
        }

        return data;
    }

    stringify(): string {
        return stringifyFlatpacked(this.toJSON());
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

export function toJSON<V extends Serializable>(json: V, options?: NormalizeJsonOptions): Flatpacked {
    return new FlatpackStore(json, options).toJSON();
}

export function stringify(data: Unpacked): string {
    return JSON.stringify(toJSON(data));
}
