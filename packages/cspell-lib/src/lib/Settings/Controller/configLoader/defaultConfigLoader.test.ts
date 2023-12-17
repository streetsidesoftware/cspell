import { describe, expect, test } from 'vitest';

import { getDefaultConfigLoader } from './defaultConfigLoader.js';

describe('defaultConfigLoader', () => {
    test('getDefaultConfigLoader', () => {
        expect(getDefaultConfigLoader()).toEqual(expect.any(Object));
    });
});
