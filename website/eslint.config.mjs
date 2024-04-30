import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tsEslint from 'typescript-eslint';

// import simpleImportSort from 'eslint-plugin-simple-import-sort';
// import unicorn from 'eslint-plugin-unicorn';

// @ts-check

export default tsEslint.config(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    eslintPluginPrettierRecommended,
    ...tsEslint.configs.recommended,
    {
        ignores: [
            '**/[Ss]amples/**', // cspell:disable-line
            '**/[Tt]emp/**',
            '**/*.d.ts',
            '**/*.map',
            '**/coverage/**',
            '**/dist/**',
            '**/build/**',
            '**/node_modules/**',
            '**/.docusaurus/**',
        ],
    },
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'n/no-missing-import': [
                'warn',
                {
                    allowModules: ['@docusaurus/plugin-content-docs'],
                    // resolvePaths: ['/path/to/a/modules/directory'],
                },
            ],
        },
    },
    {
        files: ['**/*.tsx'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'n/no-missing-import': [
                'warn',
                {
                    allowModules: [
                        '@docusaurus/Link',
                        '@docusaurus/plugin-content-docs',
                        '@docusaurus/useDocusaurusContext',
                        '@theme/Heading',
                        '@theme/Layout',
                    ],
                },
            ],
            'n/no-missing-require': 'warn',
        },
    },
    {
        files: ['eslint.config.mjs', 'docusaurus.config.ts'],
        rules: {
            'n/no-extraneous-import': 'off',
            'n/no-missing-import': 'off',
        },
    },
);
