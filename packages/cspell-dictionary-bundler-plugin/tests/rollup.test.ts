/* eslint-disable n/no-unsupported-features/node-builtins */
import path from 'node:path';

import { rollupBuild, testFixtures } from '@sxzz/test-utils';
import { describe } from 'vitest';

import InlineCSpellConfig from '../src/rollup.ts';

describe('rollup', async () => {
    const { dirname } = import.meta;
    await testFixtures(
        '*.js',
        async (_args, id) => {
            const { snapshot } = await rollupBuild(id, [InlineCSpellConfig()]);
            return snapshot;
        },
        { cwd: path.resolve(dirname, 'fixtures'), promise: true },
    );
});
