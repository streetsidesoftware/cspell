import { extname } from 'node:path/posix';

import type { CSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFileJavaScript } from '../CSpellConfigFile/CSpellConfigFileJavaScript.js';
import type { FileLoaderMiddleware, LoaderNext, LoadRequest } from '../FileLoader.js';

async function importJavaScript(url: URL, hashSuffix: number | string): Promise<CSpellConfigFileJavaScript> {
    url = new URL(url.href);
    url.hash = `${url.hash};loaderSuffix=${hashSuffix}`;
    const result = await import(url.href);
    const settings = result.default ?? result;
    return new CSpellConfigFileJavaScript(url, settings);
}

export class LoaderJavaScript implements FileLoaderMiddleware {
    private hashSuffix = 1;

    async _load(req: LoadRequest, next: LoaderNext): Promise<CSpellConfigFile> {
        const { url } = req;
        const ext = extname(url.pathname).toLowerCase();

        switch (ext) {
            case '.js':
            case '.cjs':
            case '.mjs':
                return importJavaScript(url, this.hashSuffix);
        }
        return next(req);
    }

    load = this._load.bind(this);

    reset(): void {
        this.hashSuffix += 1;
    }
}

export const loaderJavaScript = new LoaderJavaScript();
