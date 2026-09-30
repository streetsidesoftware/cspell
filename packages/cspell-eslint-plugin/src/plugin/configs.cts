import type { Linter } from 'eslint';

import { plugin } from './cspell-eslint-plugin.cjs';
import { plugins, rules } from './recommended.cjs';

export const recommended: Linter.Config = { plugins, rules };

export const debug: Linter.Config = {
    plugins: {
        '@cspell': plugin,
    },
    rules: {
        '@cspell/spellchecker': ['warn', { debugMode: true }],
    },
};
