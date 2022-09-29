export * from './SpellingDictionary';
import { createCollection } from './SpellingDictionaryCollection';

import {
    createFailedToLoadDictionary,
    createForbiddenWordsDictionary,
    createIgnoreWordsDictionary,
    createSpellingDictionary,
} from './createSpellingDictionary';

export const SpellingDictionaryLibOld = {
    createCollection,
    createFailedToLoadDictionary,
    createForbiddenWordsDictionary,
    createIgnoreWordsDictionary,
    createSpellingDictionary,
} as const;
