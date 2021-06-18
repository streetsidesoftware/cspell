import { DictionaryDefinition, DictionaryId, CSpellUserSettings } from '@cspell/cspell-types';
import { filterDictDefsToLoad } from '../Settings/DictionarySettings';
import { loadDictionary, refreshCacheEntries } from './DictionaryLoader';
import { createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionary } from './SpellingDictionary';
import { createCollectionP } from './SpellingDictionaryCollection';
import { SpellingDictionaryCollection } from './index';

export function loadDictionaries(dictIds: DictionaryId[], defs: DictionaryDefinition[]): Promise<SpellingDictionary>[] {
    const defsToLoad = filterDictDefsToLoad(dictIds, defs);

    return defsToLoad
        .map((e) => e[1])
        .map((def) => loadDictionary(def.path, def))
        .map((p) => p.catch(() => undefined))
        .filter((p) => !!p)
        .map((a) => a as Promise<SpellingDictionary>);
}

export function refreshDictionaryCache(maxAge?: number): Promise<void> {
    return refreshCacheEntries(maxAge);
}

export function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection> {
    const { words = [], userWords = [], dictionaries = [], dictionaryDefinitions = [], flagWords = [] } = settings;
    const spellDictionaries = loadDictionaries(dictionaries, dictionaryDefinitions);
    const settingsDictionary = createSpellingDictionary(words.concat(userWords), 'user_words', 'From Settings');
    return createCollectionP(
        [...spellDictionaries, Promise.resolve(settingsDictionary)],
        'dictionary collection',
        flagWords
    );
}
