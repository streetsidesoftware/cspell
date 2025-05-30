import { isServiceResponseSuccess, ServiceBus } from '@cspell/cspell-service-bus';

import { isFileReference, toFileReference, toFileResourceRequest } from './common/CFileReference.js';
import { CFileResource } from './common/CFileResource.js';
import { compareStats } from './common/stat.js';
import type { CSpellIO, ReadFileOptionsOrEncoding } from './CSpellIO.js';
import { toReadFileOptions } from './CSpellIO.js';
import { ErrorNotImplemented } from './errors/errors.js';
import { registerHandlers } from './handlers/node/file.js';
import type {
    BufferEncoding,
    DirEntry,
    FileReference,
    Stats,
    TextFileResource,
    UrlOrReference,
} from './models/index.js';
import { toFileURL, toURL, urlBasename, urlDirname } from './node/file/url.js';
import {
    RequestFsReadFile,
    RequestFsReadFileSync,
    RequestFsStat,
    RequestFsStatSync,
    RequestFsWriteFile,
} from './requests/index.js';
import { RequestFsReadDirectory } from './requests/RequestFsReadDirectory.js';

let defaultCSpellIONode: CSpellIO | undefined = undefined;

export class CSpellIONode implements CSpellIO {
    constructor(readonly serviceBus: ServiceBus = new ServiceBus()) {
        registerHandlers(serviceBus);
    }

    readFile(urlOrFilename: UrlOrReference, options?: ReadFileOptionsOrEncoding): Promise<TextFileResource> {
        const readOptions = toReadFileOptions(options);
        const ref = toFileResourceRequest(urlOrFilename, readOptions?.encoding, readOptions?.signal);
        const res = this.serviceBus.dispatch(RequestFsReadFile.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'readFile');
        }
        return res.value;
    }
    readDirectory(urlOrFilename: string | URL): Promise<DirEntry[]> {
        const ref = toFileReference(urlOrFilename);
        const res = this.serviceBus.dispatch(RequestFsReadDirectory.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'readDirectory');
        }
        return res.value;
    }
    readFileSync(urlOrFilename: UrlOrReference, encoding?: BufferEncoding): TextFileResource {
        const ref = toFileReference(urlOrFilename, encoding);
        const res = this.serviceBus.dispatch(RequestFsReadFileSync.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'readFileSync');
        }
        return res.value;
    }
    writeFile(urlOrFilename: UrlOrReference, content: string | ArrayBufferView): Promise<FileReference> {
        const ref = toFileReference(urlOrFilename);
        const fileResource = CFileResource.from(ref, content);
        const res = this.serviceBus.dispatch(RequestFsWriteFile.create(fileResource));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'writeFile');
        }
        return res.value;
    }
    getStat(urlOrFilename: UrlOrReference): Promise<Stats> {
        const ref = toFileReference(urlOrFilename);
        const res = this.serviceBus.dispatch(RequestFsStat.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'getStat');
        }
        return res.value;
    }
    getStatSync(urlOrFilename: UrlOrReference): Stats {
        const ref = toFileReference(urlOrFilename);
        const res = this.serviceBus.dispatch(RequestFsStatSync.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'getStatSync');
        }
        return res.value;
    }
    compareStats(left: Stats, right: Stats): number {
        return compareStats(left, right);
    }
    toURL(urlOrFilename: UrlOrReference, relativeTo?: string | URL): URL {
        if (isFileReference(urlOrFilename)) return urlOrFilename.url;
        return toURL(urlOrFilename, relativeTo);
    }
    toFileURL(urlOrFilename: UrlOrReference, relativeTo?: string | URL): URL {
        if (isFileReference(urlOrFilename)) return urlOrFilename.url;
        return toFileURL(urlOrFilename, relativeTo);
    }
    urlBasename(urlOrFilename: UrlOrReference): string {
        return urlBasename(this.toURL(urlOrFilename));
    }
    urlDirname(urlOrFilename: UrlOrReference): URL {
        return urlDirname(this.toURL(urlOrFilename));
    }
}

function genError(err: Error | undefined, alt: string): Error {
    return err || new ErrorNotImplemented(alt);
}

export function getDefaultCSpellIO(): CSpellIO {
    if (defaultCSpellIONode) return defaultCSpellIONode;

    const cspellIO = new CSpellIONode();

    defaultCSpellIONode = cspellIO;

    return cspellIO;
}
