import { DictionaryDefinition, DictionaryId, CSpellUserSettings } from '../Settings';
import { filterDictDefsToLoad } from '../Settings/DictionarySettings';
import { loadDictionary } from './DictionaryLoader';
import { SpellingDictionary, createSpellingDictionary } from './SpellingDictionary';
import { createCollectionP } from './SpellingDictionaryCollection';


export function loadDictionaries(dictIds: DictionaryId[], defs: DictionaryDefinition[]): Promise<SpellingDictionary>[] {
    const defsToLoad = filterDictDefsToLoad(dictIds, defs);

    return defsToLoad
        .map(e => e[1])
        .map(def => loadDictionary(def.path!, def));
}

export function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionary> {
    const { words = [], userWords = [], dictionaries = [], dictionaryDefinitions = [], flagWords = [] } = settings;
    const spellDictionaries = loadDictionaries(dictionaries, dictionaryDefinitions);
    const settingsDictionary = Promise.resolve(createSpellingDictionary(words.concat(userWords), 'user_words'));
    return createCollectionP([...spellDictionaries, settingsDictionary], 'dictionary collection', flagWords);
}
