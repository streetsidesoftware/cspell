import { sep as pathSep } from 'path';
import { pathToFileURL } from 'url';

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
    if (!paths || !paths.length || typeof moduleName !== 'string') {
        try {
            return await import(moduleName.toString());
        } catch (e) {
            // console.log('%o', e);
            const err = toError(e);
            // err.code = err.code || 'ERR_MODULE_NOT_FOUND';
            throw err;
        }
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
