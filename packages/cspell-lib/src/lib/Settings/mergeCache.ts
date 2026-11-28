import type { CacheStats } from '@streetsidesoftware/auto-resolve-map';
import { AutoResolveWeakCache, AutoResolveWeakMap } from '@streetsidesoftware/auto-resolve-map';

import { onClearCache } from '../events/index.js';

interface IDisposable {
    dispose(): void;
}

export class CalcLeftRightResultWeakCache<TL extends object, TR extends object, R> implements IDisposable {
    private map = new AutoResolveWeakCache<TL, AutoResolveWeakMap<TR, R>>();

    private _toDispose: IDisposable | undefined;

    constructor() {
        this._toDispose = onClearCache(() => {
            this.clear();
        });
    }

    get(left: TL, right: TR, calc: (left: TL, right: TR) => R): R {
        const m = this.map.getOrInsertComputed(left, () => new AutoResolveWeakMap());
        return m.getOrInsertComputed(right, () => calc(left, right));
    }

    clear(): void {
        this.map.clear();
    }

    dispose(): void {
        this.map.clear();
        this._toDispose?.dispose();
        this._toDispose = undefined;
    }

    stats(): Readonly<CacheStats> {
        return this.map.stats();
    }
}
