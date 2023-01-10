import { reduce } from '@cspell/cspell-pipe/sync/index.js';

export function sumValues(numbers: Iterable<number>): number {
    return reduce(numbers, (a, b) => a + b, 0);
}
