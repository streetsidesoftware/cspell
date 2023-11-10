import type { BufferEncoding } from '../models/BufferEncoding.js';
import type { FileReference, UrlOrReference } from '../models/FileResource.js';
import { toURL } from '../node/file/util.js';

export class CFileReference implements FileReference {
    /**
     * Use to ensure the nominal type separation between CFileReference and FileReference
     * See: https://github.com/microsoft/TypeScript/wiki/FAQ#when-and-why-are-classes-nominal
     */
    private _?: undefined;
    constructor(
        readonly url: URL,
        readonly encoding?: BufferEncoding,
        readonly baseFilename?: string | undefined,
    ) {}

    static isCFileReference(obj: unknown): obj is CFileReference {
        return obj instanceof CFileReference;
    }

    static from(fileReference: FileReference): CFileReference;
    static from(url: URL, encoding?: BufferEncoding, baseFilename?: string | undefined): CFileReference;
    static from(fileReference: FileReference | URL, encoding?: BufferEncoding, baseFilename?: string): CFileReference {
        if (CFileReference.isCFileReference(fileReference)) return fileReference;
        if (fileReference instanceof URL) return new CFileReference(fileReference, encoding, baseFilename);
        return new CFileReference(fileReference.url, fileReference.encoding, fileReference.baseFilename);
    }
}

export function toFileReference(file: UrlOrReference, encoding?: BufferEncoding, baseFilename?: string): FileReference {
    const fileReference = typeof file === 'string' ? toURL(file) : file;
    if (fileReference instanceof URL) return new CFileReference(fileReference, encoding, baseFilename);
    return CFileReference.from(fileReference);
}

export function isFileReference(ref: UrlOrReference): ref is FileReference {
    return CFileReference.isCFileReference(ref) || (!(ref instanceof URL) && typeof ref !== 'string');
}
