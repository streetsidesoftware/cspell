// import {} from '@jest/globals';
import type { MatcherFunction } from 'expect';

export const toEqualCaseInsensitive: MatcherFunction<[expected: string]> =
    // `floor` and `ceiling` get types from the line above
    // it is recommended to type them as `unknown` and to validate the values
    function (actual, expected) {
        if (typeof actual !== 'string' || typeof expected !== 'string') {
            throw new Error('These must be of type number!');
        }

        const pass = actual.toLowerCase() === expected.toLowerCase();
        return {
            message: () =>
                // `this` context will have correct typings
                `expected ${this.utils.printReceived(actual)} to equal ${this.utils.printExpected(
                    expected
                )} case insensitive`,
            pass,
        };
    };

interface AsymmetricMatchers {
    toEqualCaseInsensitive(expected: string): string;
}

export function extendExpect(e: typeof expect): AsymmetricMatchers {
    e.extend({
        toEqualCaseInsensitive,
    });

    return (<unknown>e) as AsymmetricMatchers;
}
