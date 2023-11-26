import { dispatchClearCache } from './events/index.js';
import { refreshDictionaryCache } from './SpellingDictionary/index.js';

/**
 * Clear the cached files and other cached data.
 * Calling this function will cause the next spell check to take longer because it will need to reload configuration files and dictionaries.
 * Call this function if configuration files have changed.
 *
 * It is safe to replace {@link clearCachedFiles} with {@link clearCaches}
 */
export function clearCachedFiles(): Promise<void> {
    return _clearCachedFiles();
}

/**
 * Clear the cached files and other cached data.
 * Calling this function will cause the next spell check to take longer because it will need to reload configuration files and dictionaries.
 * Call this function if configuration files have changed.
 */
function _clearCachedFiles(): Promise<void> {
    // We want to dispatch immediately.
    dispatchClearCache();
    return Promise.all([refreshDictionaryCache(0)]).then(() => undefined);
}

/**
 * Sends and event to clear the caches.
 * It resets the configuration files and dictionaries.
 *
 * It is safe to replace {@link clearCaches} with {@link clearCachedFiles}
 */
export function clearCaches(): void {
    clearCachedFiles().catch(() => {});
}
