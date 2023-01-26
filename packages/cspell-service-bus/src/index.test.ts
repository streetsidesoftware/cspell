import { describe, expect, test } from 'vitest';

import * as index from './index.js';

describe('index', () => {
    test('API', () => {
        const api = Object.entries(index)
            .map(([key, value]) => `${key} => ${typeof value}`)
            .sort();
        expect(api).toMatchSnapshot();
    });
});
