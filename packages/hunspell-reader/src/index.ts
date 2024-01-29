export type { AffInfo, AffWord } from './affDef.js';
export { parseAff, parseAffFile as readAffFile } from './affReader.js';
export {
    createMatchingWordsFilter,
    type HunspellSrcData,
    IterableHunspellReaderLegacy,
    type WordInfo,
} from './IterableHunspellReaderLegacy.js';
export { IterableHunspellReaderLegacy as HunspellReader } from './IterableHunspellReaderLegacy.js';
export { uniqueFilter } from './util.js';
