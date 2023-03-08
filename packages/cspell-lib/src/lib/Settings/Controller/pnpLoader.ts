/**
 * Handles loading of `.pnp.js` and `.pnp.js` files.
 */
import clearModule from 'clear-module';
import findUp from 'find-up';
import importFresh from 'import-fresh';

import type { Uri } from '../../util/Uri.js';
import { toUri, uriToFilePath } from '../../util/Uri.js';
import { UnsupportedPnpFile } from './ImportError.js';

const defaultPnpFiles = ['.pnp.cjs', '.pnp.js'];

const supportedSchemas = new Set(['file']);

export type LoaderResult = Uri | undefined;

const cachedRequests = new Map<string, Promise<LoaderResult>>();
let lock: Promise<undefined> | undefined = undefined;
const cachedPnpImportsSync = new Map<string, LoaderResult>();
const cachedRequestsSync = new Map<string, LoaderResult>();

export class PnpLoader {
    private cacheKeySuffix: string;
    constructor(readonly pnpFiles: string[] = defaultPnpFiles) {
        this.cacheKeySuffix = ':' + pnpFiles.join();
    }

    /**
     * Request that the nearest .pnp file gets loaded
     * @param uriDirectory starting directory
     * @returns promise - rejects on error - success if loaded or not found.
     */
    public async load(uriDirectory: Uri): Promise<LoaderResult> {
        if (!supportedSchemas.has(uriDirectory.scheme)) return undefined;
        await lock;
        const cacheKey = this.calcKey(uriDirectory);
        const cached = cachedRequests.get(cacheKey);
        if (cached) return cached;

        const r = findPnpAndLoad(uriDirectory, this.pnpFiles);
        cachedRequests.set(cacheKey, r);
        const result = await r;
        cachedRequestsSync.set(cacheKey, result);
        return result;
    }

    public async peek(uriDirectory: Uri): Promise<LoaderResult> {
        if (!supportedSchemas.has(uriDirectory.scheme)) return undefined;
        await lock;
        const cacheKey = this.calcKey(uriDirectory);
        return cachedRequests.get(cacheKey) ?? Promise.resolve(undefined);
    }

    /**
     * Request that the nearest .pnp file gets loaded
     * @param uriDirectory starting directory
     * @returns promise - rejects on error - success if loaded or not found.
     */
    public loadSync(uriDirectory: Uri): LoaderResult {
        if (!supportedSchemas.has(uriDirectory.scheme)) return undefined;
        const cacheKey = this.calcKey(uriDirectory);
        const cached = cachedRequestsSync.get(cacheKey);
        if (cached) return cached;

        const r = findPnpAndLoadSync(uriDirectory, this.pnpFiles);
        cachedRequestsSync.set(cacheKey, r);
        cachedRequests.set(cacheKey, Promise.resolve(r));
        return r;
    }

    public peekSync(uriDirectory: Uri): LoaderResult {
        if (!supportedSchemas.has(uriDirectory.scheme)) return undefined;
        const cacheKey = this.calcKey(uriDirectory);
        return cachedRequestsSync.get(cacheKey);
    }

    /**
     * Clears the cached so .pnp files will get reloaded on request.
     */
    public clearCache(): Promise<void> {
        return clearPnPGlobalCache();
    }

    private calcKey(uriDirectory: Uri): string {
        return uriDirectory.toString() + this.cacheKeySuffix;
    }
}

export function pnpLoader(pnpFiles?: string[]): PnpLoader {
    return new PnpLoader(pnpFiles);
}

/**
 * @param uriDirectory - directory to start at.
 */
async function findPnpAndLoad(uriDirectory: Uri, pnpFiles: string[]): Promise<LoaderResult> {
    const found = await findUp(pnpFiles, { cwd: uriToFilePath(uriDirectory) });
    return loadPnpIfNeeded(found);
}

/**
 * @param uriDirectory - directory to start at.
 */
function findPnpAndLoadSync(uriDirectory: Uri, pnpFiles: string[]): LoaderResult {
    const found = findUp.sync(pnpFiles, { cwd: uriToFilePath(uriDirectory) });
    return loadPnpIfNeeded(found);
}

function loadPnpIfNeeded(found: string | undefined): LoaderResult {
    if (!found) return undefined;
    const c = cachedPnpImportsSync.get(found);
    if (c || cachedPnpImportsSync.has(found)) return c;

    const r = loadPnp(found);
    cachedPnpImportsSync.set(found, r);
    return r;
}

interface Pnp {
    setup?: () => void;
}

function loadPnp(pnpFile: string): LoaderResult {
    const pnp = importFresh<Pnp>(pnpFile);
    if (pnp.setup) {
        pnp.setup();
        return toUri(pnpFile);
    }
    throw new UnsupportedPnpFile(`Unsupported pnp file: "${pnpFile}"`);
}

export function clearPnPGlobalCache(): Promise<undefined> {
    if (lock) return lock;
    lock = _cleanCache().finally(() => {
        lock = undefined;
    });
    return lock;
}

async function _cleanCache(): Promise<undefined> {
    await Promise.all([...cachedRequests.values()].map(rejectToUndefined));
    const modules = [...cachedPnpImportsSync.values()];
    modules.forEach((r) => r && clearModule.single(uriToFilePath(r)));
    cachedRequests.clear();
    cachedRequestsSync.clear();
    cachedPnpImportsSync.clear();
    return undefined;
}

function rejectToUndefined<T>(p: Promise<T>): Promise<T | undefined> {
    return p.catch(() => undefined);
}
