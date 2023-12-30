import { extname } from 'node:path/posix';

import type { CSpellConfigFile, ICSpellConfigFile } from './CSpellConfigFile.js';
import type { FileLoaderMiddleware } from './FileLoader.js';
import type { IO } from './IO.js';
import { getDeserializer, getLoader, getSerializer } from './middlewareHelper.js';
import type { DeserializerNext, SerializerMiddleware } from './Serializer.js';
import type { TextFileRef } from './TextFile.js';
import { toURL } from './util/toURL.js';

export interface CSpellConfigFileReaderWriter {
    readonly io: IO;
    readonly middleware: SerializerMiddleware[];
    readonly loaders: FileLoaderMiddleware[];
    readConfig(uri: URL | string): Promise<CSpellConfigFile>;
    writeConfig(configFile: CSpellConfigFile): Promise<TextFileRef>;
    clearCachedFiles(): void;
    setUntrustedExtensions(ext: readonly string[]): this;
    setTrustedUrls(urls: readonly (URL | string)[]): this;
    /**
     * Untrusted extensions are extensions that are not trusted to be loaded from a file system.
     * Extension are case insensitive and should include the leading dot.
     */
    readonly untrustedExtensions: string[];
    /**
     * Urls starting with these urls are trusted to be loaded from a file system.
     */
    readonly trustedUrls: URL[];
}

export class CSpellConfigFileReaderWriterImpl implements CSpellConfigFileReaderWriter {
    /**
     * @param io - an optional injectable IO interface. The default is to use the file system.
     * @param deserializers - Additional deserializers to use when reading a config file. The order of the deserializers is
     *    important. The last one in the list will be the first one to be called.
     */
    constructor(
        readonly io: IO,
        readonly middleware: SerializerMiddleware[],
        readonly loaders: FileLoaderMiddleware[],
    ) {}

    private _untrustedExtensions = new Set<string>();
    private _trustedUrls: string[] = [];

    /**
     * Untrusted extensions are extensions that are not trusted to be loaded from a file system.
     * Extension are case insensitive and should include the leading dot.
     */
    get untrustedExtensions(): string[] {
        return [...this._untrustedExtensions];
    }

    /**
     * Urls starting with these urls are trusted to be loaded from a file system.
     */
    get trustedUrls(): URL[] {
        return [...this._trustedUrls].map((url) => new URL(url));
    }

    readConfig(uri: URL | string): Promise<CSpellConfigFile> {
        const url = new URL(uri);
        if (!isTrusted(url, this._trustedUrls, this._untrustedExtensions)) {
            return Promise.reject(new UntrustedUrlError(url));
        }

        const loader = getLoader(this.loaders);
        return loader({ url: toURL(uri), context: { deserialize: this.getDeserializer(), io: this.io } });
    }

    getDeserializer(): DeserializerNext {
        return getDeserializer(this.middleware);
    }

    serialize(configFile: ICSpellConfigFile): string {
        const serializer = getSerializer(this.middleware);
        return serializer(configFile);
    }

    async writeConfig(configFile: ICSpellConfigFile): Promise<TextFileRef> {
        if (configFile.readonly) throw new Error(`Config file is readonly: ${configFile.url.href}`);
        const content = this.serialize(configFile);
        await this.io.writeFile({ url: configFile.url, content });
        return { url: configFile.url };
    }

    setUntrustedExtensions(ext: readonly string[]): this {
        this._untrustedExtensions.clear();
        ext.forEach((e) => this._untrustedExtensions.add(e.toLowerCase()));
        return this;
    }

    setTrustedUrls(urls: readonly (URL | string)[]): this {
        this._trustedUrls = [...new Set([...urls.map((url) => new URL(url).href)])].sort();
        return this;
    }

    clearCachedFiles(): void {
        for (const loader of this.loaders) {
            loader.reset?.();
        }
    }
}

function isTrusted(url: URL, trustedUrls: string[], untrustedExtensions: Set<string>): boolean {
    const path = url.pathname;
    const ext = extname(path).toLowerCase();

    if (!untrustedExtensions.has(ext)) return true;

    const href = url.href;

    return trustedUrls.some((trustedUrl) => href.startsWith(trustedUrl));
}

export class UntrustedUrlError extends Error {
    constructor(url: URL) {
        super(`Untrusted URL: "${url.href}"`);
    }
}
