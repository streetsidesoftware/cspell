import assert from 'node:assert';

import { type ArrayBasedElements, ElementType, type FlatpackIndex, type FlattenedElement } from './types.mjs';

export function getIndexesReferencedByElement(elem: FlattenedElement): FlatpackIndex[] {
    function handleArrayElement(element: ArrayBasedElements): FlatpackIndex[] {
        switch (element[0]) {
            case ElementType.Array: {
                return element.slice(1);
            }
            case ElementType.Object: {
                return element.slice(1).filter((v) => !!v);
            }
            case ElementType.String: {
                return element.slice(1);
            }
            case ElementType.SubString: {
                return [element[1]];
            }
            case ElementType.Set: {
                return element.slice(1, 2);
            }
            case ElementType.Map: {
                return element.slice(1, 3);
            }
            case ElementType.RegExp: {
                return element.slice(1, 3);
            }
            case ElementType.Date: {
                return [];
            }
            case ElementType.BigInt: {
                return [element[1]];
            }
        }
        assert(false, 'Invalid element type');
    }

    if (Array.isArray(elem)) {
        return handleArrayElement(elem as ArrayBasedElements);
    }

    if (typeof elem === 'string') {
        return [];
    }

    if (typeof elem === 'number') {
        return [];
    }

    if (typeof elem === 'object') {
        if (elem === null) {
            return [];
        }
        return [];
    }

    assert(typeof elem === 'boolean');
    return [];
}
