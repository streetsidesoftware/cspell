import pluginTypescriptParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginCSpell from '@cspell/eslint-plugin';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

/**
 * @type { import("eslint").Linter.FlatConfig[] }
 */
const config = [
    js.configs.recommended,
    pluginCSpell.configs.recommended,
    // pluginImport.configs.errors,
    // pluginImport.configs.warnings,
    ...compat.extends('plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'),
    eslintConfigPrettier,
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/*.d.ts', '**/*.map', '**/coverage/**', '**/dist/**', '**/node_modules/**'],
        languageOptions: {
            parser: pluginTypescriptParser,
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
        },
    },
];

export default config;
