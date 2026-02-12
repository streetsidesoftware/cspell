import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import nodePath from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

import type { CSpellSettings, CSpellVFS } from '@cspell/cspell-types';
import { mergeConfig } from '@cspell/cspell-types';
import type { CSpellConfigFile, CSpellConfigFileReaderWriter, ICSpellConfigFile } from 'cspell-config-lib';
import { convertToBTrie } from 'cspell-trie-lib';

import type { Options } from './options.ts';

export type CSpellDictionaryBundlerOptions = Required<
    Pick<Options, 'debug' | 'convertToBTrie' | 'minConvertSize' | 'compress'>
>;

export class CSpellDictionaryBundler {
    #loadedConfigs = new Map<string, Promise<ICSpellConfigFile>>();
    #options: CSpellDictionaryBundlerOptions;

    constructor(
        readonly reader: CSpellConfigFileReaderWriter,
        options: CSpellDictionaryBundlerOptions,
    ) {
        this.#options = options;
    }

    log(...args: Parameters<typeof console.log>): void {
        if (this.#options.debug) {
            console.log(...args);
        }
    }

    bundle(url: URL, content?: string): Promise<ICSpellConfigFile> {
        this.log(`Bundling ${url.href}`);
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
            await resolveDictionaries(config, this.#options),
        );
        delete settings.import;
        delete settings['$schema'];
        return {
            url: config.url,
            settings,
        };
    }

    importConfig(url: URL, content?: string): Promise<CSpellConfigFile> {
        if (content && !isCodeFile(url)) {
            return Promise.resolve(this.reader.parse({ url, content }));
        }
        return this.reader.readConfig(url);
    }

    loadImports(config: CSpellConfigFile): Promise<ICSpellConfigFile[]> {
        const imports = [config.settings.import || []].flat();
        return Promise.all(imports.map((importPath) => this.bundle(resolveImport(importPath, config.url))));
    }
}

export async function resolveDictionaries(
    config: ICSpellConfigFile,
    options: CSpellDictionaryBundlerOptions,
): Promise<CSpellSettings> {
    const settings = { ...config.settings };
    if (!settings.dictionaryDefinitions) return settings;
    if (config.url.protocol !== 'file:') return settings;
    // Make a copy of the dictionary definitions and vfs to avoid mutating the original config file.
    const dictDefs = (settings.dictionaryDefinitions = [...settings.dictionaryDefinitions]);
    const vfs: CSpellVFS = (settings.vfs ??= Object.create(null));
    const minConvertSize = options.minConvertSize ?? 1024;

    for (let i = 0; i < dictDefs.length; ++i) {
        const def = dictDefs[i];
        const d = { ...def };
        if (!d.path) continue;
        dictDefs[i] = d;
        const url = resolvePath(d.btrie ?? d.path, config.url);
        if (url.protocol !== 'file:') continue;
        let file = await readFile({ url });
        file = options.convertToBTrie && fileLength(file) >= minConvertSize ? await convert(file) : file;
        file = options.compress && fileLength(file) >= minConvertSize ? compressFile(file) : file;
        const vfsUrl = await populateVfs(vfs, file);
        delete d.file;
        delete d.btrie;
        d.path = vfsUrl.href;
    }

    return settings;
}

interface FileReference {
    url: URL;
    content?: string | Uint8Array<ArrayBuffer>;
}

interface FileResource extends FileReference {
    content: string | Uint8Array<ArrayBuffer>;
}

async function convert(file: FileReference): Promise<FileResource> {
    const resource = await readFile(file);
    return convertToBTrie(resource, { optimize: true });
}

/**
 * Load a file from the file system and populate the virtual file system with its content.
 *
 * @param vfs - The Virtual Files system data
 * @param url - The url to load and store.
 * @return The cspell-vfs url that was loaded.
 */
export async function populateVfs(vfs: CSpellVFS, fileRef: FileReference): Promise<URL> {
    const { url, content } = await readFile(fileRef);

    const hash = createHash('sha256').update(content).digest('hex');

    const data = typeof content === 'string' ? content : Buffer.from(content).toString('base64');
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

const isUrlLikeRegExp = /^[a-z_0-9-]{3,}:/i;
function isUrlLike(s: string): boolean {
    return isUrlLikeRegExp.test(s);
}

function resolveImport(file: string, from: URL): URL {
    if (file.startsWith('./') || file.startsWith('../')) {
        return new URL(file, from);
    }
    if (isUrlLike(file)) {
        return new URL(file);
    }
    const require = createRequire(from);
    const importPath = require.resolve(file);

    return pathToFileURL(importPath);
}

const isCodeFileRegExp = /\.[cm]?(js|ts)$/i;

function isCodeFile(url: URL): boolean {
    return isCodeFileRegExp.test(url.pathname);
}

async function readFile(fileRef: FileReference): Promise<FileResource> {
    const url = fileRef.url;
    const content = fileRef.content ?? (await fs.readFile(url));
    return { url, content };
}

/**
 * This is the approximate size of the file in bytes.
 * @param file
 * @returns
 */
function fileLength(file: FileResource): number {
    if (typeof file.content === 'string') {
        return file.content.length;
    }
    return file.content.byteLength;
}

function compressFile(file: FileResource): FileResource {
    if (file.url.pathname.endsWith('.gz')) return file;
    const url = new URL(file.url.pathname + '.gz', file.url);
    const content = gzipSync(file.content);
    return { url, content };
}

function resolvePath(path: string, base: URL): URL {
    if (isUrlLike(path)) {
        return new URL(path);
    }

    const dir = fileURLToPath(new URL('./', base));
    const filePath = nodePath.resolve(dir, path);
    return pathToFileURL(filePath);
}
