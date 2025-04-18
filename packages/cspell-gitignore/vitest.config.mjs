import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../../vitest.config.mjs';

// @ts-check

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            include: ['src/**/*.test.{ts,mts}'],
            exclude: ['content/**', 'fixtures/**', 'bin.mjs', '_snapshots_'],
            root: __dirname,
            testTimeout: 10_000,
        },
    }),
);
