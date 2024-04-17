// @ts-check

import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsEslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';

// mimic CommonJS variables -- not needed if using CommonJS
// import { FlatCompat } from "@eslint/eslintrc";
// const __dirname = fileURLToPath(new URL('.', import.meta.url));
// const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: eslint.configs.recommended});

export default tsEslint.config(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    eslintPluginPrettierRecommended,
    ...tsEslint.configs.recommended,
    // unicorn.configs['flat/recommended'],
    {
        plugins: {
            unicorn,
        },
        rules: {
            // Disable these rules
            'unicorn/catch-error-name': 'off',
            'unicorn/consistent-function-scoping': 'off',
            'unicorn/filename-case': 'off',
            'unicorn/import-style': 'off',
            'unicorn/no-array-callback-reference': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/explicit-length-check': 'off',
            'unicorn/no-nested-ternary': 'off',
            'unicorn/no-await-expression-member': 'off',

            // Maybe later
            'unicorn/no-array-for-each': 'off',
            'unicorn/prefer-at': 'off',
            'unicorn/no-for-loop': 'off',
            'unicorn/new-for-builtins': 'off',

            // Enable these rules to help with on boarding eslint.
            'unicorn/prefer-module': 'error',
            'unicorn/prefer-node-protocol': 'error',
            // 'unicorn/numeric-separators-style': 'error',
            // 'unicorn/prefer-string-replace-all': 'error',
            // 'unicorn/prefer-spread': 'error',
            // 'unicorn/prefer-array-flat': 'error',
            // 'unicorn/no-instanceof-array': 'error',
            // 'unicorn/better-regex': 'error',
        },
    },
    {
        ignores: [
            '.github/**/*.yaml',
            '.github/**/*.yml',
            '**/__snapshots__/**',
            '**/.docusaurus/**',
            '**/.temp/**',
            '**/.yarn/**',
            '**/[Ss]amples/**', // cspell:disable-line
            '**/[Tt]emp/**',
            '**/*.d.cts',
            '**/*.d.mts',
            '**/*.d.ts',
            '**/*.map',
            '**/build/**',
            '**/coverage/**',
            '**/cspell-default.config.js',
            '**/dist.*/**',
            '**/dist/**',
            '**/fixtures/**',
            '**/lib-bundled/**',
            '**/node_modules/**',
            '**/src/**/*.cjs',
            '**/temp/**',
            '**/webpack*.js',
            'docs/_site/**',
            'docs/docsV2/**',
            'docs/types/cspell-types/**',
            'integration-tests/repositories/**',
            'package-lock.json',
            'packages/*/dist/**',
            'packages/*/esm/**',
            'packages/*/fixtures/**',
            'packages/*/out/**',
            'packages/client/server/**',
            'test-fixtures/**',
            'test-packages/cspell-eslint-plugin/**',
            'test-packages/yarn/**',
            'tools/*/lib/**',
            'website',
            'website/**', // checked with a different config
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
        files: ['**/*.{ts,cts,mts,tsx,js,mjs,cjs}'],
        rules: {
            // Note: you must disable the base rule as it can report incorrect errors
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            'n/no-missing-import': [
                'off', // disabled because it is not working correctly
                {
                    tryExtensions: ['.d.ts', '.d.mts', '.d.cts', '.ts', '.cts', '.mts', '.js', '.cjs', '.mjs'],
                },
            ],
        },
    },
    {
        files: ['**/*.cts', '**/*.cjs'],
        rules: {
            'unicorn/prefer-module': 'off',
        },
    },
    {
        files: ['**/*.test.*', '**/__mocks__/**', '**/test/**', '**/test.*', '**/rollup.config.mjs', '**/build.mjs'],
        rules: {
            'n/no-extraneous-require': 'off', // Mostly for __mocks__ and test files
            'n/no-extraneous-import': 'off',
            'n/no-unpublished-import': 'off',
            '@typescript-eslint/no-explicit-any': 'off', // any is allowed in tests
            'unicorn/no-null': 'off', // null is allowed in tests
            'unicorn/prefer-module': 'off', // require.resolve is allowed in tests
        },
    },
    {
        files: ['**/vitest.config.*', '**/jest.config.*', '**/__mocks__/**'],
        rules: {
            'n/no-extraneous-require': 'off',
            'n/no-extraneous-import': 'off',
            'no-undef': 'off',
        },
    },
);
