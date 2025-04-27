import assert from 'node:assert';

import {
    ArrayRefElement,
    BigIntRefElement,
    DateRefElement,
    MapRefElement,
    NumberRefElement,
    ObjectRefElement,
    ObjectWrapperRefElement,
    PrimitiveRefElement,
    RefElements,
    RegExpRefElement,
    SetRefElement,
    StringConcatRefElement,
    StringPrimitiveRefElement,
    SubStringRefElement,
} from './RefElements.mjs';
import {
    ArrayBasedElements,
    type ArrayElement,
    ElementType,
    Flatpacked,
    type FlattenedElement,
    ObjectWrapperElement,
    supportedHeaders,
} from './types.mjs';

export function fromElement(elem: FlattenedElement, resolve: (index: number) => RefElements): RefElements {
    function handleArrayElement(element: ArrayBasedElements) {
        switch (element[0]) {
            case ElementType.Array: {
                break;
            }
            case ElementType.Object: {
                if (element[1] === 0 && element[2]) {
                    return ObjectWrapperRefElement.fromJSON(element as ObjectWrapperElement, resolve);
                }
                return ObjectRefElement.fromJSON(element, resolve);
            }
            case ElementType.String: {
                return StringConcatRefElement.fromJSON(element, resolve);
            }
            case ElementType.SubString: {
                return SubStringRefElement.fromJSON(element, resolve);
            }
            case ElementType.Set: {
                return SetRefElement.fromJSON(element, resolve);
            }
            case ElementType.Map: {
                return MapRefElement.fromJSON(element, resolve);
            }
            case ElementType.RegExp: {
                return RegExpRefElement.fromJSON(element, resolve);
            }
            case ElementType.Date: {
                return DateRefElement.fromJSON(element);
            }
            case ElementType.BigInt: {
                return BigIntRefElement.fromJSON(element, resolve);
            }
        }
        return ArrayRefElement.fromJSON(element as ArrayElement, resolve);
    }

    if (Array.isArray(elem)) {
        return handleArrayElement(elem as ArrayBasedElements);
    }

    if (typeof elem === 'string') {
        return StringPrimitiveRefElement.fromJSON(elem);
    }

    if (typeof elem === 'number') {
        return NumberRefElement.fromJSON(elem);
    }

    if (typeof elem === 'object') {
        if (elem === null) {
            return PrimitiveRefElement.fromJSON(elem);
        }
        return new ObjectRefElement();
    }

    assert(typeof elem === 'boolean');
    return PrimitiveRefElement.fromJSON(elem);
}

export function fromFlatpacked(flat: Flatpacked): RefElements[] {
    const elements: RefElements[] = [];

    const known = new Map<number, RefElements>();

    function resolve(index: number) {
        const found = known.get(index);
        if (found) return found;
        const element = fromElement(flat[index], resolve);
        known.set(index, element);
        elements[index] = element;
        element.setId(index);
        return element;
    }

    elements[0] = new PrimitiveRefElement(undefined);
    known.set(0, elements[0]);

    for (let i = 1; i < flat.length; i++) {
        resolve(i);
    }

    return elements;
}

export class FlatpackedWrapper {
    constructor(readonly elements: Flatpacked) {}
    static parse(content: string): FlatpackedWrapper {
        const data = JSON.parse(content);
        assert(isFlatpacked(data));
        return new FlatpackedWrapper(data);
    }

    toRefElements(): RefElements[] {
        return fromFlatpacked(this.elements);
    }
}

export function isFlatpacked(value: unknown): value is Flatpacked {
    return Array.isArray(value) && typeof value[0] === 'string' && supportedHeaders.has(value[0]);
}
