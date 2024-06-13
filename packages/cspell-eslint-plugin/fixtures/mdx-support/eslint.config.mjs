import eslint from '@eslint/js';
import cspellRecommended from '@cspell/eslint-plugin/recommended';
import * as mdx from 'eslint-plugin-mdx';

/**
 * @type { import("eslint").Linter.FlatConfig[] }
 */
const config = [
    eslint.configs.recommended,
    cspellRecommended,
    mdx.configs.flat,
    {
        ignores: ['eslint.config.mjs'],
    },
    {
        files: ['**/*.mdx', '**/*.md'],
        rules: {
            '@cspell/spellchecker': ['warn', { debugMode: true }],
        },
    },
];

export default config;
