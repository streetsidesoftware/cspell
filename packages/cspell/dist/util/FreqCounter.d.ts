import { IterableLike } from './IterableLike';
export declare class FreqCounter<T> {
    private _total;
    readonly _counters: Map<T, number>;
    readonly total: number;
    readonly counters: Map<T, number>;
    getCount(key: T): number | undefined;
    getFreq(key: T): number;
    addKeyCount(key: T, count: number): this;
    addKey(key: T): this;
    addKeys(keys: IterableLike<T>): void;
    addKeyCounts(values: IterableLike<[T, number]>): void;
    merge(...freqCounters: FreqCounter<T>[]): FreqCounter<T>;
    static create<T>(values?: IterableLike<T>): FreqCounter<T>;
}
