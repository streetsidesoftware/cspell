export type { AffInfo, AffWord } from './affDef.js';
export { parseAff, parseAffFile as readAffFile } from './affReader.js';
export {
    createMatchingWordsFilter,
    type HunspellSrcData,
    IterableHunspellReader,
    type WordInfo,
} from './IterableHunspellReader.js';
export { IterableHunspellReader as HunspellReader } from './IterableHunspellReader.js';
export { uniqueFilter } from './util.js';
