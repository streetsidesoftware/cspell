/**
 * @type { import("eslint").Linter.Config }
 */
const config = {
    root: true,
    reportUnusedDisableDirectives: true,
    env: {
        es2020: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:node/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:promise/recommended',
        'plugin:prettier/recommended',
        // 'plugin:unicorn/recommended',
    ],
    ignorePatterns: [
        '**/[Ss]amples/**', // cspell:disable-line
        '**/[Tt]emp/**',
        '**/*.d.ts',
        '**/*.map',
        '**/coverage/**',
        '**/cspell-default.config.js',
        '**/dist/**',
        '**/node_modules/**',
        '**/.docusaurus/**',
        'docs/_site/**',
        'docs/docsV2/**',
        'integration-tests/repositories/**',
        'packages/*/fixtures/**',
        'test-fixtures/**',
        'test-packages/*/test-cspell-eslint-plugin',
        'test-packages/*/test-cspell-eslint-plugin/**',
        'test-packages/yarn/**',
        'website',
        'website/**', // checked with a different config
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['import', 'unicorn'],
    overrides: [
        {
            files: '**/*.ts',
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
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
                'node/no-unsupported-features/es-syntax': [
                    'error',
                    {
                        ignores: ['modules'],
                    },
                ],
                'import/no-unresolved': 'off',
            },
        },
        {
            files: ['**/*.test.ts', '**/*.spec.ts'],
            excludedFiles: ['**/cspell-gitignore/**'],
            extends: 'plugin:jest/recommended',
            env: {
                jest: true,
            },
            rules: {
                'jest/valid-title': 'warn',
            },
        },
        {
            files: ['vitest.config.*', '**/*.test.*'],
            rules: {
                'node/no-unpublished-import': 'off',
            },
        },
        {
            files: ['packages/cspell-pipe/**/*.ts'],
            extends: ['plugin:unicorn/recommended'],
            rules: {
                'unicorn/prefer-module': 'error',
                'import/extensions': ['error', 'ignorePackages'],
                'unicorn/prevent-abbreviations': 'off',
                'unicorn/consistent-function-scoping': 'off',
                'unicorn/filename-case': 'off',
            },
        },
    ],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        // 'import/resolver': {
        //     typescript: {
        //         alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code

        //         // use an array of glob patterns
        //         project: ['packages/*/tsconfig.json', 'integration-tests/tsconfig.json'],
        //     },
        // },
    },
    rules: {
        // turn on errors for missing imports
        // 'import/no-unresolved': 'error',
    },
};

module.exports = config;
