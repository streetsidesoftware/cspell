import type { SpellingDictionary } from 'cspell-dictionary';

import type { VFileSystem } from '../fileSystem.js';
import { getFileSystem } from '../fileSystem.js';
import type { DictionaryDefinitionInternal } from '../Models/CSpellSettingsInternalDef.js';
import { DictionaryLoader } from './DictionaryController/index.js';
export type { LoadOptions } from './DictionaryController/index.js';

let loader: DictionaryLoader | undefined;

export function getDictionaryLoader(vfs?: VFileSystem): DictionaryLoader {
    if (loader) return loader;
    return (loader = new DictionaryLoader(vfs || getFileSystem()));
}

export function loadDictionary(def: DictionaryDefinitionInternal): Promise<SpellingDictionary> {
    return getDictionaryLoader().loadDictionary(def);
}

/**
 * Check to see if any of the cached dictionaries have changed. If one has changed, reload it.
 * @param maxAge - Only check the dictionary if it has been at least `maxAge` ms since the last check.
 * @param now - optional timestamp representing now. (Mostly used in testing)
 */
export async function refreshCacheEntries(maxAge?: number, now?: number): Promise<void> {
    return getDictionaryLoader().refreshCacheEntries(maxAge, now);
}
