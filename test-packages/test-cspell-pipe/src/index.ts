import { reduce } from '@cspell/cspell-pipe/sync';

export function sumValues(numbers: Iterable<number>): number {
    return reduce(numbers, (a, b) => a + b, 0);
}
