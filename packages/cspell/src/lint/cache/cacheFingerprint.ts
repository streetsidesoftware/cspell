import path from 'node:path';

import { isUrlLike, toFilePathOrHref } from '@cspell/url';

/**
 * The options of a run that change a file's result.
 */
export interface FingerprintOptions {
    languageId?: string;
    locale?: string;
    report?: string | undefined;
    showSuggestions?: boolean;
    validateDirectives?: boolean;
    stopConfigSearchAt?: readonly URL[] | undefined;
    /** The config file loaded at startup. */
    configUrl?: URL | undefined;
    /** Whether the run searches for config files near each file. */
    configSearch?: boolean;
}

/**
 * The cache's context tag for a run, so a cached result is only reused by a run with the same options.
 * `undefined` when none are set.
 */
export function calcCacheFingerprint(options: FingerprintOptions, root: string): string | undefined {
    const {
        languageId,
        locale,
        report,
        showSuggestions,
        validateDirectives,
        stopConfigSearchAt,
        configUrl,
        configSearch,
    } = options;
    const values = {
        languageId: languageId || undefined,
        locale: locale || undefined,
        report: report || undefined,
        showSuggestions,
        validateDirectives,
        stopConfigSearchAt: stopConfigSearchAt?.length ? relativeStopFolders(stopConfigSearchAt, root) : undefined,
        config: configUrl && relativeConfigPath(configUrl, root),
        configSearch: configSearch === false ? false : undefined,
    };
    const set = Object.entries(values).filter(([, value]) => value !== undefined);
    return set.length ? JSON.stringify(Object.fromEntries(set)) : undefined;
}

function relativeStopFolders(folders: readonly URL[], root: string): string[] {
    return folders.map((folder) => relativeToRoot(toFilePathOrHref(folder), root)).sort();
}

function relativeConfigPath(url: URL, root: string): string {
    const filePath = toFilePathOrHref(url);
    return isUrlLike(filePath) ? filePath : relativeToRoot(filePath, root);
}

/**
 * Relative to the root with `/` separators, so a shared cache matches on another machine.
 */
function relativeToRoot(file: string, root: string): string {
    return path.relative(root, file).split(path.sep).join('/') || '.';
}
