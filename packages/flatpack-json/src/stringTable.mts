import { Trie } from './Trie.mjs';
import { ElementType, type StringTableElement, type StringTableEntry } from './types.mjs';

export class StringTable {
    constructor(readonly stringTableElement: StringTableElement) {}

    get(index: number): string {
        if (!index) return '';
        index = index < 0 ? -index : index;
        return this.#getCompoundString(index);
    }

    #getCompoundString(index: number, visited = new Set<number>()): string {
        if (visited.has(index)) {
            throw new Error(`Circular reference in string table at index ${index}`);
        }
        visited.add(index);
        const entry = this.stringTableElement[index];
        if (typeof entry === 'string') {
            return entry;
        }
        if (Array.isArray(entry)) {
            return entry.map((i) => this.#getCompoundString(i, visited)).join('');
        }
        throw new Error(`Invalid string table entry at index ${index}`);
    }
}

interface TrieData {
    idx: number;
    value: string;
}

interface BuilderEntry {
    value: string;
    entry: StringTableEntry;
}

const useSplits = false;

export class StringTableBuilder {
    private stringToIndex = new Map<string, number>();
    private entries: BuilderEntry[] = [{ value: '', entry: '' }];
    private knownStrings = new Trie<TrieData>();

    add(str: string): number {
        const found = this.stringToIndex.get(str);
        if (found !== undefined) {
            return found;
        }
        if (!str) {
            return this.#append('');
        }
        const foundInTrie = this.knownStrings.find(str);
        if (!foundInTrie) {
            const idx = this.#append(str);
            return idx;
        }
        const idx = this.#append(str);
        this.#splitStrings(foundInTrie.found);
        return idx;
    }

    get(str: string): number | undefined {
        return this.stringToIndex.get(str);
    }

    #append(str: string): number {
        const found = this.stringToIndex.get(str);
        if (found !== undefined) {
            return found;
        }
        const entry: BuilderEntry = { value: str, entry: str };
        const idx = this.entries.push(entry) - 1;
        this.stringToIndex.set(str, idx);
        this.knownStrings.add(str, { idx, value: str });
        return idx;
    }

    #splitStrings(prefix: string): void {
        if (!prefix) return;
        console.log(`Splitting strings with prefix: ${prefix}`);
        if (!useSplits) return;
        const indexes = stringIndexesToSplit(this.knownStrings, prefix);
        for (const idx of indexes) {
            const entry = this.entries[idx];
            if (entry.value === prefix) {
                continue;
            }
            this.#splitEntry(this.entries[idx], prefix);
        }
    }

    #splitEntry(entry: BuilderEntry, prefix: string): void {
        let prefixIdx = this.stringToIndex.get(prefix) ?? this.entries.length;
        const suffix = entry.value.slice(prefix.length);

        const currentCost = entryCost(entry.entry);
        const suffixCost = this.stringToIndex.get(suffix) ? 0 : entryCost(suffix);
        const prefixCost = this.stringToIndex.get(prefix) ? 0 : entryCost(prefix);

        if (typeof entry.entry === 'string') {
            const cost = entryCost([prefixIdx, this.entries.length]) + suffixCost + prefixCost;
            if (cost > currentCost) return;
            prefixIdx = this.#append(prefix);
            const suffixIdx = this.add(suffix);
            entry.entry = [prefixIdx, suffixIdx];
            return;
        }

        const cost = entryCost([prefixIdx, ...entry.entry]) + suffixCost;
        if (cost > currentCost) return;
        // @todo: split concatenated entries.
    }

    build(): StringTableElement {
        return [ElementType.StringTable, ...this.entries.slice(1).map((e) => e.entry)];
    }
}

function entryCost(entry: StringTableEntry): number {
    if (typeof entry === 'string') {
        return entry.length + 2;
    }
    let cost = 1 + entry.length; // array overhead + index size
    for (const idx of entry) {
        cost += Math.log10(idx); // index size
    }
    return cost;
}

function stringIndexesToSplit(trie: Trie<TrieData>, prefix: string): number[] {
    const result: number[] = [];
    for (const { node, found } of trie.walk(prefix)) {
        if (node.d?.value !== found) continue;
        result.push(node.d.idx);
    }
    return result;
}
