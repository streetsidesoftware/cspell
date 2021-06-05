/**
 * Handles loading of `.pnp.js` and `.pnp.js` files.
 */
import { URI } from 'vscode-uri';
import importFresh from 'import-fresh';
import findUp from 'find-up';
import clearModule from 'clear-module';

const defaultPnpFiles = ['.pnp.cjs', '.pnp.js'];

const supportedSchemas = new Set(['file']);

export type LoaderResult = URI | undefined;

const cachedPnpImports = new Map<string, Promise<LoaderResult>>();
const cachedRequests = new Map<string, Promise<LoaderResult>>();
let lock: Promise<undefined> | undefined = undefined;

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
    public async load(uriDirectory: URI): Promise<LoaderResult> {
        await lock;
        const cacheKey = this.calcKey(uriDirectory);
        const cached = cachedRequests.get(cacheKey);
        if (cached) return cached;

        const r = findPnpAndLoad(uriDirectory, this.pnpFiles);
        cachedRequests.set(cacheKey, r);
        return r;
    }

    public async peek(uriDirectory: URI): Promise<LoaderResult> {
        await lock;
        const cacheKey = this.calcKey(uriDirectory);
        return cachedRequests.get(cacheKey) ?? Promise.resolve(undefined);
    }

    /**
     * Clears the cached so .pnp files will get reloaded on request.
     */
    public clearCache(): Promise<void> {
        return clearPnPGlobalCache();
    }

    private calcKey(uriDirectory: URI): string {
        return uriDirectory.toString() + this.cacheKeySuffix;
    }
}

export function pnpLoader(pnpFiles?: string[]): PnpLoader {
    return new PnpLoader(pnpFiles);
}

export class UnsupportedSchema extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class UnsupportedPnpFile extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

/**
 * @param uriDirectory - directory to start at.
 */
async function findPnpAndLoad(uriDirectory: URI, pnpFiles: string[]): Promise<LoaderResult> {
    validateSchema(uriDirectory);
    const found = await findUp(pnpFiles, { cwd: uriDirectory.fsPath });
    if (!found) return;
    const c = cachedPnpImports.get(found);
    if (c) return c;

    const r = loadPnp(found);
    cachedPnpImports.set(found, r);
    return r;
}

interface Pnp {
    setup?: () => void;
}

async function loadPnp(pnpFile: string): Promise<LoaderResult> {
    const pnp = importFresh<Pnp>(pnpFile);
    if (pnp.setup) {
        pnp.setup();
        return URI.file(pnpFile);
    }
    throw new UnsupportedPnpFile(`Unsupported pnp file: "${pnpFile}"`);
}

function validateSchema(uri: URI): true | never {
    if (!supportedSchemas.has(uri.scheme)) {
        throw new UnsupportedSchema(`Unsupported schema for PNP: "${uri.scheme}"`);
    }
    return true;
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
    const modules = await Promise.all([...cachedPnpImports.values()].map(rejectToUndefined));
    modules.forEach((r) => r && clearModule.single(r.fsPath));
    cachedRequests.clear();
    cachedPnpImports.clear();
    return undefined;
}

function rejectToUndefined<T>(p: Promise<T>): Promise<T | undefined> {
    return p.catch(() => undefined);
}
