import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
    nodePlugin.configs['flat/recommended'],
    {
        rules: {
            'n/exports-style': ['error', 'module.exports'],
            'n/no-extraneous-import': 'error',
            'n/no-unpublished-import': [
                'error',
                {
                    ignoreTypeImport: true,
                },
            ],
        },
    },
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    {
        ignores: [
            '**/[Ss]amples/**', // cspell:disable-line
            '**/[Tt]emp/**',
            '**/.temp/**',
            '**/*.d.ts',
            '**/*.d.cts',
            '**/*.d.mts',
            '**/src/lib*/*.cjs',
            '**/*.map',
            '**/coverage/**',
            '**/cspell-default.config.js',
            '**/dist/**',
            '**/dist.*/**',
            'tools/*/lib/**',
            '**/node_modules/**',
            '**/.docusaurus/**',
            'docs/_site/**',
            'docs/docsV2/**',
            'docs/types/cspell-types/**',
            'integration-tests/repositories/**',
            'packages/*/fixtures/**',
            'packages/*/esm/**',
            'test-fixtures/**',
            'test-packages/cspell-eslint-plugin/**',
            'test-packages/yarn/**',
            'website',
            '**/lib-bundled/**',
            'website/**', // checked with a different config

            // Ignore cspell-eslint-plugin
            'fixtures/**',
        ],
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        files: ['**/*.ts', '**/*.mts', '**/*.cts'],
        rules: {
            'no-restricted-modules': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            // This is caught by 'import/no-unresolved'
            'node/no-missing-import': [
                'off',
                {
                    tryExtensions: ['.js', '.d.ts', '.ts'],
                },
            ],
            'node/no-unsupported-features/es-syntax': 'off',
            // 'import/no-unresolved': 'off',
            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },
    {
        files: ['**/*.ts', '**/*.mts', '**/*.cts'],
        rules: {
            'node/no-missing-import': [
                'off',
                {
                    tryExtensions: ['.js', '.d.ts', '.ts'],
                },
            ],
            'node/no-unsupported-features/es-syntax': 'off',
            'import/no-unresolved': 'off',
        },
    },
    {
        files: ['packages/cspell-pipe/**/*.ts'],
        rules: {
            'import/extensions': ['error', 'ignorePackages'],
        },
    },
    {
        files: ['**/*.js', '**/*.mjs'],
        rules: {
            'node/no-unsupported-features/es-syntax': 'off',
        },
    },
    {
        files: [
            'vitest.config.*',
            '**/*.test.*',
            '**/test.*',
            '**/rollup.*',
            '**/*.spec.*',
            '**/test-helpers/**',
            '**/test-utils/**',
            '**/src/test/**',
            '**/src/perf/**',
        ],
        rules: {
            'node/no-extraneous-import': 'off',
            'node/no-extraneous-require': 'off',
            'node/no-unpublished-import': 'off',
        },
    },
);
