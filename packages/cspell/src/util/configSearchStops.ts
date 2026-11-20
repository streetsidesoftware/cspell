import { fileURLToPath } from 'node:url';

import { toFileDirURL } from '@cspell/url';
import type { StopAtLocation } from 'cspell-lib';

import { ApplicationError } from './errors.js';
import type { FolderLookup } from './folderOnDisk.js';

/**
 * Resolve the `--stop-config-search-at` folders against the current directory, spelled as on disk.
 */
export async function resolveStopFolders(
    folders: readonly string[] | undefined,
    lookup: FolderLookup,
): Promise<URL[] | undefined> {
    if (!folders?.length) return undefined;
    const stops: URL[] = [];
    // One at a time, so each lookup can use the folders found before it.
    for (const folder of folders) {
        stops.push(await resolveStopFolder(folder, lookup));
    }
    return stops;
}

async function resolveStopFolder(folder: string, lookup: FolderLookup): Promise<URL> {
    const url = toFileDirURL(folder);
    const found = url.protocol === 'file:' ? await lookup.find(fileURLToPath(url)) : undefined;
    if (!found) throw new ApplicationError('Each --stop-config-search-at path must be an existing folder.');
    return toFileDirURL(found);
}

/**
 * Work out where the search for each file's config stops.
 *
 * Unless the config loaded at startup was found by searching, the search stops at the root without looking in it. A
 * given stop at or above the root takes its place.
 *
 * @param givenStops - the resolved `--stop-config-search-at` folders.
 * @param configFoundBySearch - the config loaded at startup was found by searching.
 */
export function calcFileConfigSearchStops(
    givenStops: readonly URL[] | undefined,
    root: URL,
    configFoundBySearch: boolean,
): (URL | StopAtLocation)[] | undefined {
    const stops: (URL | StopAtLocation)[] = givenStops ? [...givenStops] : [];
    if (!configFoundBySearch && !givenStops?.some((given) => root.href.startsWith(given.href))) {
        stops.push({ url: root, exclusive: true });
    }
    return stops.length ? stops : undefined;
}
