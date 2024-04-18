import cspellConfigs from '@cspell/eslint-plugin/configs';
import cspellRecommended from '@cspell/eslint-plugin/recommended';
import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsEslint from 'typescript-eslint';

// @ts-check

const config = tsEslint.config(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    ...tsEslint.configs.recommended,
    // cspellRecommended or cspellConfigs.recommended can be used interchangeably.
    cspellConfigs.recommended,
    {
        ignores: ['**/node_modules/**', '**/*.d.ts'],
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
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/*.d.ts', '**/*.map', '**/coverage/**', '**/dist/**', '**/node_modules/**'],
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@cspell/spellchecker': ['warn', { customWordListFile: 'words.txt', autoFix: true }],
        },
    },
    {
        files: ['**/*.js'],
        plugins: cspellRecommended.plugins,
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-undef': 'warn',
            '@cspell/spellchecker': ['warn', { checkIdentifiers: false }],
        },
    },
    {
        files: ['**/*.tsx'],
        rules: {
            '@cspell/spellchecker': ['warn', { checkIdentifiers: true }],
        },
    },
    {
        files: ['fixtures/**'],
        rules: {
            'n/no-missing-import': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            'simple-import-sort/imports': 'warn',
        },
    },
);

export default config;
