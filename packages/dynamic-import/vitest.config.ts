import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../../vitest.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            include: ['src/**/*.test.{ts,mts}'],
            exclude: ['content/**', 'fixtures/**', 't.mjs', '_snapshots_'],
            root: __dirname,
            coverage: {
                all: false,
                exclude: ['fixtures', 'test', 'test.cjs.mts'],
            },
            testTimeout: 10000,
        },
    }),
);
