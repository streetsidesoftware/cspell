import { describe, expect, test } from 'vitest';

import { defineConfig } from './defineConfig.js';

describe('defineConfig', () => {
    test('defineConfig is a pure pass-through', () => {
        const config = { name: 'test' };
        Object.freeze(config);
        expect(defineConfig(config)).toBe(config);
    });
});
