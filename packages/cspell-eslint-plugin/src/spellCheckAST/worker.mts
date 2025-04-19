import { runAsWorker } from 'synckit';

import type { WorkerOptions } from '../common/options.cjs';
import type { CheckTextRange, spellCheck, SpellCheckResults } from './spellCheck.mjs';

let spellChecker: { spellCheck: typeof spellCheck } | undefined;

runAsWorker(
    async (
        filename: string,
        text: string,
        ranges: CheckTextRange[],
        options: WorkerOptions,
    ): Promise<SpellCheckResults> => {
        if (!spellChecker) {
            spellChecker = await import('./spellCheck.mjs');
        }

        return spellChecker.spellCheck(filename, text, ranges, options);
    },
);
