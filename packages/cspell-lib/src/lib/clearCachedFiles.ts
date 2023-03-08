import { clearCachedSettingsFiles } from './Settings/index.js';
import { refreshDictionaryCache } from './SpellingDictionary/index.js';

export async function clearCachedFiles(): Promise<void> {
    await Promise.all([clearCachedSettingsFiles(), refreshDictionaryCache(0)]);
}
