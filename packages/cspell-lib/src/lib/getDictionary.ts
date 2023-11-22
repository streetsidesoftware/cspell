import type { CSpellUserSettings } from '@cspell/cspell-types';

import { toInternalSettings } from './Settings/CSpellSettingsServer.js';
import { defaultSettingsLoader } from './Settings/index.js';
import type { SpellingDictionaryCollection } from './SpellingDictionary/index.js';
import { getDictionaryInternal } from './SpellingDictionary/index.js';

/**
 * Load a dictionary collection defined by the settings.
 * @param settings - that defines the dictionaries and the ones to load.
 * @returns a dictionary collection that represents all the enabled dictionaries.
 */
export async function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection> {
    await defaultSettingsLoader.onReady();
    return getDictionaryInternal(toInternalSettings(settings));
}
