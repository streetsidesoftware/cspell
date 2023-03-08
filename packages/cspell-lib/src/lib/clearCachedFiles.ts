import { clearCachedSettingsFiles } from './Settings';
import { refreshDictionaryCache } from './SpellingDictionary';

export async function clearCachedFiles(): Promise<void> {
    await Promise.all([clearCachedSettingsFiles(), refreshDictionaryCache(0)]);
}
