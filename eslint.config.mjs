import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import tsEslint from 'typescript-eslint';

// mimic CommonJS variables -- not needed if using CommonJS
// import { FlatCompat } from "@eslint/eslintrc";
// const __dirname = fileURLToPath(new URL('.', import.meta.url));
// const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: eslint.configs.recommended});

// @ts-check

export default tsEslint.config(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
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
            'unicorn/explicit-length-check': 'off',
            'unicorn/filename-case': 'off',
            'unicorn/import-style': 'off',
            'unicorn/no-array-callback-reference': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/no-await-expression-member': 'off',
            'unicorn/no-nested-ternary': 'off',
            'unicorn/no-new-array': 'off', // new Array(size) is 10x faster than Array.from({length: size})
            'unicorn/no-useless-spread': 'off', // makes dangerous fixes
            'unicorn/no-useless-undefined': 'off', // Breaks return types and other things
            'unicorn/no-zero-fractions': 'off',
            'unicorn/number-literal-case': 'off', // doesn't fix anything, might conflict with other rules.
            'unicorn/prefer-event-target': 'off', // It is broken
            'unicorn/prefer-logical-operator-over-ternary': 'off', // single line ternary is fine
            'unicorn/prefer-math-trunc': 'off', // incorrectly sets Enums.
            'unicorn/prefer-native-coercion-functions': 'off', // Makes some strange choices
            'unicorn/prefer-string-slice': 'off', // substring is used where it make the most sense.
            'unicorn/prefer-top-level-await': 'off', // it will be possible to require a module that does not use top level await.
            'unicorn/prevent-abbreviations': 'off',

            // Maybe later
            'unicorn/better-regex': 'off', // Not sure if it is an improvement.
            'unicorn/new-for-builtins': 'off',
            'unicorn/no-array-for-each': 'off',
            'unicorn/no-array-method-this-argument': 'off', // Too many false positives
            'unicorn/no-for-loop': 'off',
            'unicorn/no-negated-condition': 'off', // Too picky - works against implying the most common branch.
            'unicorn/prefer-at': 'off',

            // Enable these rules to help with on boarding eslint.
            'unicorn/numeric-separators-style': [
                'error',
                {
                    hexadecimal: {
                        minimumDigits: 5,
                        groupLength: 4,
                    },
                },
            ],
            'unicorn/empty-brace-spaces': 'error',
            'unicorn/error-message': 'error',
            'unicorn/escape-case': 'error',
            'unicorn/expiring-todo-comments': 'error',
            'unicorn/no-abusive-eslint-disable': 'error',
            'unicorn/no-anonymous-default-export': 'error',
            'unicorn/no-array-push-push': 'error', // This isn't really a problem
            'unicorn/no-await-in-promise-methods': 'error',
            'unicorn/no-console-spaces': 'error',
            'unicorn/no-document-cookie': 'error',
            'unicorn/no-empty-file': 'error',
            'unicorn/no-hex-escape': 'error',
            'unicorn/no-instanceof-array': 'error',
            'unicorn/no-invalid-remove-event-listener': 'error',
            'unicorn/no-lonely-if': 'error',
            'unicorn/no-new-buffer': 'error',
            'unicorn/no-null': 'error',
            'unicorn/no-object-as-default-parameter': 'error',
            'unicorn/no-process-exit': 'error',
            'unicorn/no-single-promise-in-promise-methods': 'error',
            'unicorn/no-static-only-class': 'error',
            'unicorn/no-thenable': 'error',
            'unicorn/no-this-assignment': 'error',
            'unicorn/no-typeof-undefined': 'error',
            'unicorn/no-unnecessary-await': 'error',
            'unicorn/no-unnecessary-polyfills': 'error',
            'unicorn/no-unreadable-array-destructuring': 'error',
            'unicorn/no-unreadable-iife': 'error',
            'unicorn/no-useless-fallback-in-spread': 'error',
            'unicorn/no-useless-length-check': 'error',
            'unicorn/no-useless-promise-resolve-reject': 'error',
            'unicorn/no-useless-switch-case': 'error',
            'unicorn/prefer-add-event-listener': 'error',
            'unicorn/prefer-array-find': 'error',
            'unicorn/prefer-array-flat-map': 'error',
            'unicorn/prefer-array-flat': 'error',
            'unicorn/prefer-array-index-of': 'error',
            'unicorn/prefer-array-some': 'error',
            'unicorn/prefer-blob-reading-methods': 'error',
            'unicorn/prefer-code-point': 'error',
            'unicorn/prefer-date-now': 'error',
            'unicorn/prefer-default-parameters': 'error',
            'unicorn/prefer-dom-node-append': 'error',
            'unicorn/prefer-dom-node-dataset': 'error',
            'unicorn/prefer-dom-node-remove': 'error',
            'unicorn/prefer-dom-node-text-content': 'error',
            'unicorn/prefer-export-from': 'error',
            'unicorn/prefer-includes': 'error',
            'unicorn/prefer-keyboard-event-key': 'error',
            'unicorn/prefer-modern-dom-apis': 'error',
            'unicorn/prefer-modern-math-apis': 'error',
            'unicorn/prefer-module': 'error',
            'unicorn/prefer-negative-index': 'error',
            'unicorn/prefer-node-protocol': 'error',
            'unicorn/prefer-number-properties': 'error',
            'unicorn/prefer-object-from-entries': 'error',
            'unicorn/prefer-optional-catch-binding': 'error',
            'unicorn/prefer-prototype-methods': 'error',
            'unicorn/prefer-query-selector': 'error',
            'unicorn/prefer-reflect-apply': 'error',
            'unicorn/prefer-regexp-test': 'error',
            'unicorn/prefer-set-has': 'error',
            'unicorn/prefer-set-size': 'error',
            'unicorn/prefer-spread': 'error',
            'unicorn/prefer-string-replace-all': 'error',
            'unicorn/prefer-string-starts-ends-with': 'error',
            'unicorn/prefer-string-trim-start-end': 'error',
            'unicorn/prefer-switch': 'error',
            'unicorn/prefer-ternary': 'error',
            'unicorn/prefer-type-error': 'error',
            'unicorn/relative-url-style': 'error',
            'unicorn/require-array-join-separator': 'error',
            'unicorn/require-number-to-fixed-digits-argument': 'error',
            'unicorn/switch-case-braces': 'error',
            'unicorn/template-indent': 'error',
            'unicorn/text-encoding-identifier-case': 'error',
            'unicorn/throw-new-error': 'error',

            // To be evaluated
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
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    {
        files: [
            '**/__mocks__/**',
            '**/*.spec.*',
            '**/*.test.*',
            '**/build.mjs',
            '**/rollup.config.mjs',
            '**/perf/**',
            '**/*.perf.*',
            '**/test.*',
            '**/test-*',
            '**/test*/**',
        ],
        rules: {
            'n/no-extraneous-require': 'off', // Mostly for __mocks__ and test files
            'n/no-extraneous-import': 'off',
            'n/no-unpublished-import': 'off',
            '@typescript-eslint/no-explicit-any': 'off', // any is allowed in tests
            'unicorn/no-null': 'off', // null is allowed in tests
            'unicorn/prefer-module': 'off', // require.resolve is allowed in tests
            'unicorn/error-message': 'off',
            'unicorn/no-useless-undefined': 'off', // undefined is allowed in tests
        },
    },
    {
        files: ['**/vitest.config.*', '**/jest.config.*', '**/__mocks__/**'],
        rules: {
            'n/no-extraneous-require': 'off',
            'n/no-extraneous-import': 'off',
            'no-undef': 'off',
            'unicorn/prefer-module': 'off',
        },
    },
);
