import tsEslint from 'typescript-eslint';
import js from '@eslint/js';
import cspellPlugin from '@cspell/eslint-plugin';

/**
 * @type { import("eslint").Linter.FlatConfig[] }
 */
const config = [
    js.configs.recommended,
    {
        plugins: { '@cspell': cspellPlugin, '@typescript-eslint': tsEslint.plugin },
        rules: {
            '@cspell/spellchecker': ['warn', { checkIdentifiers: true }],
        },
    },
    ...tsEslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/*.d.ts', '**/*.map', '**/coverage/**', '**/dist/**', '**/node_modules/**'],
        languageOptions: {
            parser: tsEslint.parser,
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
