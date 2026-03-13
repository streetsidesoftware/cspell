import assert from 'node:assert';

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
    UnpackedMetaData,
} from './types.mjs';
import { ElementType, supportedHeaders, symbolFlatpackElement } from './types.mjs';

export function fromJSON(data: Flatpacked): Unpacked {
    const [header] = data;

    let stringTable: StringTable | undefined;

    if (!supportedHeaders.has(header)) {
        throw new Error('Invalid header');
    }

    const cache = new Map<number | number[], RawUnpacked>([[0, undefined]]);
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
        const s = typeof elem === 'string' ? elem : idxToString(elem.slice(1) as number[]);
        cache.set(idx, s);
        return s;
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
            case ElementType.StringTable: {
                stringTable = new StringTable(element as StringTableElement);
                return idxToValue(idx + 1);
            }
        }
        return toArr(idx, element as ArrayElement);
    }

    function idxToString(idx: number | number[]): string {
        if (!idx) return '';
        if (Array.isArray(idx)) {
            return joinToString(idx.map((i) => idxToValue(i)));
        }
        return idxToValue(idx) as string;
    }

    function idxToValue(idx: number): Unpacked {
        if (!idx) return undefined;
        if (idx < 0) {
            return stringTable ? stringTable.get(-idx) : undefined;
        }
        const found = cache.get(idx);
        if (found !== undefined) {
            if (typeof idx === 'number') referenced.add(idx);
            return annotateUnpacked(found, { src: data, index: idx });
        }

        const element = data[idx];

        if (typeof element === 'object') {
            // eslint-disable-next-line unicorn/no-null
            if (element === null) return null;
            if (Array.isArray(element))
                return annotateUnpacked(handleArrayElement(idx, element as ArrayBasedElements), {
                    src: data,
                    index: idx,
                });
            return annotateUnpacked<PrimitiveObject>({}, { src: data, index: idx });
        }
        return element;
    }

    return idxToValue(1);
}

function joinToString(parts: PrimitiveArray): string {
    return parts.map((a) => (Array.isArray(a) ? joinToString(a) : a)).join('');
}

function isArrayElement(value: FlattenedElement): value is ArrayElement {
    return Array.isArray(value) && value[0] === ElementType.Array;
}

export function parse(data: string): Unpacked {
    return fromJSON(JSON.parse(data));
}

function annotateUnpacked<T extends RawUnpacked>(value: T, meta: UnpackedMetaData): AnnotateUnpacked<T> {
    if (value && typeof value === 'object') {
        if (Object.hasOwn(value, symbolFlatpackElement)) {
            return value as AnnotateUnpacked<T>;
        }

        return Object.defineProperty(value, symbolFlatpackElement, { value: meta }) as AnnotateUnpacked<T>;
    }
    return value as AnnotateUnpacked<T>;
}
