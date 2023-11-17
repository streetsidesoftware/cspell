import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // exclude: ['temp', 'node_modules', 'dist'],
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
