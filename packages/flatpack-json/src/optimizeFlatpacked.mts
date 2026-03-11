import assert from 'node:assert';

import { StringTableBuilder } from './stringTable.mjs';
import type { ArrayBasedElements, Flatpacked, FlattenedElement, StringTableElement } from './types.mjs';
import { ElementType, supportedHeaders } from './types.mjs';

export function optimizeFlatpacked(data: Flatpacked): Flatpacked {
    const [header, maybeStringTable] = data;

    if (data[1] === undefined || data[2] === undefined) {
        return data;
    }

    if (!supportedHeaders.has(header)) {
        throw new Error('Invalid header');
    }

    const stringTable =
        maybeStringTable && Array.isArray(maybeStringTable) && maybeStringTable[0] === ElementType.StringTable
            ? (maybeStringTable as StringTableElement)
            : undefined;

    const startIndex = stringTable ? 2 : 1;

    const elements = data.slice(startIndex);

    const elementRefs = elements.map((element, index) => ({
        origIndex: index + startIndex,
        refCount: 0,
        index: 0,
        element,
    }));
    const indexToRefElement = new Map<number, RefElement>(
        elementRefs.map((refElement) => [refElement.origIndex, refElement]),
    );

    const stringTableBuilder = new StringTableBuilder(stringTable);

    for (const refElement of elementRefs) {
        const indexes = getRefIndexes(refElement.element);
        for (const index of indexes) {
            if (index < 0) {
                stringTableBuilder.addRef(-index);
                continue;
            }
            if (!index) {
                continue;
            }
            const ref = indexToRefElement.get(index);
            assert(ref, `Invalid reference index: ${index}`);
            ref.refCount++;
        }
    }

    const sortedRefElements = elementRefs.sort((a, b) => b.refCount - a.refCount || a.origIndex - b.origIndex);

    const indexMap = new Map<number, number>([
        [0, 0],
        [1, 1],
    ]);

    if (stringTable) {
        indexMap.set(2, 2);
    }

    for (const refElement of sortedRefElements) {
        const idx = indexMap.get(refElement.origIndex) ?? indexMap.size;
        refElement.index = idx;
        indexMap.set(refElement.origIndex, idx);
    }

    for (const [oldStrIndex, newStrIndex] of stringTableBuilder.sortEntriesByRefCount()) {
        if (!oldStrIndex || !newStrIndex) {
            continue;
        }
        indexMap.set(-oldStrIndex, -newStrIndex);
    }

    const stringTableElements = stringTable ? [stringTableBuilder.build()] : [];

    const result: Flatpacked = [header, ...stringTableElements];

    for (const refElement of sortedRefElements) {
        const element = patchIndexes(refElement.element, indexMap);
        result[refElement.index] = element;
    }

    return result;
}

function patchIndexes(elem: FlattenedElement, indexMap: Map<number, number>): FlattenedElement {
    function mapIndex(index: number): number {
        const v = indexMap.get(index);
        if (v === undefined && index < 0) return index;
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

    assert(typeof elem === 'boolean', `Expected boolean, got ${typeof elem}`);
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
