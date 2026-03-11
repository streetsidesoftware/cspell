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

export class StringTableBuilder {
    splitStrings: boolean = false;
    private stringToIndex = new Map<string, number>();
    private entries: BuilderEntry[] = [{ value: '', entry: '', refCount: 0 }];
    private availableIndexes: number[] = [];

    constructor(stringTableElement?: StringTableElement) {
        if (!stringTableElement) return;

        const st = new StringTable(stringTableElement);
        for (const [idx, value] of st.entries()) {
            if (!idx) continue;
            const entry = stringTableElement[idx] as StringTableEntry;
            this.entries[idx] = { value, entry, refCount: 0 };
            if (this.stringToIndex.has(value)) continue;
            if (Array.isArray(entry) && !entry.length) {
                this.availableIndexes.push(idx);
                continue;
            }
            this.stringToIndex.set(value, idx);
        }
    }

    add(str: string): number {
        const found = this.stringToIndex.get(str);
        if (found !== undefined) {
            const entry = this.entries[found];
            entry.refCount++;
            return found;
        }
        if (!str) {
            return this.#append('');
        }
        return this.#append(str);
    }

    getIndex(str: string): number | undefined {
        return this.stringToIndex.get(str);
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
        return this.entries[index];
    }

    #getEntryCheckBounds(index: number): BuilderEntry {
        const entry = this.#getEntry(index);
        if (!entry) {
            throw new Error(`Invalid string table index: ${index}`);
        }
        return entry;
    }

    #append(str: string): number {
        const found = this.stringToIndex.get(str);
        if (found !== undefined) {
            return found;
        }
        const entry: BuilderEntry = { value: str, entry: str, refCount: 1 };
        const idx = this.availableIndexes.shift() ?? this.entries.length;
        this.entries[idx] = entry;
        this.stringToIndex.set(str, idx);
        return idx;
    }

    clearUnusedEntries(): void {
        for (let i = 1; i < this.entries.length; i++) {
            const entry = this.entries[i];
            if (entry.refCount > 0) continue;
            this.stringToIndex.delete(entry.value);
            this.entries[i] = { value: '', entry: [], refCount: 0 };
            this.availableIndexes.push(i);
        }
    }

    build(): StringTableElement {
        return [ElementType.StringTable, ...this.entries.slice(1).map((e) => e.entry)];
    }
}
