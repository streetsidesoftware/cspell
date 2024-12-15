import { toFileDirURL, toFilePathOrHref, toFileURL } from '@cspell/url';

import { srcDirectory } from '../pkg-info.mjs';

export {
    addTrailingSlash,
    isDataURL,
    isFileURL,
    isUrlLike as isURLLike,
    toFileURL as resolveFileWithURL,
    toFileDirURL,
    toFilePathOrHref,
    toURL,
} from '@cspell/url';

/**
 * This is a URL that can be used for searching for modules.
 * @returns URL for the source directory
 */
export function getSourceDirectoryUrl(): URL {
    const srcDirectoryURL = toFileDirURL(srcDirectory);
    return srcDirectoryURL;
}

/**
 * @param path - path to convert to a URL
 * @param relativeTo - URL to resolve the path against or the current working directory.
 * @returns a URL
 */
export function relativeTo(path: string, relativeTo?: URL | string): URL {
    return toFileURL(path, relativeTo ?? cwdURL());
}

export function cwdURL(): URL {
    return toFileDirURL('./');
}

export function toFileUrl(file: string | URL): URL {
    return toFileURL(file, cwdURL());
}

export function fileURLOrPathToPath(filenameOrURL: string | URL): string {
    return toFilePathOrHref(filenameOrURL);
}

const regExpWindowsPathDriveLetter = /^([a-zA-Z]):[\\]/;

export function windowsDriveLetterToUpper(absoluteFilePath: string): string {
    return absoluteFilePath.replace(regExpWindowsPathDriveLetter, (s) => s.toUpperCase());
}
