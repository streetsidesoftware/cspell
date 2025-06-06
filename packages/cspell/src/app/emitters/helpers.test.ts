import { describe, expect, test } from 'vitest';

import { trimMidPath } from './helpers.js';

describe('helpers', () => {
    test.each`
        path                      | width | expected
        ${''}                     | ${20} | ${''}
        ${'0123456789'}           | ${7}  | ${'01...89'}
        ${'0123/56789'}           | ${7}  | ${'01...89'}
        ${'0123/56789'}           | ${9}  | ${'.../56789'}
        ${'0123/56789/1234/6789'} | ${20} | ${'0123/56789/1234/6789'}
        ${'0123/89/77/1234/6789'} | ${19} | ${'0123/.../1234/6789'}
        ${'0123/8/7/1gh1234/689'} | ${19} | ${'0123/8/7/.../689'}
    `('trimMidPath', ({ path, width, expected }) => {
        expect(trimMidPath(path, width, '/')).toBe(expected);
    });
});
