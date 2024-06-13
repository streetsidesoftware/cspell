// @ts-check
import eslint from '@eslint/js';
import cspellRecommended from '@cspell/eslint-plugin/recommended';
import eslintPluginJsonc from 'eslint-plugin-jsonc';

/**
 * @type { import("eslint").Linter.FlatConfig[] }
 */
const config = [
    eslint.configs.recommended,
    cspellRecommended,
    ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
    {
        ignores: ['eslint.config.mjs'],
    },
    {
        files: ['**/*.json', '**/*.jsonc'],
        rules: {
            '@cspell/spellchecker': ['warn', { debugMode: true }],
        },
    },
];

export default config;
