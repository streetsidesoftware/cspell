import { describe, expect, test } from 'vitest';

import * as m from './index';

describe('index', () => {
    test('index methods exist', () => {
        expect(Object.keys(m)).toMatchSnapshot();
    });
});
