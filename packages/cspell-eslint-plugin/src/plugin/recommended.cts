import type { Linter } from 'eslint';

import { plugin } from './cspell-eslint-plugin.cjs';

const config: Linter.FlatConfig = {
    plugins: {
        '@cspell': plugin,
    },
    rules: {
        '@cspell/spellchecker': ['warn', {}],
    },
};

export const plugins = config.plugins;
export const rules = config.rules;
