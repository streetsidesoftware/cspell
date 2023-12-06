import { createRequire } from 'node:module';

import { resolveGlobal } from '@cspell/cspell-resolver';
import { importResolveModuleName } from '@cspell/dynamic-import';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import resolveFrom from 'resolve-from';
import { fileURLToPath } from 'url';

import { srcDirectory } from '../../lib-cjs/pkg-info.cjs';
import {
    fileURLOrPathToPath,
    isDataURL,
    isFileURL,
    isURLLike,
    resolveFileWithURL,
    toFilePathOrHref,
    toURL,
} from './url.js';

export interface ResolveFileResult {
    /**
     * Absolute path or URL to the file.
     */
    filename: string;
    relativeTo: string | undefined;
    found: boolean;
    /**
     * A warning message if the file was found, but there was a problem.
     */
    warning?: string;
}

const testNodeModules = /^node_modules\//;

/**
 * Resolve filename to absolute paths.
 * It tries to look for local files as well as node_modules
 * @param filename an absolute path, relative path, `~` path, or a node_module.
 * @param relativeTo absolute path
 */
export function resolveFile(filename: string, relativeTo: string | URL): ResolveFileResult {
    filename = filename.replace(/^~/, os.homedir());
    const steps: { filename: string; fn: (f: string, r: string | URL) => ResolveFileResult | undefined }[] = [
        { filename, fn: tryUrl },
        { filename, fn: tryCreateRequire },
        { filename, fn: tryNodeRequireResolve },
        { filename, fn: tryImportResolve },
        { filename, fn: tryResolveExists },
        { filename, fn: tryNodeResolveDefaultPaths },
        { filename, fn: tryResolveFrom },
        { filename: filename.replace(testNodeModules, ''), fn: tryResolveFrom },
        { filename, fn: tryResolveGlobal },
        { filename, fn: tryLegacyResolve },
    ];

    for (const step of steps) {
        const r = step.fn(step.filename, relativeTo);
        if (r?.found) return r;
    }

    const r = tryUrl(filename, relativeTo);

    return (
        r || {
            filename: isRelative(filename) ? joinWith(filename, relativeTo) : filename.toString(),
            relativeTo: relativeTo.toString(),
            found: false,
        }
    );
}

/**
 * Check to see if it is a URL.
 * Note: URLs are absolute!
 * If relativeTo is a non-file URL, then it will try to resolve the filename relative to it.
 * @param filename - url string
 * @returns ResolveFileResult
 */
function tryUrl(filename: string, relativeToURL: string | URL): ResolveFileResult | undefined {
    if (isURLLike(filename)) {
        if (isFileURL(filename)) {
            const file = fileURLToPath(filename);
            return {
                filename: file,
                relativeTo: undefined,
                found: fs.existsSync(file),
            };
        }
        return { filename: filename.toString(), relativeTo: undefined, found: true };
    }

    if (isURLLike(relativeToURL) && !isDataURL(relativeToURL)) {
        const relToURL = toURL(relativeToURL);
        const isRelToAFile = isFileURL(relToURL);
        const url = resolveFileWithURL(filename, relToURL);
        return {
            filename: toFilePathOrHref(url),
            relativeTo: toFilePathOrHref(relToURL),
            found: !isRelToAFile || fs.existsSync(url),
        };
    }

    return undefined;
}

function tryCreateRequire(filename: string | URL, relativeTo: string | URL): ResolveFileResult | undefined {
    if (filename instanceof URL) return undefined;
    const require = createRequire(relativeTo);
    try {
        const r = require.resolve(filename);
        return { filename: r, relativeTo: relativeTo.toString(), found: true };
    } catch (_) {
        return undefined;
    }
}

function tryNodeResolveDefaultPaths(filename: string): ResolveFileResult | undefined {
    try {
        const r = require.resolve(filename);
        return { filename: r, relativeTo: undefined, found: true };
    } catch (_) {
        return undefined;
    }
}

function tryNodeRequireResolve(filenameOrURL: string, relativeTo: string | URL): ResolveFileResult | undefined {
    const filename = fileURLOrPathToPath(filenameOrURL);
    const relativeToPath = pathFromRelativeTo(relativeTo);
    const home = os.homedir();
    function calcPaths(p: string) {
        const paths = [p];
        // Do not progress towards the root if it is a relative filename.
        if (isRelative(filename)) {
            return paths;
        }
        for (; p && path.dirname(p) !== p && p !== home; p = path.dirname(p)) {
            paths.push(p);
        }
        return paths;
    }
    const paths = calcPaths(path.resolve(relativeToPath));
    try {
        const r = require.resolve(filename, { paths });
        return { filename: r, relativeTo: relativeToPath, found: true };
    } catch (_) {
        return undefined;
    }
}

function tryImportResolve(filename: string, relativeTo: string | URL): ResolveFileResult | undefined {
    try {
        const paths = isRelative(filename) ? [relativeTo] : [relativeTo, srcDirectory];
        const resolved = fileURLToPath(importResolveModuleName(filename, paths));
        return { filename: resolved, relativeTo: relativeTo.toString(), found: true };
    } catch (_) {
        return undefined;
    }
}

function tryResolveGlobal(filename: string): ResolveFileResult | undefined {
    const r = resolveGlobal(filename);
    return (r && { filename: r, relativeTo: undefined, found: true }) || undefined;
}

function tryResolveExists(filename: string | URL, relativeTo: string | URL): ResolveFileResult | undefined {
    if (filename instanceof URL || isURLLike(filename) || (isURLLike(relativeTo) && !isFileURL(relativeTo))) {
        return undefined;
    }

    relativeTo = pathFromRelativeTo(relativeTo);

    const toTry = [{ filename }, { filename: path.resolve(relativeTo, filename), relativeTo }];
    for (const { filename, relativeTo } of toTry) {
        const found = path.isAbsolute(filename) && fs.existsSync(filename);
        if (found) return { filename, relativeTo: relativeTo?.toString(), found };
    }
    filename = path.resolve(filename);
    return {
        filename,
        relativeTo: path.resolve('.'),
        found: fs.existsSync(filename),
    };
}

function tryResolveFrom(filename: string, relativeTo: string | URL): ResolveFileResult | undefined {
    if (relativeTo instanceof URL) return undefined;
    try {
        return { filename: resolveFrom(pathFromRelativeTo(relativeTo), filename), relativeTo, found: true };
    } catch (error) {
        // Failed to resolve a relative module request
        return undefined;
    }
}

const regExpStartsWidthNodeModules = /^node_modules[/\\]/;

function tryLegacyResolve(filename: string | URL, relativeTo: string | URL): ResolveFileResult | undefined {
    if (filename instanceof URL || isURLLike(filename) || (isURLLike(relativeTo) && !isFileURL(relativeTo))) {
        return undefined;
    }

    const relativeToPath = isURLLike(relativeTo) ? fileURLToPath(new URL('./', relativeTo)) : relativeTo.toString();

    const match = filename.match(regExpStartsWidthNodeModules);

    if (match) {
        const found = tryImportResolve(filename.replace(regExpStartsWidthNodeModules, ''), relativeToPath);
        if (found?.found) {
            found.warning = `Import of '${filename}' should not start with '${match[0]}' in '${toFilePathOrHref(
                relativeTo,
            )}'`;
            return found;
        }
    }

    return undefined;
}

function isRelative(filename: string | URL): boolean {
    if (filename instanceof URL) return false;
    if (filename.startsWith('./')) return true;
    if (filename.startsWith('../')) return true;
    if (filename.startsWith('.' + path.sep)) return true;
    if (filename.startsWith('..' + path.sep)) return true;
    return false;
}

function joinWith(filename: string, relativeTo: string | URL): string {
    return relativeTo instanceof URL || isURLLike(relativeTo)
        ? toFilePathOrHref(new URL(filename, relativeTo))
        : path.resolve(relativeTo, filename);
}

function pathFromRelativeTo(relativeTo: string | URL): string {
    return relativeTo instanceof URL || isURLLike(relativeTo) ? fileURLToPath(new URL('./', relativeTo)) : relativeTo;
}

export const __testing__ = {
    isRelative,
    isFileURL,
    isURLLike,
    fileURLOrPathToPath,
    tryResolveFrom,
    tryResolveExists,
    tryResolveGlobal,
    tryImportResolve,
    tryNodeRequireResolve,
    tryNodeResolveDefaultPaths,
    tryUrl,
};
