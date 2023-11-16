import { describe, expect, test } from 'vitest';

import { defaultDeserializers } from './index.js';

describe('index', () => {
    test('defaultDeserializers', () => {
        expect(defaultDeserializers.length).toBeGreaterThan(0);
    });
});
