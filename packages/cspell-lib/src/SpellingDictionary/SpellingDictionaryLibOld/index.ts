export * from './SpellingDictionary';
import { createCollection } from './SpellingDictionaryCollection';

import {
    createSpellingDictionary,
    createFailedToLoadDictionary,
    createForbiddenWordsDictionary,
} from './createSpellingDictionary';

export const SpellingDictionaryLibOld = {
    createCollection,
    createFailedToLoadDictionary,
    createForbiddenWordsDictionary,
    createSpellingDictionary,
} as const;
