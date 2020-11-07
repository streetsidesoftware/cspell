/**
 * @type { import("eslint").Linter.Config }
 */
const config = {
    env: {
        es2020: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
    },
    overrides: [
        {
            files: '**/*.ts',
            extends: 'plugin:@typescript-eslint/recommended',
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            rules: {
                'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
                '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            },
        },
        {
            files: '**/*.test.{ts,js}',
            env: {
                jest: true,
            },
        },
    ],
};

module.exports = config;
