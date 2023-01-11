import { describe, expect, test } from 'vitest';

import { toArray } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { opFlatten } from './flatten.js';

describe('Validate flatten', () => {
    test.each`
        values                                      | expected
        ${[['one', 'two', 'three'], [1, 2, 3], []]} | ${['one', 'two', 'three', 1, 2, 3]}
        ${[]}                                       | ${[]}
        ${[[]]}                                     | ${[]}
        ${['one', 'two']}                           | ${['o', 'n', 'e', 't', 'w', 'o']}
    `('flatten $values', async ({ values, expected }) => {
        const s = pipeSync(values, opFlatten());
        const a = pipeAsync(values, opFlatten());

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});
