/* eslint-disable n/no-unsupported-features/node-builtins */
import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../../vitest.config.mjs';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            include: ['src/**/*.test.{ts,mts}'],
            exclude: ['content/**', 'fixtures/**', 'bin.mjs', '_snapshots_'],
            root: import.meta.dirname,
            testTimeout: 10_000,
        },
    }),
);
