import { assert } from '../errors/assert.js';
import type { BufferEncoding } from '../models/BufferEncoding.js';
import type { FileReference, FileResource, TextFileResource } from '../models/FileResource.js';
import { decode, decompress, encodeString, isGZipped } from './encode-decode.js';

export interface CFileResourceJson {
    url: string;
    content: string;
    encoding?: string | undefined;
    baseFilename?: string | undefined;
    gz: boolean;
}

export class CFileResource implements TextFileResource {
    readonly baseFilename?: string | undefined;
    readonly url: URL;
    readonly content: string | Uint8Array<ArrayBuffer>;
    readonly encoding: BufferEncoding | undefined;
    #gz?: boolean | undefined;
    #text?: string;
    #data?: Uint8Array<ArrayBuffer>;

    constructor(
        url: URL,
        content: string | Uint8Array<ArrayBuffer>,
        encoding: BufferEncoding | undefined,
        baseFilename: string | undefined,
        gz: boolean | undefined,
    ) {
        this.url = url;
        this.content = content;
        this.encoding = encoding;
        this.baseFilename = baseFilename ?? ((url.protocol !== 'data:' && url.pathname.split('/').pop()) || undefined);
        this.#gz = gz;
    }

    get gz(): boolean {
        if (this.#gz !== undefined) return this.#gz;
        if (this.url.pathname.endsWith('.gz')) return true;
        if (typeof this.content === 'string') return false;
        return isGZipped(this.content);
    }

    getText(encoding?: BufferEncoding): string {
        if (this.#text !== undefined) return this.#text;
        const text = typeof this.content === 'string' ? this.content : decode(this.content, encoding ?? this.encoding);
        this.#text = text;
        return text;
    }

    async getBytes(unzip?: boolean): Promise<Uint8Array<ArrayBuffer>> {
        if (unzip !== false && this.#data !== undefined) return this.#data;
        if (typeof this.content === 'string') {
            this.#data = encodeString(this.content, this.encoding);
            return this.#data;
        }
        if (unzip ?? isGZipped(this.content)) {
            this.#data = await decompress(this.content, 'gzip');
            return this.#data;
        }
        return this.content;
    }

    public toJson(): CFileResourceJson {
        return {
            url: this.url.href,
            content: this.getText(),
            encoding: this.encoding,
            baseFilename: this.baseFilename,
            gz: this.gz,
        };
    }

    static isCFileResource(obj: unknown): obj is CFileResource {
        return obj instanceof CFileResource;
    }

    static from(fileResource: FileResource): CFileResource;
    static from(fileReference: FileReference, content: string | Uint8Array<ArrayBuffer>): CFileResource;
    static from(fileReference: FileReference | URL, content: string | Uint8Array<ArrayBuffer>): CFileResource;
    static from(
        url: URL,
        content: string | Uint8Array<ArrayBuffer>,
        encoding?: BufferEncoding | undefined,
        baseFilename?: string | undefined,
        gz?: boolean,
    ): CFileResource;
    static from(
        urlOrFileResource: FileResource | FileReference | URL,
        content?: string | Uint8Array<ArrayBuffer>,
        encoding?: BufferEncoding,
        baseFilename?: string | undefined,
        gz?: boolean,
    ): CFileResource {
        if (CFileResource.isCFileResource(urlOrFileResource)) {
            if (content) {
                const { url, encoding, baseFilename, gz } = urlOrFileResource;
                return new CFileResource(url, content, encoding, baseFilename, gz);
            }
            return urlOrFileResource;
        }
        if (urlOrFileResource instanceof URL) {
            assert(content !== undefined);
            return new CFileResource(urlOrFileResource, content, encoding, baseFilename, gz);
        }
        if (content !== undefined) {
            const fileRef = urlOrFileResource;
            return new CFileResource(fileRef.url, content, fileRef.encoding, fileRef.baseFilename, fileRef.gz);
        }
        assert('content' in urlOrFileResource && urlOrFileResource.content !== undefined);
        const fileResource = urlOrFileResource;
        return new CFileResource(
            fileResource.url,
            fileResource.content,
            fileResource.encoding,
            fileResource.baseFilename,
            fileResource.gz,
        );
    }
}

export function fromFileResource(fileResource: FileResource, encoding?: BufferEncoding): TextFileResource {
    return CFileResource.from(encoding ? { ...fileResource, encoding } : fileResource);
}

export function renameFileResource(fileResource: FileResource, url: URL): FileResource {
    return CFileResource.from({ ...fileResource, url });
}
