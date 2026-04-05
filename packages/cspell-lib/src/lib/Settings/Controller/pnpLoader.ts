/**
 * Handles loading of `.pnp.js` and `.pnp.js` files.
 */
import { fileURLToPath } from 'node:url';

import createImportFresh from 'import-fresh';

import { findUp } from '../../util/findUp.js';
import { toFileUrl } from '../../util/url.js';
import { UnsupportedPnpFile } from './ImportError.js';

const importFresh = createImportFresh(import.meta.url);

const defaultPnpFiles = ['.pnp.cjs', '.pnp.js'];

const supportedSchemas = new Set(['file:']);

export type LoaderResult = URL | undefined;

const cachedRequests = new Map<string, Promise<LoaderResult>>();
let lock: Promise<undefined> | undefined = undefined;
const cachedPnpImports = new Map<string, Promise<LoaderResult>>();
const cachedRequestsSync = new Map<string, LoaderResult>();

export class PnpLoader {
    private cacheKeySuffix: string;
    constructor(readonly pnpFiles: string[] = defaultPnpFiles) {
        this.cacheKeySuffix = ':' + pnpFiles.join(',');
    }

    /**
     * Request that the nearest .pnp file gets loaded
     * @param urlDirectory starting directory
     * @returns promise - rejects on error - success if loaded or not found.
     */
    public async load(urlDirectory: URL): Promise<LoaderResult> {
        if (!isSupported(urlDirectory)) return undefined;
        await lock;
        const cacheKey = this.calcKey(urlDirectory);
        const cached = cachedRequests.get(cacheKey);
        if (cached) return cached;

        const r = findPnpAndLoad(urlDirectory, this.pnpFiles);
        cachedRequests.set(cacheKey, r);
        const result = await r;
        cachedRequestsSync.set(cacheKey, result);
        return result;
    }

    public async peek(urlDirectory: URL): Promise<LoaderResult> {
        if (!isSupported(urlDirectory)) return undefined;
        await lock;
        const cacheKey = this.calcKey(urlDirectory);
        return cachedRequests.get(cacheKey) ?? Promise.resolve(undefined);
    }

    /**
     * Clears the cached so .pnp files will get reloaded on request.
     */
    public clearCache(): Promise<void> {
        return clearPnPGlobalCache();
    }

    private calcKey(urlDirectory: URL): string {
        return urlDirectory.toString() + this.cacheKeySuffix;
    }
}

export function pnpLoader(pnpFiles?: string[]): PnpLoader {
    return new PnpLoader(pnpFiles);
}

async function findPnpAndLoad(urlDirectory: URL, pnpFiles: string[]): Promise<LoaderResult> {
    const found = await findUp(pnpFiles, { cwd: fileURLToPath(urlDirectory) });
    return loadPnpIfNeeded(found);
}

async function loadPnpIfNeeded(found: string | undefined): Promise<LoaderResult> {
    if (!found) return undefined;
    const cached = cachedPnpImports.get(found);
    if (cached) return cached;

    const r = loadPnp(found);
    cachedPnpImports.set(found, r);
    r.catch(() => cachedPnpImports.delete(found));
    return r;
}

interface Pnp {
    setup?: () => void;
}

async function loadPnp(pnpFile: string): Promise<LoaderResult> {
    const { default: pnp } = await importFresh<{ default: Pnp }>(toFileUrl(pnpFile).href);
    if (pnp.setup) {
        pnp.setup();
        return toFileUrl(pnpFile);
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
    cachedPnpImports.clear();
    cachedRequests.clear();
    cachedRequestsSync.clear();
    return undefined;
}

function rejectToUndefined<T>(p: Promise<T>): Promise<T | undefined> {
    return p.catch(() => undefined);
}

function isSupported(url: URL): boolean {
    return supportedSchemas.has(url.protocol);
}
