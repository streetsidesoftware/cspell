export class RefCounter<T> {
    #refCounts = new Map<T, number>();

    constructor(values?: Iterable<T>) {
        if (values) {
            for (const value of values) {
                this.add(value);
            }
        }
    }

    add(value: T): void {
        const count = this.#refCounts.get(value) ?? 0;
        this.#refCounts.set(value, count + 1);
    }

    set(value: T, count: number): void {
        this.#refCounts.set(value, count);
    }

    get(value: T): number {
        return this.#refCounts.get(value) ?? 0;
    }

    hasRefs(value: T): boolean {
        return !!this.get(value);
    }

    clear(): void {
        this.#refCounts.clear();
    }

    [Symbol.iterator](): IterableIterator<[T, number]> {
        return this.#refCounts.entries();
    }
}
