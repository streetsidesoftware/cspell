import type { BufferEncoding } from '../models/BufferEncoding.js';
import type { FileReference, UrlOrReference } from '../models/FileResource.js';
import { toFileURL } from '../node/file/url.js';

export class CFileReference implements FileReference {
    /**
     * Use to ensure the nominal type separation between CFileReference and FileReference
     * See: https://github.com/microsoft/TypeScript/wiki/FAQ#when-and-why-are-classes-nominal
     */
    private _?: undefined;
    readonly gz: boolean | undefined;

    constructor(
        readonly url: URL,
        readonly encoding: BufferEncoding | undefined,
        readonly baseFilename: string | undefined,
        gz: boolean | undefined,
    ) {
        this.gz = gz ?? (baseFilename?.endsWith('.gz') || undefined) ?? (url.pathname.endsWith('.gz') || undefined);
    }

    static isCFileReference(obj: unknown): obj is CFileReference {
        return obj instanceof CFileReference;
    }

    static from(fileReference: FileReference): CFileReference;
    static from(
        url: URL,
        encoding?: BufferEncoding,
        baseFilename?: string | undefined,
        gz?: boolean | undefined,
    ): CFileReference;
    static from(
        fileReference: FileReference | URL,
        encoding?: BufferEncoding,
        baseFilename?: string,
        gz?: boolean | undefined,
    ): CFileReference {
        if (CFileReference.isCFileReference(fileReference)) return fileReference;
        if (fileReference instanceof URL) return new CFileReference(fileReference, encoding, baseFilename, gz);
        return new CFileReference(
            fileReference.url,
            fileReference.encoding,
            fileReference.baseFilename,
            fileReference.gz,
        );
    }

    public toJson() {
        return {
            url: this.url.href,
            encoding: this.encoding,
            baseFilename: this.baseFilename,
            gz: this.gz,
        };
    }
}

/**
 *
 * @param file - a URL, file path, or FileReference
 * @param encoding - optional encoding used to decode the file.
 * @param baseFilename - optional base filename used with data URLs.
 * @param gz - optional flag to indicate if the file is gzipped.
 * @returns a FileReference
 */
export function toFileReference(
    file: UrlOrReference,
    encoding?: BufferEncoding,
    baseFilename?: string,
    gz?: boolean | undefined,
): FileReference {
    const fileReference = typeof file === 'string' ? toFileURL(file) : file;
    if (fileReference instanceof URL) return new CFileReference(fileReference, encoding, baseFilename, gz);
    return CFileReference.from(fileReference);
}

export function isFileReference(ref: UrlOrReference): ref is FileReference {
    return CFileReference.isCFileReference(ref) || (!(ref instanceof URL) && typeof ref !== 'string');
}

export function renameFileReference(ref: FileReference, newUrl: URL): FileReference {
    return new CFileReference(newUrl, ref.encoding, ref.baseFilename, ref.gz);
}
