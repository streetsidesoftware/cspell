import { fileURLToPath } from 'node:url';

import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../../vitest.config.mjs';

// @ts-check

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            coverage: {
                // enabled: true,
                provider: 'istanbul',
                clean: true,
                all: true,
                reportsDirectory: 'coverage',
                reporter: ['html', 'text', 'json'],
                exclude: [
                    '_snapshots_',
                    '.coverage/**',
                    '.eslint*',
                    '.prettier*',
                    '**/*.cts',
                    '**/*.test.*',
                    'ajv.config.*',
                    'bin.cjs',
                    'bin.mjs',
                    'coverage',
                    'dist/**',
                    'esm/**',
                    'tools/**',
                    'fixtures/**',
                    'lib/**',
                    'vitest*',
                ],
            },
            include: ['src/**/*.test.{ts,mts}'],
            exclude: ['content/**', 'fixtures/**', 'bin.mjs', '_snapshots_'],
            root: __dirname,
            testTimeout: 10_000,
        },
    }),
);
