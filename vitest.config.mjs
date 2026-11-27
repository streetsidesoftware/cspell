import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const defaultConfig = {
    test: {
        chaiConfig: {
            truncateThreshold: 80,
        },
        // cspell:ignore tsup
        exclude: [
            '**/temp/**',
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        ],
        // reporters: 'verbose',
        coverage: {
            // enabled: true,
            provider: 'istanbul',
            clean: true,
            all: true,
            reportsDirectory: 'coverage',
            reporter: ['html', 'json', ['lcov', { projectRoot: __dirname }], 'text'],
            exclude: [
                '**/node_modules/**',
                '_snapshots_',
                '.coverage/**',
                '.eslint*',
                '.prettier*',
                '**/*.d.cts',
                '**/*.d.mts',
                '**/*.d.ts',
                '**/*.test.*',
                '**/*.config.*',
                '**/fixtures/**',
                '**/perf/**',
                '**/*.perf.*',
                '**/samples/**',
                '**/test*/**',
                '**/test.*',
                'ajv.config.*',
                'bin.cjs',
                'bin.js',
                'bin.mjs',
                'coverage',
                'vitest*',
            ],
        },
    },
    server: {
        watch: {
            // Tests write files in `temp`. A `package.json` written there would rerun every test file.
            ignored: ['**/temp/**'],
        },
    },
};

export default defineConfig(defaultConfig);
