import { toFileDirURL, urlBasename } from '@cspell/url';
import type { StopAtLocation } from 'cspell-lib';

/**
 * A config in one of these folders belongs to the folder above.
 */
export const nestedConfigFolders: ReadonlySet<string> = new Set(['.vscode/', '.config/']);

/**
 * Resolve the `--stop-config-search-at` folders against the current directory.
 */
export function resolveStopFolders(folders: readonly string[] | undefined): URL[] | undefined {
    if (!folders?.length) return undefined;
    return folders.map((folder) => toFileDirURL(folder));
}

/**
 * Work out where the search for each file's config stops.
 *
 * With a named config, the search stops at the root and at the named config's folder, without looking in them. A given
 * stop takes their place for the files under it, so each one at or below a given stop is left out.
 *
 * @param givenStops - the resolved `--stop-config-search-at` folders.
 * @param namedConfigUrl - the config named with `--config` or `CSPELL_CONFIG_PATH`.
 */
export function calcFileConfigSearchStops(
    givenStops: readonly URL[] | undefined,
    root: URL,
    namedConfigUrl: URL | undefined,
): (URL | StopAtLocation)[] | undefined {
    const stops: (URL | StopAtLocation)[] = givenStops ? [...givenStops] : [];
    if (namedConfigUrl) {
        const configFolder = toConfigFolder(namedConfigUrl);
        const defaultStops = configFolder.href === root.href ? [root] : [root, configFolder];
        for (const url of defaultStops) {
            if (givenStops?.some((given) => url.href.startsWith(given.href))) continue;
            stops.push({ url, exclusive: true });
        }
    }
    return stops.length ? stops : undefined;
}

function toConfigFolder(configUrl: URL): URL {
    const folder = new URL('./', configUrl);
    return nestedConfigFolders.has(urlBasename(folder)) ? new URL('../', folder) : folder;
}
