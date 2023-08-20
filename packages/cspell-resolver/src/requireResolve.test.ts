import * as path from 'path';
import { describe, expect, test } from 'vitest';

import { requireResolve, resolveGlobal } from './requireResolve.js';

describe('requireResolve', () => {
    test('requireResolve', () => {
        expect(requireResolve('./' + path.basename(__filename))).toEqual(__filename);
    });

    test('resolveGlobal not found', () => {
        expect(resolveGlobal('not-found-module')).toBeUndefined();
    });
});
