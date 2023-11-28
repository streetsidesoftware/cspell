import { resolve } from 'import-meta-resolve';
import { statSync } from 'node:fs';
import { sep as pathSep } from 'path';
import { pathToFileURL } from 'url';

const isWindowsPath = /^[a-z]:\\/i;

/**
 * Dynamically import a module using `import`.
 * @param moduleName - name of module, or relative path.
 * @param paths - search paths
 * @returns the loaded module.
 */
export async function dynamicImportFrom<Module>(
    moduleName: string | URL,
    paths: string | URL | (string | URL)[] | undefined,
): Promise<Module> {
    paths = Array.isArray(paths) ? paths : paths ? [paths] : undefined;
    const modulesNameToImport = normalizeModuleName(moduleName);

    if (!paths || !paths.length || typeof moduleName !== 'string') {
        try {
            return await import(modulesNameToImport.toString());
        } catch (e) {
            // console.warn('Error %o', e);
            const err = toError(e);
            // err.code = err.code || 'ERR_MODULE_NOT_FOUND';
            throw err;
        }
    }

    const location = importResolveModuleName(moduleName, paths);
    return await import(location.href);
}

interface ErrorWithCode extends Error {
    code?: string;
}

/**
 * Use Import.meta.resolve logic to try and determine possible locations for a module.
 * @param moduleName - name of module, relative path, or absolute path.
 * @param paths - Places to start resolving from.
 * @returns location of module
 */
export function importResolveModuleName(moduleName: string | URL, paths: (string | URL)[]): URL {
    const modulesNameToImport = normalizeModuleName(moduleName);

    let lastError = undefined;

    for (const parent of paths) {
        try {
            const url =
                typeof parent === 'string'
                    ? parent.startsWith('file://')
                        ? new URL(parent)
                        : pathToFileURL(parent + pathSep)
                    : parent;
            const resolvedURL = new URL(resolve(modulesNameToImport.toString(), url.toString()));
            try {
                const s = statSync(resolvedURL);
                if (s.isFile()) {
                    return resolvedURL;
                }
            } catch (err) {
                const error: ErrorWithCode = new Error(`Cannot find module ${moduleName}`);
                error.code = 'ERR_MODULE_NOT_FOUND';
                lastError = error;
            }
        } catch (err) {
            // console.warn('%o', { moduleName, modulesNameToImport, paths, parentUrl: url, err, resolved, location });
            lastError = err;
        }
    }
    throw lastError;
}

function normalizeModuleName(moduleName: string | URL) {
    return typeof moduleName === 'string' && isWindowsPath.test(moduleName) ? pathToFileURL(moduleName) : moduleName;
}

interface NodeError extends Error {
    code?: string;
}

function toError(e: unknown): NodeError {
    if (isError(e)) return e;
    return new Error(e?.toString());
}

function isError(e: unknown): e is NodeError {
    return e instanceof Error;
}
