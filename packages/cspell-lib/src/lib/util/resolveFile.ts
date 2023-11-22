import { resolveGlobal } from '@cspell/cspell-resolver';
import { importResolveModuleName } from '@cspell/dynamic-import';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import resolveFrom from 'resolve-from';
import { fileURLToPath } from 'url';

import { srcDirectory } from '../../lib-cjs/pkg-info.cjs';
import { toFilePathOrHref } from './url.js';

export interface ResolveFileResult {
    filename: string;
    relativeTo: string | undefined;
    found: boolean;
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
        { filename, fn: tryNodeRequireResolve },
        { filename, fn: tryImportResolve },
        { filename, fn: tryResolveExists },
        { filename, fn: tryNodeResolveDefaultPaths },
        { filename, fn: tryResolveFrom },
        { filename: filename.replace(testNodeModules, ''), fn: tryResolveFrom },
        { filename, fn: tryResolveGlobal },
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

const isUrlRegExp = /^(?:\w+:\/\/|data:)/i;

/**
 * Check to see if it is a URL.
 * Note: URLs are absolute!
 * If relativeTo is a non-file URL, then it will try to resolve the filename relative to it.
 * @param filename - url string
 * @returns ResolveFileResult
 */
function tryUrl(filename: string, relativeTo: string | URL): ResolveFileResult | undefined {
    if (isURLLike(filename)) {
        if (isFileURL(filename)) {
            return {
                filename: fileURLToPath(filename),
                relativeTo: undefined,
                found: fs.existsSync(fileURLToPath(filename)),
            };
        }
        return { filename: filename.toString(), relativeTo: undefined, found: true };
    }

    if (isURLLike(relativeTo) && !isFileURL(relativeTo) && !isDataURL(relativeTo)) {
        const url = new URL(filename, relativeTo);
        return {
            filename: url.href,
            relativeTo: relativeTo.toString(),
            found: true,
        };
    }

    if (isURLLike(relativeTo) && !isDataURL(relativeTo)) {
        const rel = filename.split(path.sep).join('/');
        const url = new URL(rel, relativeTo);
        return {
            filename: toFilePathOrHref(url),
            relativeTo: relativeTo.toString(),
            found: fs.existsSync(url),
        };
    }

    return undefined;
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
    const relativeToPath = fileURLOrPathToPath(relativeTo);
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
    if (filename instanceof URL || isURLLike(filename) || isURLLike(relativeTo)) return undefined;

    const toTry = [{ filename }, { filename: path.resolve(relativeTo.toString(), filename), relativeTo }];
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
        return { filename: resolveFrom(relativeTo, filename), relativeTo, found: true };
    } catch (error) {
        // Failed to resolve a relative module request
        return undefined;
    }
}

function fileURLOrPathToPath(filenameOrURL: string | URL): string {
    return isFileURL(filenameOrURL) ? fileURLToPath(filenameOrURL) : filenameOrURL.toString();
}

function isURLLike(url: string | URL): boolean {
    return url instanceof URL || isUrlRegExp.test(url);
}

function isFileURL(url: string | URL): boolean {
    return isUrlWithProtocol(url, 'file');
}

function isDataURL(url: string | URL): boolean {
    return isUrlWithProtocol(url, 'data');
}

function isUrlWithProtocol(url: string | URL, protocol: string): boolean {
    protocol = protocol.endsWith(':') ? protocol : protocol + ':';
    return url instanceof URL ? url.protocol === protocol : url.startsWith(protocol);
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
