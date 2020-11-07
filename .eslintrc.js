/**
 * @type { import("eslint").Linter.Config }
 */
const config = {
    env: {
        es2020: true,
        node: true,
    },
    extends: [ 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended' ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
    },
    plugins: [ '@typescript-eslint' ],
    rules: {
        'no-unused-vars': [ 'error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' } ],
        '@typescript-eslint/no-unused-vars': [ 'warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' } ],
    },
    ignorePatterns: [
        '.eslintrc.js',
        'packages/*/dist',
        'packages/*/temp',
        'packages/*/Temp',
        '**/samples',
        '**/Samples',
        'integration-tests/repositories',
        'integration-tests/dist',
    ],
    overrides: [
        {
            files: '**/*.test.{ts,js}',
            env: {
                jest: true,
            },
        },
    ],
};

module.exports = config;
