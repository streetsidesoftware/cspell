import { describe, expect, test } from 'vitest';
import { opJoinStrings } from './joinStrings.js';
import { toArray } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';

describe('Validate flatten', () => {
    test.each`
        values                                      | join         | expected
        ${[['one', 'two', 'three'], [1, 2, 3], []]} | ${undefined} | ${['one,two,three', '1,2,3', '']}
        ${[['one', 'two', 'three'], [1, 2, 3], []]} | ${'|'}       | ${['one|two|three', '1|2|3', '']}
        ${[]}                                       | ${undefined} | ${[]}
        ${[[]]}                                     | ${undefined} | ${['']}
        ${['one', 'two']}                           | ${undefined} | ${['o,n,e', 't,w,o']}
        ${[['one', 'two']]}                         | ${undefined} | ${['one,two']}
        ${['😀😃😄😁']}                             | ${'|'}       | ${['😀|😃|😄|😁']}
    `('flatten $values "$join"', async ({ values, join, expected }) => {
        const s = pipeSync(values, opJoinStrings(join));
        const a = pipeAsync(values, opJoinStrings(join));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});
