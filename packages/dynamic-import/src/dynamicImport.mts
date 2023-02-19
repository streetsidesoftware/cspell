import { sep as pathSep } from 'path';
import { pathToFileURL } from 'url';

/**
 * Dynamically import a module using `import`.
 * @param {string} moduleName - name of module, or relative path.
 * @param {(string | URL)[] | string | URL} paths - search paths
 * @returns the loaded module.
 */
export async function dynamicImportFrom<Module>(
    moduleName: string,
    paths: string | URL | (string | URL)[] | undefined
): Promise<Module> {
    paths = Array.isArray(paths) ? paths : paths ? [paths] : undefined;
    if (!paths || !paths.length || typeof moduleName !== 'string') {
        return await import(moduleName);
    }

    const importResolveModule = await import('import-meta-resolve');

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
            const location = await resolve(moduleName, url.toString());
            return await import(location);
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError;
}
