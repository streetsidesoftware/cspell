import assert from 'node:assert';

import {
    ArrayBasedElements,
    ArrayElement,
    BigIntElement,
    dataHeader,
    DateElement,
    Dehydrated,
    Element,
    ElementType,
    Hydrated,
    MapElement,
    ObjectElement,
    Primitive,
    PrimitiveArray,
    PrimitiveMap,
    PrimitiveObject,
    PrimitiveSet,
    RegExpElement,
    Serializable,
    SetElement,
    StringElement,
    SubStringElement,
} from './types.mjs';

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

export function parse(data: string): Hydrated {
    return fromJSON(JSON.parse(data));
}
