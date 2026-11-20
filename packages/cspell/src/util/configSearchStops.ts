import { toFileDirURL } from '@cspell/url';
import type { StopAtLocation } from 'cspell-lib';

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
 * With a named config, the search stops at the root without looking in it. A given stop at or above the root takes its
 * place.
 *
 * @param givenStops - the resolved `--stop-config-search-at` folders.
 * @param hasNamedConfig - a config was named with `--config` or `CSPELL_CONFIG_PATH`.
 */
export function calcFileConfigSearchStops(
    givenStops: readonly URL[] | undefined,
    root: URL,
    hasNamedConfig: boolean,
): (URL | StopAtLocation)[] | undefined {
    const stops: (URL | StopAtLocation)[] = givenStops ? [...givenStops] : [];
    if (hasNamedConfig && !givenStops?.some((given) => root.href.startsWith(given.href))) {
        stops.push({ url: root, exclusive: true });
    }
    return stops.length ? stops : undefined;
}
