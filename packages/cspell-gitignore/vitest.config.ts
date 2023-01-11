import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../../vitest.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            include: ['src/**/*.test.{ts,mts}'],
            exclude: ['content/**', 'fixtures/**', 'bin.mjs', '_snapshots_'],
            root: __dirname,
        },
    })
);
