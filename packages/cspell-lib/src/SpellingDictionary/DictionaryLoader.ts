import { CSpellIO } from 'cspell-io';
import { DictionaryDefinitionInternal } from '../Models/CSpellSettingsInternalDef';
import { getCSpellIO } from '../static';
import { DictionaryLoader } from './DictionaryController';
import { SpellingDictionary } from './SpellingDictionary';
export type { LoadOptions } from './DictionaryController';

let loader: DictionaryLoader | undefined;

export function getDictionaryLoader(cspellIO?: CSpellIO): DictionaryLoader {
    if (loader) return loader;
    return (loader = new DictionaryLoader(cspellIO || getCSpellIO()));
}

export function loadDictionary(def: DictionaryDefinitionInternal): Promise<SpellingDictionary> {
    return getDictionaryLoader().loadDictionary(def);
}

export function loadDictionarySync(def: DictionaryDefinitionInternal): SpellingDictionary {
    return getDictionaryLoader().loadDictionarySync(def);
}

/**
 * Check to see if any of the cached dictionaries have changed. If one has changed, reload it.
 * @param maxAge - Only check the dictionary if it has been at least `maxAge` ms since the last check.
 * @param now - optional timestamp representing now. (Mostly used in testing)
 */
export async function refreshCacheEntries(maxAge?: number, now?: number): Promise<void> {
    return getDictionaryLoader().refreshCacheEntries(maxAge, now);
}
