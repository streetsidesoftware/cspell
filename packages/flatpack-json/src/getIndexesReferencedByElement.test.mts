import { describe, expect, it } from 'vitest';

import { getIndexesReferencedByElement } from './getIndexesReferencedByElement.mjs';
import {
    type ArrayBasedElements,
    type ArrayElement,
    ElementType,
    type ObjectElement,
    type StringElement,
} from './types.mjs';

describe('getIndexesReferencedByElement', () => {
    describe('Array element type', () => {
        it('should return all indexes for Array type', () => {
            const elem: ArrayElement = [ElementType.Array, 0, 1, 2, 5];
            expect(getIndexesReferencedByElement(elem)).toEqual([0, 1, 2, 5]);
        });

        it('should return empty array for Array with no indexes', () => {
            const elem: ArrayElement = [ElementType.Array];
            expect(getIndexesReferencedByElement(elem)).toEqual([]);
        });
    });

    describe('Object element type', () => {
        it('should return only truthy indexes for Object type', () => {
            const elem: ObjectElement = [ElementType.Object, 5, 10];
            expect(getIndexesReferencedByElement(elem)).toEqual([5, 10]);
        });

        it('Object wrapper', () => {
            const elem: ObjectElement = [ElementType.Object, 0, 7];
            expect(getIndexesReferencedByElement(elem)).toEqual([7]);
        });
    });

    describe('String element type', () => {
        it('should return all indexes for String type', () => {
            const elem: StringElement = [ElementType.String, 0, 1, 2, 3];
            expect(getIndexesReferencedByElement(elem)).toEqual([0, 1, 2, 3]);
        });

        it('should return empty array for String with no indexes', () => {
            const elem: StringElement = [ElementType.String];
            expect(getIndexesReferencedByElement(elem)).toEqual([]);
        });
    });

    describe('SubString element type', () => {
        it('should return single index for SubString type', () => {
            const elem: ArrayBasedElements = [ElementType.SubString, 42, 12, 2];
            expect(getIndexesReferencedByElement(elem)).toEqual([42]);
        });

        it('should return only first index for SubString type', () => {
            const elem: ArrayBasedElements = [ElementType.SubString, 10, 20, 30];
            expect(getIndexesReferencedByElement(elem)).toEqual([10]);
        });
    });

    describe('Set element type', () => {
        it('should return all indexes for Set type', () => {
            const elem: ArrayBasedElements = [ElementType.Set, 4];
            expect(getIndexesReferencedByElement(elem)).toEqual([4]);
        });
    });

    describe('Map element type', () => {
        it('should return all indexes for Map type', () => {
            const elem: ArrayBasedElements = [ElementType.Map, 1, 2];
            expect(getIndexesReferencedByElement(elem)).toEqual([1, 2]);
        });
    });

    describe('RegExp element type', () => {
        it('should return all indexes for RegExp type', () => {
            const elem = [ElementType.RegExp, 5, 10] as const;
            expect(getIndexesReferencedByElement(elem)).toEqual([5, 10]);
        });
    });

    describe('Date element type', () => {
        it('should return empty array for Date type', () => {
            const elem = [ElementType.Date, 2] as const;
            expect(getIndexesReferencedByElement(elem)).toEqual([]);
        });
    });

    describe('BigInt element type', () => {
        it('should return single index for BigInt type', () => {
            const elem = [ElementType.BigInt, 99] as const;
            expect(getIndexesReferencedByElement(elem)).toEqual([99]);
        });
    });

    describe('Primitive types', () => {
        it('should return empty array for string primitive', () => {
            expect(getIndexesReferencedByElement('hello')).toEqual([]);
        });

        it('should return empty array for number primitive', () => {
            expect(getIndexesReferencedByElement(42)).toEqual([]);
        });

        it('should return empty array for null', () => {
            expect(getIndexesReferencedByElement(null)).toEqual([]);
        });

        it('should return empty array for boolean true', () => {
            expect(getIndexesReferencedByElement(true)).toEqual([]);
        });

        it('should return empty array for boolean false', () => {
            expect(getIndexesReferencedByElement(false)).toEqual([]);
        });
    });
});
