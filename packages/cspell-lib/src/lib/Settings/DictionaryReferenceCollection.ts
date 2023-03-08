import type { DictionaryId, DictionaryReference } from '@cspell/cspell-types';

export interface DictionaryReferenceCollection {
    isEnabled(name: DictionaryId): boolean | undefined;
    isBlocked(name: DictionaryId): boolean | undefined;
    enabled(): DictionaryId[];
    blocked(): DictionaryId[];
    dictionaryIds: DictionaryId[];
}

export function createDictionaryReferenceCollection(
    dictionaries: DictionaryReference[]
): DictionaryReferenceCollection {
    return new _DictionaryReferenceCollection(dictionaries);
}

class _DictionaryReferenceCollection implements DictionaryReferenceCollection {
    readonly collection: Collection;

    constructor(readonly dictionaries: DictionaryReference[]) {
        this.collection = collect(dictionaries);
    }

    isEnabled(name: DictionaryId): boolean | undefined {
        const entry = this.collection[name];
        return entry === undefined ? undefined : !!(entry & 0x1);
    }

    isBlocked(name: DictionaryId): boolean | undefined {
        const entry = this.collection[name];
        return entry === undefined ? undefined : !(entry & 0x1);
    }

    enabled(): DictionaryId[] {
        return this.dictionaryIds.filter((n) => this.isEnabled(n));
    }

    blocked(): DictionaryId[] {
        return this.dictionaryIds.filter((n) => this.isBlocked(n));
    }

    get dictionaryIds(): DictionaryId[] {
        return Object.keys(this.collection);
    }
}

type Collection = Record<string, number | undefined>;

function collect(dictionaries: DictionaryReference[]): Collection {
    const refs = dictionaries.map(normalizeName).map(mapReference);
    const col: Collection = {};
    for (const ref of refs) {
        col[ref.name] = Math.max(ref.weight, col[ref.name] || 0);
    }
    return col;
}

function normalizeName(entry: string): string {
    return entry.normalize().trim();
}

function mapReference(ref: DictionaryReference): { name: string; weight: number } {
    const name = ref.replace(/^!+/, '');
    const weight = ref.length - name.length + 1;
    return { name: name.trim(), weight };
}
