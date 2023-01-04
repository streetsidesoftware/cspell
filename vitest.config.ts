import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // reporters: 'verbose',
        coverage: {
            // enabled: true,
            clean: true,
            all: true,
            reporter: ['html', 'text', 'lcov', 'json'],
            exclude: [
                'bin.mjs',
                'bin.js',
                'bin.cjs',
                '_snapshots_',
                '.eslint*',
                'vitest*',
                '.prettier*',
                '**/*.test.*',
            ],
        },
    },
});
