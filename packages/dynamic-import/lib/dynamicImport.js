import { dImport } from './dImport.js';
import { sep as pathSep } from 'path';
import { pathToFileURL } from 'url';

/**
 * Lazy load the importer so we can use an ESM packages inside a cjs file.
 */

/**
 * @type {Promise<typeof import('import-meta-resolve')> | undefined}
 */
let pImportResolve;

/**
 * Dynamically import a module using `import`.
 * @param {string} moduleName - name of module, or relative path.
 * @param {(string | URL)[] | string | URL} paths - search paths
 * @returns the loaded module.
 */
export async function dynamicImportFrom(moduleName, paths) {
    paths = Array.isArray(paths) ? paths : paths ? [paths] : undefined;
    if (!paths || !paths.length || typeof moduleName !== 'string') {
        try {
            return await dImport(moduleName);
        } catch (err) {
            err.code = err.code ?? 'ERR_MODULE_NOT_FOUND';
            throw err;
        }
    }

    const importResolveModule = await (pImportResolve || (pImportResolve = dImport('import-meta-resolve')));

    const { resolve } = importResolveModule;

    let lastError = undefined;

    for (const parent of paths) {
        try {
            const url =
                typeof parent === 'string'
                    ? parent.startsWith('file://')
                        ? new URL(parent)
                        : pathToFileURL(parent + pathSep)
                    : parent;
            const location = await resolve(moduleName, url);
            return await dImport(location);
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError;
}
