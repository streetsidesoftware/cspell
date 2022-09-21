import { CSpellSettingsInternal, DictionaryDefinitionInternal } from '../Models/CSpellSettingsInternalDef';
import { calcDictionaryDefsToLoad } from '../Settings/DictionarySettings';
import { isDefined } from '../util/util';
import {
    createForbiddenWordsDictionary,
    createSpellingDictionary,
} from './SpellingDictionaryLibOld/createSpellingDictionary';
import { loadDictionary, loadDictionarySync, refreshCacheEntries } from './DictionaryLoader';
import { SpellingDictionary } from './SpellingDictionaryLibOld/SpellingDictionary';
import {
    createCollection,
    SpellingDictionaryCollection,
} from './SpellingDictionaryLibOld/SpellingDictionaryCollection';

export function loadDictionaryDefs(defsToLoad: DictionaryDefinitionInternal[]): Promise<SpellingDictionary>[] {
    return defsToLoad.map(loadDictionary);
}

export function loadDictionaryDefsSync(defsToLoad: DictionaryDefinitionInternal[]): SpellingDictionary[] {
    return defsToLoad.map(loadDictionarySync);
}

export function refreshDictionaryCache(maxAge?: number): Promise<void> {
    return refreshCacheEntries(maxAge);
}

const emptyWords: readonly string[] = Object.freeze([]);

export async function getDictionaryInternal(settings: CSpellSettingsInternal): Promise<SpellingDictionaryCollection> {
    const spellDictionaries = await Promise.all(loadDictionaryDefs(calcDictionaryDefsToLoad(settings)));
    return _getDictionaryInternal(settings, spellDictionaries);
}

export function getDictionaryInternalSync(settings: CSpellSettingsInternal): SpellingDictionaryCollection {
    const spellDictionaries = loadDictionaryDefsSync(calcDictionaryDefsToLoad(settings));
    return _getDictionaryInternal(settings, spellDictionaries);
}

function _getDictionaryInternal(
    settings: CSpellSettingsInternal,
    spellDictionaries: SpellingDictionary[]
): SpellingDictionaryCollection {
    const { words = emptyWords, userWords = emptyWords, flagWords = emptyWords, ignoreWords = emptyWords } = settings;

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
    const ignoreWordsDictionary = createSpellingDictionary(
        ignoreWords,
        '[ignoreWords]',
        'From Settings `ignoreWords`',
        {
            caseSensitive: true,
            noSuggest: true,
            weightMap: undefined,
        }
    );
    const flagWordsDictionary = createForbiddenWordsDictionary(flagWords, '[flagWords]', 'From Settings `flagWords`', {
        weightMap: undefined,
    });
    const dictionaries = [
        ...spellDictionaries,
        settingsWordsDictionary,
        settingsUserWordsDictionary,
        ignoreWordsDictionary,
        flagWordsDictionary,
    ].filter(isDefined);
    return createCollection(dictionaries, 'dictionary collection');
}
