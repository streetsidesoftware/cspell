import { describe, expect, test } from 'vitest';

import * as index from './index.js';

describe('Validate index loads', () => {
    test('the modules is ok', () => {
        expect(index).toBeDefined();
        expect(index.GlobMatcher).toBeDefined();
        expect(typeof index.fileOrGlobToGlob).toBe('function');
    });

    test('API', () => {
        expect(index).toMatchSnapshot();
    });
});
