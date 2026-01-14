import type { spellCheckDocument } from 'cspell-lib';

export interface CSpellWorkerAPI {
    spellCheckDocument: typeof spellCheckDocument;
}
