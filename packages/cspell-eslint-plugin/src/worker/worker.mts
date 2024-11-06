import type { Node } from 'estree';
import { runAsWorker } from 'synckit';

import type { WorkerOptions } from '../common/options.cjs';
import type { spellCheck } from './spellCheck.mjs';
import type { SpellCheckResults } from './types.mjs';

let spellChecker: { spellCheck: typeof spellCheck } | undefined;

runAsWorker(async (filename: string, text: string, root: Node, options: WorkerOptions): Promise<SpellCheckResults> => {
    if (!spellChecker) {
        spellChecker = await import('./spellCheck.mjs');
    }

    return spellChecker.spellCheck(filename, text, root, options);
});
