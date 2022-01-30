import { CSpellSettingsInternal, DictionaryDefinitionInternal } from '../Models/CSpellSettingsInternalDef';
import { calcDictionaryDefsToLoad } from '../Settings/DictionarySettings';
import { createForbiddenWordsDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { loadDictionary, refreshCacheEntries } from './DictionaryLoader';
import { SpellingDictionary } from './SpellingDictionary';
import { createCollectionP, SpellingDictionaryCollection } from './SpellingDictionaryCollection';

export function loadDictionaryDefs(defsToLoad: DictionaryDefinitionInternal[]): Promise<SpellingDictionary>[] {
    return defsToLoad.map((def) => loadDictionary(def.path, def));
}

export function refreshDictionaryCache(maxAge?: number): Promise<void> {
    return refreshCacheEntries(maxAge);
}

const emptyWords: readonly string[] = Object.freeze([]);

export function getDictionaryInternal(settings: CSpellSettingsInternal): Promise<SpellingDictionaryCollection> {
    const { words = emptyWords, userWords = emptyWords, flagWords = emptyWords, ignoreWords = emptyWords } = settings;
    const spellDictionaries = loadDictionaryDefs(calcDictionaryDefsToLoad(settings));

    const settingsDictionary = createSpellingDictionary(words.concat(userWords), '[words]', 'From Settings `words`', {
        caseSensitive: true,
        weightMap: undefined,
    });
    const settingsUserWordsDictionary = createSpellingDictionary(
        userWords,
        '[userWords]',
        'From Settings `userWords`',
        {
            caseSensitive: true,
            weightMap: undefined,
        }
    );
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
    return createCollectionP(
        [
            ...spellDictionaries,
            settingsDictionary,
            settingsUserWordsDictionary,
            ignoreWordsDictionary,
            flagWordsDictionary,
        ],
        'dictionary collection'
    );
}
