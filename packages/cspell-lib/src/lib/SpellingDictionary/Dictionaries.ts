import type { CSpellSettings } from '@cspell/cspell-types';
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

export const specialDictionaryNames = {
    words: '[words]',
    userWords: '[userWords]',
    flagWords: '[flagWords]',
    ignoreWords: '[ignoreWords]',
    suggestWords: '[suggestWords]',
} as const;

export type DictionaryNameFields = keyof typeof specialDictionaryNames;

export const mapSpecialDictionaryNamesToSettings: Map<string, DictionaryNameFields> = new Map(
    Object.entries(specialDictionaryNames).map(([k, v]) => [v, k as DictionaryNameFields] as const),
);

export function getInlineConfigDictionaries(settings: CSpellSettings): SpellingDictionary[] {
    const {
        words = emptyWords,
        userWords = emptyWords,
        flagWords = emptyWords,
        ignoreWords = emptyWords,
        suggestWords = emptyWords,
    } = settings;

    const settingsWordsDictionary = createSpellingDictionary(
        words,
        specialDictionaryNames.words,
        'From Settings `words`',
        {
            caseSensitive: true,
            weightMap: undefined,
        },
    );
    const settingsUserWordsDictionary = userWords.length
        ? createSpellingDictionary(userWords, specialDictionaryNames.userWords, 'From Settings `userWords`', {
              caseSensitive: true,
              weightMap: undefined,
          })
        : undefined;
    const ignoreWordsDictionary = createIgnoreWordsDictionary(
        ignoreWords,
        specialDictionaryNames.ignoreWords,
        'From Settings `ignoreWords`',
    );
    const flagWordsDictionary = createForbiddenWordsDictionary(
        flagWords,
        specialDictionaryNames.flagWords,
        'From Settings `flagWords`',
    );
    const suggestWordsDictionary = createSuggestDictionary(
        suggestWords,
        '[suggestWords]',
        'From Settings `suggestWords`',
    );
    const dictionaries = [
        settingsWordsDictionary,
        settingsUserWordsDictionary,
        ignoreWordsDictionary,
        flagWordsDictionary,
        suggestWordsDictionary,
    ].filter(isDefined);

    return dictionaries;
}

function _getDictionaryInternal(
    settings: CSpellSettingsInternal,
    spellDictionaries: SpellingDictionary[],
): SpellingDictionaryCollection {
    const dictionaries = [...spellDictionaries, ...getInlineConfigDictionaries(settings)];
    return createCollection(dictionaries, 'dictionary collection');
}
