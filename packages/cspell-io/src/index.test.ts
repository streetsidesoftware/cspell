import { describe, expect, test } from 'vitest';

import * as index from './index.js';

describe('index', () => {
    test('exports', () => {
        expect(index.readTextFile).toBeDefined();
    });

    test('api', () => {
        const api = Object.entries(index)
            .map(([key, value]) => `${key} => ${typeof value}`)
            .sort();
        expect(api).toMatchSnapshot();
    });
});
