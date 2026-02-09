import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';

import type { CSpellSettings, CSpellVFS } from '@cspell/cspell-types';
import { mergeConfig } from '@cspell/cspell-types';
import type { CSpellConfigFile, CSpellConfigFileReaderWriter, ICSpellConfigFile } from 'cspell-config-lib';

export class CSpellDictionaryBundler {
    #loadedConfigs = new Map<string, Promise<ICSpellConfigFile>>();

    constructor(readonly reader: CSpellConfigFileReaderWriter) {}

    bundle(url: URL, content?: string): Promise<ICSpellConfigFile> {
        const found = this.#loadedConfigs.get(url.href);
        if (found) {
            return found;
        }
        const config = this.importConfig(url, content).then((config) => this.bundleConfig(config));
        this.#loadedConfigs.set(url.href, config);
        return config;
    }

    async bundleConfig(config: CSpellConfigFile): Promise<ICSpellConfigFile> {
        const imports = await this.loadImports(config);
        const settings = mergeConfig(
            imports.map((f) => f.settings),
            await this.resolveDictionaries(config),
        );
        delete settings.import;
        return {
            url: config.url,
            settings,
        };
    }

    async resolveDictionaries(config: ICSpellConfigFile): Promise<CSpellSettings> {
        const settings = { ...config.settings };
        if (!settings.dictionaryDefinitions) return settings;
        // Make a copy of the dictionary definitions and vfs to avoid mutating the original config file.
        const dictDefs = (settings.dictionaryDefinitions = [...settings.dictionaryDefinitions]);
        const vfs: CSpellVFS = (settings.vfs ??= Object.create(null));

        for (let i = 0; i < dictDefs.length; ++i) {
            const def = dictDefs[i];
            if (!def.path) continue;
            const d = { ...def };
            dictDefs[i] = d;
            delete d.file;
            const url = new URL(def.btrie ?? def.path, config.url);
            if (url.protocol !== 'file:') continue;
            const vfsUrl = await populateVfs(vfs, url);
            d.path = vfsUrl.href;
        }

        return settings;
    }

    importConfig(url: URL, content?: string): Promise<CSpellConfigFile> {
        if (content) {
            return Promise.resolve(this.reader.parse({ url, content }));
        }
        return this.reader.readConfig(url);
    }

    loadImports(config: CSpellConfigFile): Promise<ICSpellConfigFile[]> {
        const imports = [config.settings.import || []].flat();
        return Promise.all(imports.map((importPath) => this.bundle(new URL(importPath, config.url))));
    }
}

/**
 * Load a file from the file system and populate the virtual file system with its content.
 *
 * @param vfs - The Virtual Files system data
 * @param url - The url to load and store.
 * @return The cspell-vfs url that was loaded.
 */
export async function populateVfs(vfs: CSpellVFS, url: URL): Promise<URL> {
    const content = await fs.readFile(url);

    const hash = createHash('sha256').update(content).digest('hex');

    const data = content.toString('base64');
    const vfsUrl = makeVfsUrl(url, hash.slice(0, 16));
    vfs[vfsUrl.href] = {
        data,
        encoding: 'base64',
    };
    return vfsUrl;
}

/**
 * We want to make a url that is unique to the content of the file and indications where it came from.
 * @param url - the url to the source file.
 * @param hash - the hash of the file content
 * @returns A `cspell-vfs:///` url that can be used to reference the file content in the virtual file system.
 */
export function makeVfsUrl(url: URL, hash: string): URL {
    const parts = url.pathname.split('/').slice(1);
    let pos = -3;
    const i = parts.lastIndexOf('node_modules');
    if (i > 0) {
        pos = i + 1;
    }
    const path = parts.slice(pos).join('/');
    return new URL(`cspell-vfs:///${hash}/${path}`);
}
