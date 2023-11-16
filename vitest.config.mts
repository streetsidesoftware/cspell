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
                'ajv.config.*',
                'bin.mjs',
                'bin.js',
                'bin.cjs',
                '.coverage/**',
                'coverage',
                '_snapshots_',
                '.eslint*',
                'vitest*',
                '.prettier*',
                '**/*.test.*',
                '**/*.d.ts',
                '**/*.d.cts',
                '**/*.d.mts',
            ],
        },
    },
});
