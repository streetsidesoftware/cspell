import { opUnique } from '.';
import { toArray } from '../helpers';
import { pipeAsync, pipeSync } from '../pipe';

describe('Validate unique', () => {
    test.each`
        values                                     | keyFn                      | expected
        ${['one', 'two', 'three', 1, 2, 3]}        | ${undefined}               | ${['one', 'two', 'three', 1, 2, 3]}
        ${[]}                                      | ${undefined}               | ${[]}
        ${['one', 'two', 'one']}                   | ${undefined}               | ${['one', 'two']}
        ${['one', 'two', 'three', 'four', 'five']} | ${(k: string) => k.length} | ${['one', 'three', 'four']}
        ${['one', 'two', 'three', 'four', 'five']} | ${(k: string) => k.length} | ${['one', 'three', 'four']}
    `('unique $values $keyFn', async ({ values, keyFn, expected }) => {
        const s = pipeSync(values, opUnique(keyFn));
        const a = pipeAsync(values, opUnique(keyFn));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});
