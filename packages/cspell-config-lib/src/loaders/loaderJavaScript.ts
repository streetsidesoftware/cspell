import { extname } from 'node:path/posix';

import type { CSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFileJavaScript } from '../CSpellConfigFile/CSpellConfigFileJavaScript.js';
import type { FileLoaderMiddleware, LoaderNext, LoadRequest } from '../FileLoader.js';

async function load(req: LoadRequest, next: LoaderNext): Promise<CSpellConfigFile> {
    const { url } = req;
    const ext = extname(url.pathname).toLowerCase();

    switch (ext) {
        case '.js':
        case '.cjs':
        case '.mjs':
            return importJavaScript(url);
    }
    return next(req);
}

async function importJavaScript(url: URL): Promise<CSpellConfigFileJavaScript> {
    const result = await import(url.href);
    const settings = result.default ?? result;
    return new CSpellConfigFileJavaScript(url, settings);
}

export const loaderJavaScript: FileLoaderMiddleware = {
    load,
};
