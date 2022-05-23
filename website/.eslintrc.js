/**
 * @type { import("eslint").Linter.Config }
 */
const config = {
    root: true,
    env: {
        es2020: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        // 'plugin:node/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:promise/recommended',
        'plugin:prettier/recommended',
    ],
    ignorePatterns: [
        '**/[Ss]amples/**', // cspell:disable-line
        '**/[Tt]emp/**',
        '**/*.d.ts',
        '**/*.map',
        '**/coverage/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/.docusaurus/**',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    overrides: [
        {
            files: '**/*.ts',
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            rules: {
                '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
                'node/no-missing-import': [
                    'error',
                    {
                        tryExtensions: ['.js', '.d.ts', '.ts', '.tsx'],
                    },
                ],
            },
        },
        {
            files: '**/*.tsx',
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            rules: {
                '@typescript-eslint/no-var-requires': 'warn',
                '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
                'import/no-unresolved': [2, { ignore: ['^@theme', '^@docusaurus', '^@site'] }],
            },
        },
        {
            files: ['**/*.test.ts', '**/*.spec.ts'],
            extends: 'plugin:jest/recommended',
            env: {
                jest: true,
            },
        },
    ],
};

module.exports = config;
