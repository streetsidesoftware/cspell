import { assert } from '../errors/assert.js';
import type { BufferEncoding } from '../models/BufferEncoding.js';
import type { FileResource, FileResourceBase } from '../models/FileResource.js';
import { decode } from './encode-decode.js';

export class CFileResource implements FileResource {
    private _text?: string;

    constructor(
        readonly url: URL,
        readonly content: string | ArrayBufferView,
        readonly encoding?: BufferEncoding,
        readonly baseFilename?: string | undefined,
        readonly gz?: boolean,
    ) {}

    getText(): string {
        if (this._text !== undefined) return this._text;
        const text = typeof this.content === 'string' ? this.content : decode(this.content, this.encoding);
        this._text = text;
        return text;
    }

    static isCFileResource(obj: unknown): obj is CFileResource {
        return obj instanceof CFileResource;
    }

    static from(fileResource: FileResourceBase): CFileResource;
    static from(
        url: URL,
        content: string | ArrayBufferView,
        baseFilename?: string | undefined,
        gz?: boolean,
        encoding?: BufferEncoding,
    ): CFileResource;
    static from(
        urlOrFileResource: FileResourceBase | URL,
        content?: string | ArrayBufferView,
        baseFilename?: string | undefined,
        gz?: boolean,
        encoding?: BufferEncoding,
    ): CFileResource {
        if (CFileResource.isCFileResource(urlOrFileResource)) return urlOrFileResource;
        if (urlOrFileResource instanceof URL) {
            assert(content !== undefined);
            return new CFileResource(urlOrFileResource, content, encoding, baseFilename, gz);
        }
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
