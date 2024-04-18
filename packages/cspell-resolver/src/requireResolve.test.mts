import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { requireResolve } from './requireResolve.js';
import { resolveGlobal } from './resolveGlobal.mjs';

describe('requireResolve', () => {
    test('requireResolve', () => {
        expect(requireResolve('./' + path.basename(__filename))).toEqual(__filename);
    });

    test('resolveGlobal not found', () => {
        expect(resolveGlobal('not-found-module')).toBeUndefined();
    });
});
