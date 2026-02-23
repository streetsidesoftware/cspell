import cspellConfigs from '@cspell/eslint-plugin/configs';
import cspellRecommended from '@cspell/eslint-plugin/recommended';
import eslint from '@eslint/js';

// @ts-check

const config = [
    eslint.configs.recommended,
    // cspellRecommended or cspellConfigs.recommended can be used interchangeably.
    cspellConfigs.recommended,
    {
        ignores: ['**/node_modules/**', '**/*.ts', '**/*.tsx'],
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        ignores: ['**/*.d.ts', '**/*.map', '**/coverage/**', '**/dist/**', '**/node_modules/**'],
        rules: {
            '@cspell/spellchecker': ['warn', { customWordListFile: 'words.txt', autoFix: true }],
        },
    },
    {
        files: ['**/*.js'],
        plugins: cspellRecommended.plugins,
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-undef': 'off',
            '@cspell/spellchecker': ['warn', { checkIdentifiers: false }],
        },
    },
    {
        files: ['**/*.tsx'],
        rules: {
            '@cspell/spellchecker': ['warn', { checkIdentifiers: true }],
        },
    },
];

export default config;
