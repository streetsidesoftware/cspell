import assert from 'node:assert';

import { ElementType, type StringTableElement, type StringTableEntry } from './types.mjs';

export class StringTable {
    constructor(readonly stringTableElement: StringTableElement) {}

    get(index: number): string | undefined {
        if (!index) return '';
        index = index < 0 ? -index : index;
        if (index >= this.stringTableElement.length) return undefined;
        return this.#getCompoundString(index);
    }

    *entries(): Iterable<[number, string]> {
        for (let i = 1; i < this.stringTableElement.length; i++) {
            yield [i, this.#getCompoundString(i)];
        }
    }

    *values(): Iterable<string> {
        for (const entry of this.entries()) {
            yield entry[1];
        }
    }

    get size(): number {
        return this.stringTableElement.length;
    }

    #getCompoundString(index: number, visited = new Set<number>()): string {
        if (visited.has(index)) {
            throw new Error(`Circular reference in string table at index ${index}`);
        }
        const entry = this.stringTableElement[index];
        if (typeof entry === 'string') {
            return entry;
        }
        if (Array.isArray(entry)) {
            visited.add(index);
            const value = entry.map((i) => this.#getCompoundString(i, visited)).join('');
            visited.delete(index);
            return value;
        }
        throw new Error(`Invalid string table entry at index ${index}`);
    }
}

interface BuilderEntry {
    value: string;
    entry: StringTableEntry;
    refCount: number;
}

const tokenRegex = /\w+/g;

export class StringTableBuilder {
    splitStrings: boolean = false;
    #stringToIndex = new Map<string, number>();
    #entries: BuilderEntry[] = [{ value: '', entry: '', refCount: 0 }];
    #availableIndexes: number[] = [];
    tokenRegex: RegExp = tokenRegex;
    #splitIntoTokens: boolean = false;

    constructor(stringTableElement?: StringTableElement) {
        if (!stringTableElement) return;

        const st = new StringTable(stringTableElement);
        for (const [idx, value] of st.entries()) {
            if (!idx) continue;
            const entry = stringTableElement[idx] as StringTableEntry;
            this.#entries[idx] = { value, entry, refCount: 0 };
            if (Array.isArray(entry) && !entry.length) {
                this.#availableIndexes.push(idx);
                continue;
            }
            if (!this.#stringToIndex.has(value)) {
                this.#stringToIndex.set(value, idx);
            }
        }
    }

    set splitIntoTokensWhenAdding(value: boolean) {
        this.#splitIntoTokens = value;
    }

    get splitIntoTokensWhenAdding(): boolean {
        return this.#splitIntoTokens;
    }

    add(str: string): number {
        const found = this.#stringToIndex.get(str);
        if (found !== undefined) {
            const entry = this.#entries[found];
            entry.refCount++;
            return found;
        }
        str ||= '';
        return this.#append(str);
    }

    getIndex(str: string): number | undefined {
        return this.#stringToIndex.get(str);
    }

    get(index: number): string | undefined {
        const entry = this.#getEntry(index);
        return entry?.value;
    }

    /**
     * Increments the reference count for the given index.
     * @param index - The index of the string in the string table. The absolute value is used.
     * @returns the new reference count for the string at the given index.
     */
    addRef(index: number): number {
        const entry = this.#getEntryCheckBounds(index);
        const count = ++entry.refCount;
        if (count === 1 && Array.isArray(entry.entry)) {
            entry.entry.forEach((i) => this.addRef(i));
        }
        return count;
    }

    getRefCount(index: number): number {
        const entry = this.#getEntryCheckBounds(index);
        return entry.refCount;
    }

    #getEntry(index: number): BuilderEntry | undefined {
        index = index < 0 ? -index : index;
        return this.#entries[index];
    }

    #getEntryCheckBounds(index: number): BuilderEntry {
        const entry = this.#getEntry(index);
        if (!entry) {
            throw new Error(`Invalid string table index: ${index}`);
        }
        return entry;
    }

    #append(str: string): number {
        const found = this.#stringToIndex.get(str);
        if (found !== undefined) {
            return found;
        }
        const entry: BuilderEntry = { value: str, entry: str, refCount: 1 };
        const idx = this.#availableIndexes.shift() ?? this.#entries.length;
        this.#entries[idx] = entry;
        this.#stringToIndex.set(str, idx);
        if (this.#splitIntoTokens) {
            this.#splitEntryIntoTokens(entry);
        }
        return idx;
    }

    #splitEntryIntoTokens(entry: BuilderEntry): void {
        if (Array.isArray(entry.entry)) return;
        if (!entry.value) return;
        const regex = new RegExp(this.tokenRegex);
        const indexes: number[] = [...entry.value.matchAll(regex)].flatMap((match) => [
            match.index,
            match.index + match[0].length,
        ]);
        if (!indexes.length) return;
        if (indexes.length === 2 && indexes[0] === 0 && indexes[1] === entry.value.length) {
            return;
        }
        const subEntries: number[] = [];
        entry.entry = subEntries;
        indexes.push(entry.value.length);
        let lastIndex = 0;
        for (const index of indexes) {
            if (index === lastIndex) continue;
            const value = entry.value.slice(lastIndex, index);
            subEntries.push(this.add(value));
            lastIndex = index;
        }
    }

    clearUnusedEntries(): this {
        for (let i = 1; i < this.#entries.length; i++) {
            const entry = this.#entries[i];
            if (entry.refCount > 0) continue;
            if (this.#stringToIndex.get(entry.value) === i) {
                this.#stringToIndex.delete(entry.value);
            }
            this.#entries[i] = { value: '', entry: [], refCount: 0 };
            this.#availableIndexes.push(i);
        }
        return this;
    }

    tokenizeAllEntries(): this {
        for (const entry of this.#entries) {
            this.#splitEntryIntoTokens(entry);
        }
        return this;
    }

    /**
     * Sorts the entries in the string table by reference count, with the most referenced strings first.
     * This can help reduce the size of the string table when serialized, as more frequently used strings
     * will have smaller indexes.
     * @returns a map of old indexes to new indexes after sorting. The index 0 is always mapped to itself.
     */
    sortEntriesByRefCount(): Map<number, number> {
        const mapEntryToOldIndex = new Map<BuilderEntry, number>(this.#entries.map((entry, index) => [entry, index]));

        const entry0 = this.#entries[0];
        const sorted = this.#entries.sort((a, b) =>
            a === entry0 ? -1 : b === entry0 ? 1 : b.refCount - a.refCount || getOldIndex(a) - getOldIndex(b),
        );

        const oldIndexToNew = new Map<number, number>(sorted.map((entry, index) => [getOldIndex(entry), index]));

        for (const entry of this.#entries) {
            if (!Array.isArray(entry.entry)) continue;
            entry.entry = entry.entry.map((i) => oldIndexToNew.get(i) ?? i);
        }

        for (const [str, oldIdx] of this.#stringToIndex.entries()) {
            this.#stringToIndex.set(str, oldIndexToNew.get(oldIdx) ?? oldIdx);
        }

        return oldIndexToNew;

        function getOldIndex(entry: BuilderEntry): number {
            const oldIndex = mapEntryToOldIndex.get(entry);
            assert(oldIndex !== undefined, 'Entry not found in map');
            return oldIndex;
        }
    }

    build(): StringTableElement {
        return [ElementType.StringTable, ...this.#entries.slice(1).map((e) => e.entry)];
    }
}
