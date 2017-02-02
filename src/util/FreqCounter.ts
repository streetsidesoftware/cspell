import {IterableLike} from './IterableLike';

export class FreqCounter<T> {
    private _total: number = 0;
    readonly _counters = new Map<T, number>();

    get total() { return this._total; }
    get counters() { return this._counters; }

    getCount(key: T) {
        return this._counters.get(key);
    }

    getFreq(key: T) {
        return (this.getCount(key) || 0) / (this._total || 1);
    }

    addKeyCount(key: T, count: number) {
        this._total += count;
        this._counters.set(key, (this._counters.get(key) || 0) + count);
        return this;
    }

    addKey(key: T) {
        return this.addKeyCount(key, 1);
    }

    addKeys(keys: IterableLike<T>) {
        for (const key of keys) {
            this.addKey(key);
        }
    }

    addKeyCounts(values: IterableLike<[T, number]>) {
        for (const pair of values) {
            this.addKeyCount(pair[0], pair[1]);
        }
    }

    merge(...freqCounters: FreqCounter<T>[]): FreqCounter<T> {
        for (const fc of freqCounters) {
            this.addKeyCounts(fc._counters);
        }
        return this;
    }

    static create<T>(values?: IterableLike<T>): FreqCounter<T> {
        const fc = new FreqCounter<T>();
        fc.addKeys(values || []);
        return fc;
    }
}
