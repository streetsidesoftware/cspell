import { describe, expect, test } from 'vitest';

import * as index from './index.js';

describe('Validate that the types build', () => {
    test('MessageTypes should be exported.', () => {
        expect(index).toHaveProperty('MessageTypes');
    });
    test('Make sure exports do not change.', () => {
        expect(Object.keys(index).sort()).toMatchSnapshot();
    });
});
