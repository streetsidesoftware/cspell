import { createRequire } from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

import { resolveGlobal } from '@cspell/cspell-resolver';
import { importResolveModuleName } from '@cspell/dynamic-import';
import type { VFileSystem } from 'cspell-io';
import resolveFrom from 'resolve-from';

import { srcDirectory } from '../../lib-cjs/pkg-info.cjs';
import { getFileSystem } from '../fileSystem.js';
import { envToTemplateVars, replaceTemplate } from './templates.js';
import {
    fileURLOrPathToPath,
    isDataURL,
    isFileURL,
    isURLLike,
    resolveFileWithURL,
    toFilePathOrHref,
    toFileUrl,
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
    /**
     * The method used to resolve the file.
     */
    method: string;
}

const regExpStartsWidthNodeModules = /^node_modules[/\\]/;

export class FileResolver {
    constructor(
        private fs: VFileSystem,
        readonly templateReplacements: Record<string, string>,
    ) {}

    /**
     * Resolve filename to absolute paths.
     * - Replaces `${env:NAME}` with the value of the environment variable `NAME`.
     * - Replaces `~` with the user's home directory.
     * It tries to look for local files as well as node_modules
     * @param filename an absolute path, relative path, `~` path, a node_module, or URL.
     * @param relativeTo absolute path
     */
    async resolveFile(filename: string | URL, relativeTo: string | URL): Promise<ResolveFileResult> {
        if (filename instanceof URL) {
            return {
                filename: toFilePathOrHref(filename),
                relativeTo: relativeTo.toString(),
                found: await this.doesExist(filename),
                method: 'url',
            };
        }
        const result = await this._resolveFile(filename, relativeTo);
        const match = filename.match(regExpStartsWidthNodeModules);

        if (match) {
            result.warning ??= `Import of '${filename}' should not start with '${match[0]}' in '${toFilePathOrHref(
                relativeTo,
            )}'. Use '${filename.replace(regExpStartsWidthNodeModules, '')}' or a relative path instead.`;
        }

        return result;
    }

    async _resolveFile(filename: string, relativeTo: string | URL): Promise<ResolveFileResult> {
        filename = patchFilename(filename, this.templateReplacements);
        const steps: {
            filename: string;
            fn: (f: string, r: string | URL) => Promise<ResolveFileResult | undefined> | ResolveFileResult | undefined;
        }[] = [
            { filename, fn: this.tryUrlRel },
            { filename, fn: this.tryCreateRequire },
            { filename, fn: this.tryNodeRequireResolve },
            { filename, fn: this.tryImportResolve },
            { filename, fn: this.tryResolveExists },
            { filename, fn: this.tryNodeResolveDefaultPaths },
            { filename, fn: this.tryResolveFrom },
            { filename, fn: this.tryResolveGlobal },
            { filename, fn: this.tryLegacyResolve },
        ];

        for (const step of steps) {
            const r = await step.fn(step.filename, relativeTo);
            if (r?.found) return r;
        }

        const result = (await this.tryUrl(filename, relativeTo)) || {
            filename: isRelative(filename) ? joinWith(filename, relativeTo) : filename.toString(),
            relativeTo: relativeTo.toString(),
            found: false,
            method: 'not found',
        };

        return result;
    }

    private async doesExist(file: URL): Promise<boolean> {
        try {
            const s = await this.fs.stat(file);
            return s.isFile() || s.isUnknown();
        } catch {
            return false;
        }
    }

    /**
     * Check to see if it is a URL.
     * Note: URLs are absolute!
     * If relativeTo is a non-file URL, then it will try to resolve the filename relative to it.
     * @param filename - url string
     * @returns ResolveFileResult
     */
    tryUrlRel = async (filename: string, relativeToURL: string | URL): Promise<ResolveFileResult | undefined> => {
        if (isURLLike(filename)) {
            const fileURL = toURL(filename);
            return {
                filename: toFilePathOrHref(fileURL),
                relativeTo: undefined,
                found: await this.doesExist(fileURL),
                method: 'tryUrl',
            };
        }

        if (isRelative(filename) && isURLLike(relativeToURL) && !isDataURL(relativeToURL)) {
            const relToURL = toURL(relativeToURL);
            const url = resolveFileWithURL(filename, relToURL);
            return {
                filename: toFilePathOrHref(url),
                relativeTo: toFilePathOrHref(relToURL),
                found: await this.doesExist(url),
                method: 'tryUrl',
            };
        }

        return undefined;
    };

    /**
     * Check to see if it is a URL.
     * Note: URLs are absolute!
     * If relativeTo is a non-file URL, then it will try to resolve the filename relative to it.
     * @param filename - url string
     * @returns ResolveFileResult
     */
    tryUrl = async (filename: string, relativeToURL: string | URL): Promise<ResolveFileResult | undefined> => {
        if (isURLLike(relativeToURL) && !isDataURL(relativeToURL)) {
            const relToURL = toURL(relativeToURL);
            const url = resolveFileWithURL(filename, relToURL);
            return {
                filename: toFilePathOrHref(url),
                relativeTo: toFilePathOrHref(relToURL),
                found: await this.doesExist(url),
                method: 'tryUrl',
            };
        }

        return undefined;
    };

    tryCreateRequire = (filename: string | URL, relativeTo: string | URL): ResolveFileResult | undefined => {
        if (filename instanceof URL) return undefined;
        const rel = !isURLLike(relativeTo) || isFileURL(relativeTo) ? relativeTo : pathToFileURL('./');
        const require = createRequire(rel);
        try {
            const r = require.resolve(filename);
            return { filename: r, relativeTo: rel.toString(), found: true, method: 'tryCreateRequire' };
        } catch (_) {
            return undefined;
        }
    };

    tryNodeResolveDefaultPaths = (filename: string): ResolveFileResult | undefined => {
        try {
            // eslint-disable-next-line unicorn/prefer-module
            const r = require.resolve(filename);
            return { filename: r, relativeTo: undefined, found: true, method: 'tryNodeResolveDefaultPaths' };
        } catch (_) {
            return undefined;
        }
    };

    tryNodeRequireResolve = (filenameOrURL: string, relativeTo: string | URL): ResolveFileResult | undefined => {
        if (isURLLike(relativeTo) && !isFileURL(relativeTo)) return undefined;

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
            // eslint-disable-next-line unicorn/prefer-module
            const r = require.resolve(filename, { paths });
            return { filename: r, relativeTo: relativeToPath, found: true, method: 'tryNodeRequireResolve' };
        } catch (_) {
            return undefined;
        }
    };

    tryImportResolve = (filename: string, relativeTo: string | URL): ResolveFileResult | undefined => {
        try {
            const paths = isRelative(filename) ? [relativeTo] : [relativeTo, srcDirectory];
            const resolved = fileURLToPath(importResolveModuleName(filename, paths));
            return { filename: resolved, relativeTo: relativeTo.toString(), found: true, method: 'tryImportResolve' };
        } catch (_) {
            return undefined;
        }
    };

    tryResolveGlobal = (filename: string): ResolveFileResult | undefined => {
        const r = resolveGlobal(filename);
        return (r && { filename: r, relativeTo: undefined, found: true, method: 'tryResolveGlobal' }) || undefined;
    };

    tryResolveExists = async (
        filename: string | URL,
        relativeTo: string | URL,
    ): Promise<ResolveFileResult | undefined> => {
        if (filename instanceof URL || isURLLike(filename) || (isURLLike(relativeTo) && !isFileURL(relativeTo))) {
            return undefined;
        }

        relativeTo = pathFromRelativeTo(relativeTo);

        const toTry = [{ filename }, { filename: path.resolve(relativeTo, filename), relativeTo }];
        for (const { filename, relativeTo } of toTry) {
            const found = path.isAbsolute(filename) && (await this.doesExist(toFileUrl(filename)));
            if (found) return { filename, relativeTo: relativeTo?.toString(), found, method: 'tryResolveExists' };
        }
        filename = path.resolve(filename);
        return {
            filename,
            relativeTo: path.resolve('.'),
            found: await this.doesExist(toFileUrl(filename)),
            method: 'tryResolveExists',
        };
    };

    tryResolveFrom = (filename: string, relativeTo: string | URL): ResolveFileResult | undefined => {
        if (relativeTo instanceof URL) return undefined;
        try {
            return {
                filename: resolveFrom(pathFromRelativeTo(relativeTo), filename),
                relativeTo,
                found: true,
                method: 'tryResolveFrom',
            };
        } catch {
            // Failed to resolve a relative module request
            return undefined;
        }
    };

    tryLegacyResolve = (filename: string | URL, relativeTo: string | URL): ResolveFileResult | undefined => {
        if (filename instanceof URL || isURLLike(filename) || (isURLLike(relativeTo) && !isFileURL(relativeTo))) {
            return undefined;
        }

        const relativeToPath = isURLLike(relativeTo) ? fileURLToPath(new URL('./', relativeTo)) : relativeTo.toString();

        const match = filename.match(regExpStartsWidthNodeModules);

        if (match) {
            const fixedFilename = filename.replace(regExpStartsWidthNodeModules, '');
            const found =
                this.tryImportResolve(fixedFilename, relativeToPath) ||
                this.tryResolveFrom(fixedFilename, relativeToPath);
            if (found?.found) {
                found.method = 'tryLegacyResolve';
                return found;
            }
        }

        return undefined;
    };
}

export function patchFilename(filename: string, templateReplacements: Record<string, string>): string {
    const defaultReplacements = {
        cwd: process.cwd(),
        pathSeparator: path.sep,
        userHome: os.homedir(),
    };

    filename = filename.replace(/^~(?=[/\\])/, defaultReplacements.userHome);
    filename = replaceTemplate(filename, { ...defaultReplacements, ...templateReplacements });
    return filename;
}

/**
 * Resolve filename to a URL
 * - Replaces `${env:NAME}` with the value of the environment variable `NAME`.
 * - Replaces `~` with the user's home directory.
 * It will not resolve Node modules.
 * @param filename - a filename, path, relative path, or URL.
 * @param relativeTo - a path, or URL.
 * @param env - environment variables used to patch the filename.
 * @returns a URL
 */
export function resolveRelativeTo(
    filename: string | URL,
    relativeTo: string | URL,
    templateReplacements = envToTemplateVars(process.env),
): URL {
    if (filename instanceof URL) return filename;
    filename = patchFilename(filename, templateReplacements);
    const relativeToUrl = toFileUrl(relativeTo);
    return resolveFileWithURL(filename, relativeToUrl);
}

function isRelative(filename: string | URL): boolean {
    if (filename instanceof URL) return false;
    if (isURLLike(filename)) return false;
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

const loaderCache = new WeakMap<VFileSystem, FileResolver>();

export function createFileResolver(fs: VFileSystem, templateVariables = envToTemplateVars(process.env)): FileResolver {
    let loader = loaderCache.get(fs);
    if (!loader) {
        loader = new FileResolver(fs, templateVariables);
        loaderCache.set(fs, loader);
    }
    return loader;
}

export async function resolveFile(
    filename: string | URL,
    relativeTo: string | URL,
    fs: VFileSystem = getFileSystem(),
): Promise<ResolveFileResult> {
    const resolver = createFileResolver(fs);
    return resolver.resolveFile(filename, relativeTo);
}
