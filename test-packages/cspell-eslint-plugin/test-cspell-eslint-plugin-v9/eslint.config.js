import js from '@eslint/js';
import cspellRecommended from '@cspell/eslint-plugin/recommended';
import cspellConfigs from '@cspell/eslint-plugin/configs';
import tsESLint from 'typescript-eslint';

/**
 * @type { import("eslint").Linter.FlatConfig[] }
 */
const config = [
    js.configs.recommended,
    ...tsESLint.configs.recommended,
    // cspellRecommended or cspellConfigs.recommended can be used interchangeably.
    cspellConfigs.recommended,

    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/*.d.ts', '**/*.map', '**/coverage/**', '**/dist/**', '**/node_modules/**'],
        languageOptions: {
            parser: tsESLint.parser,
            ecmaVersion: 2022,
            sourceType: 'module',
        },
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
];

export default config;
