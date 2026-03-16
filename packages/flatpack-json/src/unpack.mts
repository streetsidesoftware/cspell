import assert from 'node:assert';

import { RefCounter } from './RefCounter.mjs';
import { StringTable } from './stringTable.mjs';
import type {
    AnnotateUnpacked,
    ArrayBasedElements,
    ArrayElement,
    BigIntElement,
    DateElement,
    Flatpacked,
    FlattenedElement,
    MapElement,
    ObjectElement,
    Primitive,
    PrimitiveArray,
    PrimitiveMap,
    PrimitiveObject,
    PrimitiveSet,
    RawUnpacked,
    RegExpElement,
    Serializable,
    SetElement,
    StringElement,
    StringTableElement,
    SubStringElement,
    Unpacked,
    UnpackedAnnotation,
    UnpackMetaData,
} from './types.mjs';
import { ElementType, supportedHeaders, symbolFlatpackAnnotation } from './types.mjs';

export function fromJSON(data: Flatpacked): Unpacked {
    const [header] = data;
    let stringTable: StringTable | undefined;

    if (!supportedHeaders.has(header)) {
        throw new Error('Invalid header');
    }

    const cache = new Map<number, RawUnpacked>([[0, undefined]]);

    /**
     * indexes that have been referenced by multiple objects.
     * A count of 1 means that there is only 1 reference.
     */
    const referenced = new RefCounter<number>();

    const meta: UnpackMetaData = {
        flatpack: data,
        referenced,
    };

    return idxToValue(1);

    function cacheValue(idx: number, value: RawUnpacked): RawUnpacked {
        assert(!cache.has(idx), `Index ${idx} already exists in cache`);
        cache.set(idx, value);
        return value;
    }

    function getCachedValue(idx: number): RawUnpacked | undefined {
        referenced.add(idx);
        return cache.get(idx);
    }

    function mergeKeysValues<K>(keys: readonly K[], values: PrimitiveArray): [K, Serializable][] {
        return keys.map((key, i) => [key, values[i]]);
    }

    function toSet(idx: number, elem: SetElement): PrimitiveSet {
        const [_, k] = elem;
        const s: PrimitiveSet = k ? (new Set(idxToArr(k)) as PrimitiveSet) : new Set();
        cacheValue(idx, s);
        return s;
    }

    function toMap(idx: number, elem: MapElement): PrimitiveMap {
        const [_, k, v] = elem;
        const m: PrimitiveMap =
            !k || !v ? new Map() : (new Map(mergeKeysValues(idxToArr(k), idxToArr(v))) as PrimitiveMap);
        cacheValue(idx, m);
        return m;
    }

    function toRegExp(idx: number, elem: RegExpElement): RegExp {
        const [_, pattern, flags] = elem;
        const p = idxToValue(pattern) as string;
        const f = idxToValue(flags) as string;
        const r = new RegExp(p, f);
        cacheValue(idx, r);
        return r;
    }

    function toBigInt(idx: number, elem: BigIntElement): bigint {
        const [_, vIdx] = elem;
        const r = BigInt(idxToValue(vIdx) as string | number);
        cacheValue(idx, r);
        return r;
    }

    function toDate(idx: number, elem: DateElement): Date {
        const [_, value] = elem;
        const r = new Date(value);
        cacheValue(idx, r);
        return r;
    }

    function toString(idx: number, elem: StringElement | string): string {
        const s = typeof elem === 'string' ? elem : idxToString(elem.slice(1) as number[]);
        cacheValue(idx, s);
        return s;
    }

    function toObj(idx: number, elem: ObjectElement): PrimitiveObject {
        const [_, k, v] = elem;
        // Object Wrapper
        if (!k && v) {
            const obj = Object(idxToValue(v));
            cacheValue(idx, obj);
            return obj as PrimitiveObject;
        }

        const obj = {};
        cacheValue(idx, obj);

        if (!k || !v) return obj;
        const keys = idxToArr(k) as string[];
        const values = idxToArr(v);
        Object.assign(obj, Object.fromEntries(mergeKeysValues(keys, values)));
        return obj;
    }

    function idxToArr(idx: number): PrimitiveArray {
        const found = getCachedValue(idx);
        if (found !== undefined) {
            return found as PrimitiveArray;
        }
        const element = data[idx];
        assert(isArrayElement(element));
        return toArr(idx, element);
    }

    function toArr(idx: number, element: ArrayElement): PrimitiveArray {
        const placeHolder: Serializable[] = [];
        const refs = element.slice(1);
        cacheValue(idx, placeHolder);
        const arr = refs.map(idxToValue);
        // check if the array has been referenced by another object.
        if (!referenced.hasRefs(idx)) {
            // It has not, just replace the placeholder with the array.
            cacheValue(idx, arr);
            return arr;
        }
        placeHolder.push(...arr);
        return placeHolder;
    }

    function handleSubStringElement(idx: number, refs: SubStringElement): string {
        const [_t, sIdx, len, offset = 0] = refs;
        const s = `${idxToValue(sIdx)}`.slice(offset, offset + len);
        cacheValue(idx, s);
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
            case ElementType.StringTable: {
                stringTable = new StringTable(element as StringTableElement);
                return idxToValue(idx + 1);
            }
        }
        return toArr(idx, element as ArrayElement);
    }

    function idxToString(idx: number[]): string {
        return joinToString(idx.map((i) => idxToValue(i)));
    }

    function idxToValue(idx: number): Unpacked {
        if (!idx) return undefined;
        if (idx < 0) {
            referenced.add(idx);
            return stringTable?.get(-idx);
        }
        const found = getCachedValue(idx);
        if (found !== undefined) {
            return annotateUnpacked(found, { meta, index: idx });
        }

        const element = data[idx];

        if (typeof element === 'object') {
            // eslint-disable-next-line unicorn/no-null
            if (element === null) return null;
            if (Array.isArray(element))
                return annotateUnpacked(handleArrayElement(idx, element as ArrayBasedElements), {
                    meta,
                    index: idx,
                });
            return annotateUnpacked<PrimitiveObject>({}, { meta, index: idx });
        }
        return element;
    }
}

function joinToString(parts: PrimitiveArray): string {
    return parts.flat().join('');
}

function isArrayElement(value: FlattenedElement): value is ArrayElement {
    return Array.isArray(value) && value[0] === ElementType.Array;
}

export function parse(data: string): Unpacked {
    return fromJSON(JSON.parse(data));
}

function annotateUnpacked<T extends RawUnpacked>(value: T, meta: UnpackedAnnotation): AnnotateUnpacked<T> {
    if (value && typeof value === 'object') {
        if (Object.hasOwn(value, symbolFlatpackAnnotation)) {
            return value as AnnotateUnpacked<T>;
        }

        return Object.defineProperty(value, symbolFlatpackAnnotation, { value: meta }) as AnnotateUnpacked<T>;
    }
    return value as AnnotateUnpacked<T>;
}
