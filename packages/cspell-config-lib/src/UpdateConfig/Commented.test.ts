import { parse as parseJsonC } from 'comment-json';
import { describe, expect, test } from 'vitest';

import { unindent } from '../util/unindent.js';
import { createCommentedNode } from './Commented.js';

describe('Commented', () => {
    test.each`
        value
        ${1}
        ${'test'}
        ${true}
        ${null}
        ${[1, 2, 3]}
        ${{ a: 1, b: 2, c: ['a', 'b', 'c'] }}
    `('createCommentedNode $value', ({ value }) => {
        const node = createCommentedNode(value);
        expect(node.value).toEqual(value);
    });

    test.each`
        value
        ${1}
        ${'test'}
        ${true}
        ${null}
        ${[1, 2, 3]}
        ${{ a: 1, b: 2, c: 'c' }}
        ${{ a: 1, b: 2, c: ['a', 'b', 'c'] }}
    `('createCommentedNode toJSON $value', ({ value }) => {
        const node = createCommentedNode(value);
        expect(JSON.stringify(node)).toEqual(JSON.stringify(value));
        expect(JSON.stringify(node, undefined, 2)).toEqual(JSON.stringify(value, undefined, 2));
    });

    test('comment-json', () => {
        const json = unindent`
            /* Top Comment Block */
            // Before object
            {
                // This is a comment
                "a": 1,
                "b": 2, // Inline "b"
                "c": [
                    // Before 1
                    1, /* block comment */
                    2, // Inline after 2
                    // Before 3
                    3,
                    "four" // index 3 , value 4
                ],
                "d": {
                   // Only a comment
                } // Inline after d
                // After "d" 1
                // After "d" 2
            }
            // After object
        `;
        const p = parseJsonC(json);

        // console.log('%o', json);

        expect(p).toEqual({
            a: 1,
            b: 2,
            c: [1, 2, 3, 'four'],
            d: {},
        });
        // console.log(inspect(p, { depth: 10, colors: true, showHidden: true }));
    });
});
