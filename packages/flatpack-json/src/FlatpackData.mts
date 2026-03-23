import assert from 'node:assert';

import { getFlatpackedRootIdx, getIndexesReferencedByElement } from './flatpacked.mjs';
import { StringTableBuilder } from './stringTable.mjs';
import {
    dataHeaderV2_0,
    ElementType,
    type EmptyElement,
    type Flatpacked,
    type FlatpackIndex,
    type FlattenedElement,
    type StringTableElement,
} from './types.mjs';
import { isStringTableElement } from './unpackedAnnotation.mjs';

const emptyElement: EmptyElement = [] as const;

export class FlatpackData {
    flatpack: Flatpacked;
    stringTable: StringTableBuilder;
    rootIndex: FlatpackIndex;
    used: Set<FlatpackIndex> = new Set();
    ownedBy: Map<FlatpackIndex, FlatpackIndex> = new Map();
    available: FlatpackIndex[] = [];

    constructor(flatpack: Flatpacked | undefined) {
        this.flatpack = flatpack ? [...flatpack] : [dataHeaderV2_0, [ElementType.StringTable]];
        assert(
            isStringTableElement(this.flatpack[1]),
            'Expected a string table element at index 1 of the flatpack data',
        );
        this.stringTable = new StringTableBuilder(this.flatpack[1] as StringTableElement);
        this.rootIndex = getFlatpackedRootIdx(this.flatpack);
        this.#calcAvailableIndexes();
        this.available.push(this.rootIndex);
    }

    add(element: FlattenedElement): FlatpackIndex {
        const idx = this.#getNextAvailableIndex();
        this.flatpack[idx] = element;
        this.used.delete(idx);
        this.markUsed(idx);
        return idx;
    }

    reserve(): FlatpackIndex {
        const idx = this.add(emptyElement);
        return idx;
    }

    set(idx: FlatpackIndex, element: FlattenedElement): void {
        this.flatpack[idx] = element;
        this.used.delete(idx);
        this.markUsed(idx);
    }

    get(idx: FlatpackIndex): FlattenedElement {
        return this.flatpack[idx];
    }

    markUsed(idx: FlatpackIndex): void {
        if (this.used.has(idx)) return;
        this.used.add(idx);
        const children = getIndexesReferencedByElement(this.flatpack[idx]);
        // First claim ownership of children before recursively marking them as used.
        // We need to ensure they are owned at the top.
        for (const childIdx of children) {
            this.claimOwnership(childIdx, idx);
        }
        for (const childIdx of children) {
            this.markUsed(childIdx);
        }
    }

    isUsed(idx: FlatpackIndex): boolean {
        return this.used.has(idx);
    }

    duplicateIndex(idx: FlatpackIndex): FlatpackIndex {
        const element = this.get(idx);
        return this.add(element);
    }

    delete(idx: FlatpackIndex): void {
        this.used.delete(idx);
        this.available.push(idx);
        this.flatpack[idx] = emptyElement;
    }

    claimOwnership(idx: FlatpackIndex, ownerIdx: FlatpackIndex): FlatpackIndex {
        const currentOwner = this.ownedBy.get(idx);
        if (currentOwner !== undefined) return currentOwner;
        this.ownedBy.set(idx, ownerIdx);
        return ownerIdx;
    }

    #getNextAvailableIndex(): FlatpackIndex {
        for (let idx = this.available.pop(); idx !== undefined; idx = this.available.pop()) {
            if (!this.used.has(idx)) {
                return idx;
            }
        }

        return this.flatpack.length;
    }

    /**
     * Calculate available indexes based on the current flatpack data.
     * Any empty array is used as a placeholder for an available flatpack element.
     */
    #calcAvailableIndexes(): void {
        const stop = this.rootIndex;
        const data = this.flatpack;
        for (let i = data.length - 1; i >= stop; i--) {
            const elem = data[i];
            if (elem === undefined || (Array.isArray(elem) && !elem.length)) {
                this.available.push(i);
                this.used.delete(i);
                continue;
            }
        }
    }

    markUnusedAsAvailable(): void {
        const available = new Set(this.available);
        const stop = this.rootIndex;
        const data = this.flatpack;
        const empty = emptyElement;

        for (let i = data.length - 1; i > stop; i--) {
            if (this.used.has(i)) continue;
            data[i] = empty;
            available.add(i);
        }

        this.available = [...available];
    }

    finalize(): Flatpacked {
        this.flatpack[1] = this.stringTable.clearUnusedEntries().build();
        this.#calcAvailableIndexes();
        this.markUnusedAsAvailable();
        let idx = this.flatpack.length - 1;
        while (idx >= this.rootIndex && !this.used.has(idx)) {
            --idx;
        }
        this.flatpack.length = idx + 1;
        return this.flatpack;
    }
}
