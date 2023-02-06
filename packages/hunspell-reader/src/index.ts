export type { AffInfo, AffWord } from './affDef';
export { parseAff, parseAffFile as readAffFile } from './affReader';
export {
    createMatchingWordsFilter,
    type HunspellSrcData,
    IterableHunspellReader,
    type WordInfo,
} from './IterableHunspellReader';
export { IterableHunspellReader as HunspellReader } from './IterableHunspellReader';
