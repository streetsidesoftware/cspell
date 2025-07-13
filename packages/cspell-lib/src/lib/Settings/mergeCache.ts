import { onClearCache } from '../events/index.js';
import { AutoResolveWeakCache, CacheStats } from '../util/AutoResolve.js';

interface IDisposable {
    dispose(): void;
}

export class CalcLeftRightResultWeakCache<TL extends object, TR extends object, R> implements IDisposable {
    private map = new AutoResolveWeakCache<TL, AutoResolveWeakCache<TR, R>>();

    private _toDispose: IDisposable | undefined;

    constructor() {
        this._toDispose = onClearCache(() => {
            this.clear();
        });
    }

    get(left: TL, right: TR, calc: (left: TL, right: TR) => R): R {
        const m = this.map.get(left, () => new AutoResolveWeakCache());
        return m.get(right, () => calc(left, right));
    }

    clear(): void {
        this.map.clear();
    }

    dispose(): void {
        this.map.dispose();
        this._toDispose?.dispose();
        this._toDispose = undefined;
    }

    stats(): Readonly<CacheStats> {
        return this.map.stats();
    }
}
