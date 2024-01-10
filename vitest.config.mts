import { defineConfig } from 'vitest/config';

export default defineConfig({
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
        watchExclude: ['**/node_modules/**', '**/dist/**', '**/.temp/**', '**/temp/**', '**/coverage/**'],
        coverage: {
            // enabled: true,
            provider: 'istanbul',
            clean: true,
            all: true,
            reportsDirectory: 'coverage',
            reporter: ['html', 'json', ['lcov', { projectRoot: __dirname }], 'text'],
            exclude: [
                '_snapshots_',
                '.coverage/**',
                '.eslint*',
                '.prettier*',
                '**/*.d.cts',
                '**/*.d.mts',
                '**/*.d.ts',
                '**/*.test.*',
                '**/fixtures/**',
                '**/samples/**',
                '**/test-*/**',
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
});
