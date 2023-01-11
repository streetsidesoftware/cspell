import { reduce } from '@cspell/cspell-pipe/sync/index.js';
import { reduceSync, reduceAsync } from '@cspell/cspell-pipe';

export function sumValues(numbers: Iterable<number>): number {
    return reduce(numbers, (a, b) => a + b, 0);
}

export function sumValuesSync(numbers: Iterable<number>): number {
    return reduceSync(numbers, (a, b) => a + b, 0);
}

export function sumValuesAsync(numbers: Iterable<number>): Promise<number> {
    return reduceAsync(numbers, (a, b) => a + b, 0);
}
