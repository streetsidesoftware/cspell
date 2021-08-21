import { CSpellUserSettings, DictionaryDefinition, DictionaryReference } from '@cspell/cspell-types';
import { createDictionaryReferenceCollection } from '../Settings/DictionaryReferenceCollection';
import { filterDictDefsToLoad } from '../Settings/DictionarySettings';
import { createForbiddenWordsDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { loadDictionary, refreshCacheEntries } from './DictionaryLoader';
import { SpellingDictionaryCollection } from './index';
import { SpellingDictionary } from './SpellingDictionary';
import { createCollectionP } from './SpellingDictionaryCollection';

export function loadDictionaries(
    dictIds: DictionaryReference[],
    defs: DictionaryDefinition[]
): Promise<SpellingDictionary>[] {
    const defsToLoad = filterDictDefsToLoad(dictIds, defs);

    return defsToLoad.map((def) => loadDictionary(def.path, def));
}

export function refreshDictionaryCache(maxAge?: number): Promise<void> {
    return refreshCacheEntries(maxAge);
}

export function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection> {
    const {
        words = [],
        userWords = [],
        dictionaries = [],
        dictionaryDefinitions = [],
        noSuggestDictionaries = [],
        flagWords = [],
        ignoreWords = [],
    } = settings;
    const colNoSug = createDictionaryReferenceCollection(noSuggestDictionaries);
    const colDicts = createDictionaryReferenceCollection(dictionaries.concat(colNoSug.enabled()));
    const modDefs = dictionaryDefinitions.map((def) => {
        const enabled = colNoSug.isEnabled(def.name);
        if (enabled === undefined) return def;
        return { ...def, noSuggest: enabled };
    });
    const spellDictionaries = loadDictionaries(colDicts.enabled(), modDefs);
    const settingsDictionary = createSpellingDictionary(words.concat(userWords), 'user_words', 'From Settings', {
        caseSensitive: true,
    });
    const ignoreWordsDictionary = createSpellingDictionary(ignoreWords, 'ignore_words', 'From Settings', {
        caseSensitive: true,
        noSuggest: true,
    });
    const flagWordsDictionary = createForbiddenWordsDictionary(flagWords, 'flag_words', 'From Settings', {});
    return createCollectionP(
        [...spellDictionaries, settingsDictionary, ignoreWordsDictionary, flagWordsDictionary],
        'dictionary collection'
    );
}
