export class RefCounter<T> {
    #refCounts = new Map<T, number>();

    constructor(values?: Iterable<T>) {
        if (values) {
            for (const value of values) {
                this.add(value);
            }
        }
    }

    /**
     * Increment the reference count for a value. If the value does not exist in the map, it will be added with a count of 1.
     */
    add(value: T): void {
        const count = this.#refCounts.get(value) ?? 0;
        this.#refCounts.set(value, count + 1);
    }

    set(value: T, count: number): void {
        this.#refCounts.set(value, count);
    }

    has(value: T): boolean {
        return this.#refCounts.has(value);
    }

    get(value: T): number {
        return this.#refCounts.get(value) ?? 0;
    }

    isReferenced(value: T): boolean {
        return !!this.get(value);
    }

    clear(): void {
        this.#refCounts.clear();
    }

    delete(value: T): boolean {
        return this.#refCounts.delete(value);
    }

    [Symbol.iterator](): IterableIterator<[T, number]> {
        return this.#refCounts.entries();
    }

    toJSON(): Map<T, number> {
        return this.#refCounts;
    }
}
