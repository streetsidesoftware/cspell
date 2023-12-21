import type { SpellingDictionary, SpellingDictionaryCollection } from 'cspell-dictionary';
import {
    createCollection,
    createForbiddenWordsDictionary,
    createIgnoreWordsDictionary,
    createSpellingDictionary,
    createSuggestDictionary,
} from 'cspell-dictionary';

import type { CSpellSettingsInternal, DictionaryDefinitionInternal } from '../Models/CSpellSettingsInternalDef.js';
import { calcDictionaryDefsToLoad } from '../Settings/DictionarySettings.js';
import { isDefined } from '../util/util.js';
import { loadDictionary, refreshCacheEntries } from './DictionaryLoader.js';

export function loadDictionaryDefs(defsToLoad: DictionaryDefinitionInternal[]): Promise<SpellingDictionary>[] {
    return defsToLoad.map(loadDictionary);
}

export function refreshDictionaryCache(maxAge?: number): Promise<void> {
    return refreshCacheEntries(maxAge);
}

const emptyWords: readonly string[] = Object.freeze([]);

export async function getDictionaryInternal(settings: CSpellSettingsInternal): Promise<SpellingDictionaryCollection> {
    const spellDictionaries = await Promise.all(loadDictionaryDefs(calcDictionaryDefsToLoad(settings)));
    return _getDictionaryInternal(settings, spellDictionaries);
}

function _getDictionaryInternal(
    settings: CSpellSettingsInternal,
    spellDictionaries: SpellingDictionary[],
): SpellingDictionaryCollection {
    const {
        words = emptyWords,
        userWords = emptyWords,
        flagWords = emptyWords,
        ignoreWords = emptyWords,
        suggestWords = emptyWords,
    } = settings;

    const settingsWordsDictionary = createSpellingDictionary(words, '[words]', 'From Settings `words`', {
        caseSensitive: true,
        weightMap: undefined,
    });
    const settingsUserWordsDictionary = userWords.length
        ? createSpellingDictionary(userWords, '[userWords]', 'From Settings `userWords`', {
              caseSensitive: true,
              weightMap: undefined,
          })
        : undefined;
    const ignoreWordsDictionary = createIgnoreWordsDictionary(
        ignoreWords,
        '[ignoreWords]',
        'From Settings `ignoreWords`',
    );
    const flagWordsDictionary = createForbiddenWordsDictionary(flagWords, '[flagWords]', 'From Settings `flagWords`');
    const suggestWordsDictionary = createSuggestDictionary(
        suggestWords,
        '[suggestWords]',
        'From Settings `suggestWords`',
    );
    const dictionaries = [
        ...spellDictionaries,
        settingsWordsDictionary,
        settingsUserWordsDictionary,
        ignoreWordsDictionary,
        flagWordsDictionary,
        suggestWordsDictionary,
    ].filter(isDefined);
    return createCollection(dictionaries, 'dictionary collection');
}
