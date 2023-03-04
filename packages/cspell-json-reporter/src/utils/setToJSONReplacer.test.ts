import { describe, expect, test } from 'vitest';

import { setToJSONReplacer } from './setToJSONReplacer.js';

describe('setToJSONReplacer', () => {
    test('converts Set to Array', () => {
        const input = {
            foo: new Set(['foo', 'bar', 123]),
        };
        expect(JSON.stringify(input, setToJSONReplacer)).toMatchSnapshot();
    });

    test('ignores other values', () => {
        const input = {
            foo: 'bar',
            '123': '1',
            obj: { key: 'value' },
            array: [1, 2, 3],
        };
        expect(JSON.stringify(input, setToJSONReplacer)).toMatchSnapshot();
    });
});
