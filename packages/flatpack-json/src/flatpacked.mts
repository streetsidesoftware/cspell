import assert from 'node:assert';

import { RefCounter } from './RefCounter.mjs';
import type { ArrayBasedElements, Flatpacked, FlatpackIndex, FlattenedElement, UnpackMetaData } from './types.mjs';
import { ElementType, isStringTableElement } from './types.mjs';

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

    if (!elem) {
        return [];
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
        return [];
    }

    assert(typeof elem === 'boolean', `Expected boolean, got ${typeof elem}`);
    return [];
}

export function getFlatpackedRootIdx(flatpack: Flatpacked): FlatpackIndex {
    let idx: FlatpackIndex = 1;
    if (isStringTableElement(flatpack[idx])) {
        idx++;
    }
    assert(!isStringTableElement(flatpack[idx]), 'String table element should be at index 1 if it exists');
    return idx;
}

export function getFlatpackedRoot(flatpack: Flatpacked): FlattenedElement {
    return flatpack[getFlatpackedRootIdx(flatpack)];
}

export function generateUnpackMetaData(flatpack: Flatpacked): UnpackMetaData {
    const referenced = new RefCounter<FlatpackIndex>();

    const rootIndex = getFlatpackedRootIdx(flatpack);
    calcReferenced(rootIndex);
    // Make sure the string table is always included.
    if (rootIndex > 1) {
        referenced.add(1);
    }

    const metaData: UnpackMetaData = {
        flatpack,
        referenced,
        rootIndex,
    };
    return metaData;

    function calcReferenced(idx: FlatpackIndex): void {
        if (!idx) return;
        if (referenced.isReferenced(idx)) {
            referenced.add(idx);
            return;
        }

        referenced.add(idx);
        for (const ref of getIndexesReferencedByElement(flatpack[idx])) {
            calcReferenced(ref);
        }
    }
}
