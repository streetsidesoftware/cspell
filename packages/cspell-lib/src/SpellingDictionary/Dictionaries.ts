import type { CSpellUserSettings, DictionaryDefinitionPreferred } from '@cspell/cspell-types';
import { calcDictionaryDefsToLoad } from '../Settings/DictionarySettings';
import { createForbiddenWordsDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { loadDictionary, refreshCacheEntries } from './DictionaryLoader';
import { SpellingDictionaryCollection } from './index';
import { SpellingDictionary } from './SpellingDictionary';
import { createCollectionP } from './SpellingDictionaryCollection';

export function loadDictionaryDefs(defsToLoad: DictionaryDefinitionPreferred[]): Promise<SpellingDictionary>[] {
    return defsToLoad.map((def) => loadDictionary(def.path, def));
}

export function refreshDictionaryCache(maxAge?: number): Promise<void> {
    return refreshCacheEntries(maxAge);
}

export function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection> {
    const { words = [], userWords = [], flagWords = [], ignoreWords = [] } = settings;
    const spellDictionaries = loadDictionaryDefs(calcDictionaryDefsToLoad(settings));
    const settingsDictionary = createSpellingDictionary(
        words.concat(userWords),
        '[words]',
        'From Settings `words` and `userWords`',
        {
            caseSensitive: true,
        }
    );
    const ignoreWordsDictionary = createSpellingDictionary(
        ignoreWords,
        '[ignoreWords]',
        'From Settings `ignoreWords`',
        {
            caseSensitive: true,
            noSuggest: true,
        }
    );
    const flagWordsDictionary = createForbiddenWordsDictionary(
        flagWords,
        '[flagWords]',
        'From Settings `flagWords`',
        {}
    );
    return createCollectionP(
        [...spellDictionaries, settingsDictionary, ignoreWordsDictionary, flagWordsDictionary],
        'dictionary collection'
    );
}
