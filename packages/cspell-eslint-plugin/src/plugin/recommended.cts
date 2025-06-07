import type { Linter } from 'eslint';

import { plugin } from './cspell-eslint-plugin.cjs';

const config: Linter.Config = {
    plugins: {
        '@cspell': plugin,
    },
    rules: {
        '@cspell/spellchecker': ['warn', {}],
    },
};

export const plugins: Linter.Config['plugins'] = config.plugins;
export const rules: Linter.Config['rules'] = config.rules;
