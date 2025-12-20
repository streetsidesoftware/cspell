import assert from 'node:assert';

import type { ArrayBasedElements, Flatpacked, FlattenedElement } from './types.mjs';
import { ElementType, supportedHeaders } from './types.mjs';

export function optimizeFlatpacked(data: Flatpacked): Flatpacked {
    const [header] = data;
    if (!supportedHeaders.has(header)) {
        throw new Error('Invalid header');
    }

    const elementRefs = data.map((element, index) => ({ origIndex: index, refCount: 0, index: 0, element }));
    const indexToRefElement = new Map<number, RefElement>(elementRefs.entries());

    for (const refElement of elementRefs) {
        if (refElement.origIndex === 0) {
            continue;
        }
        const indexes = getRefIndexes(refElement.element);
        for (const index of indexes) {
            const ref = indexToRefElement.get(index);
            assert(ref, `Invalid reference index: ${index}`);
            ref.refCount++;
        }
    }

    const sortedRefElements = elementRefs.slice(2).sort((a, b) => b.refCount - a.refCount || a.origIndex - b.origIndex);
    sortedRefElements.forEach((refElement, index) => {
        refElement.index = index + 2;
    });

    const indexMap = new Map<number, number>([
        [0, 0],
        [1, 1],
    ]);
    sortedRefElements.forEach((refElement) => {
        indexMap.set(refElement.origIndex, refElement.index);
    });

    const optimizedElements: FlattenedElement[] = [
        data[1],
        ...sortedRefElements.map((refElement) => refElement.element),
    ].map((element) => patchIndexes(element, indexMap));

    return [header, ...optimizedElements];
}

function patchIndexes(elem: FlattenedElement, indexMap: Map<number, number>): FlattenedElement {
    function mapIndex(index: number): number {
        const v = indexMap.get(index);
        assert(v !== undefined, `Invalid index: ${index}`);
        return v;
    }

    function mapIndexes(indexes: number[]): number[] {
        return indexes.map(mapIndex);
    }

    function handleArrayElement(element: ArrayBasedElements): FlattenedElement {
        switch (element[0]) {
            case ElementType.Array: {
                return [element[0], ...mapIndexes(element.slice(1))];
            }
            case ElementType.Object: {
                return [element[0], mapIndex(element[1]), mapIndex(element[2])];
            }
            case ElementType.String: {
                return [element[0], ...mapIndexes(element.slice(1))];
            }
            case ElementType.SubString: {
                return element[3] !== undefined
                    ? [element[0], mapIndex(element[1]), element[2], element[3]]
                    : [element[0], mapIndex(element[1]), element[2]];
            }
            case ElementType.Set: {
                return [element[0], mapIndex(element[1])];
            }
            case ElementType.Map: {
                return [element[0], mapIndex(element[1]), mapIndex(element[2])];
            }
            case ElementType.RegExp: {
                return [element[0], mapIndex(element[1]), mapIndex(element[2])];
            }
            case ElementType.Date: {
                return element;
            }
            case ElementType.BigInt: {
                return [element[0], mapIndex(element[1])];
            }
        }
        assert(false, 'Invalid element type');
    }

    if (Array.isArray(elem)) {
        return handleArrayElement(elem as ArrayBasedElements);
    }

    if (typeof elem === 'string') {
        return elem;
    }

    if (typeof elem === 'number') {
        return elem;
    }

    if (typeof elem === 'object') {
        return elem;
    }

    assert(typeof elem === 'boolean');
    return elem;
}

function getRefIndexes(elem: FlattenedElement): number[] {
    function handleArrayElement(element: ArrayBasedElements): number[] {
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
                return element.slice(1);
            }
            case ElementType.Map: {
                return element.slice(1);
            }
            case ElementType.RegExp: {
                return element.slice(1);
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

interface RefElement {
    origIndex: number;
    refCount: number;
    index: number;
    element: FlattenedElement;
}
