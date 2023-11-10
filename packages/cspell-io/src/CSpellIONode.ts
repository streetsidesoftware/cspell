import { isServiceResponseSuccess, ServiceBus } from '@cspell/cspell-service-bus';

import { isFileReference, toFileReference } from './common/CFileReference.js';
import { compareStats } from './common/stat.js';
import type { CSpellIO } from './CSpellIO.js';
import { ErrorNotImplemented } from './errors/errors.js';
import { registerHandlers } from './handlers/node/file.js';
import type { BufferEncoding } from './models/BufferEncoding.js';
import type { FileResource, UrlOrReference } from './models/FileResource.js';
import type { Stats } from './models/Stats.js';
import { toURL, urlBasename, urlDirname } from './node/file/util.js';
import {
    RequestFsReadFile,
    RequestFsReadFileSync,
    RequestFsStat,
    RequestFsStatSync,
    RequestFsWriteFile,
} from './requests/index.js';

let defaultCSpellIONode: CSpellIO | undefined = undefined;

export class CSpellIONode implements CSpellIO {
    constructor(readonly serviceBus = new ServiceBus()) {
        registerHandlers(serviceBus);
    }

    readFile(uriOrFilename: UrlOrReference, encoding?: BufferEncoding): Promise<FileResource> {
        const ref = toFileReference(uriOrFilename, encoding);
        const res = this.serviceBus.dispatch(RequestFsReadFile.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'readFile');
        }
        return res.value;
    }
    readFileSync(uriOrFilename: UrlOrReference, encoding?: BufferEncoding): FileResource {
        const ref = toFileReference(uriOrFilename, encoding);
        const res = this.serviceBus.dispatch(RequestFsReadFileSync.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'readFileSync');
        }
        return res.value;
    }
    writeFile(fileResource: FileResource): Promise<void> {
        const res = this.serviceBus.dispatch(RequestFsWriteFile.create(fileResource));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'writeFile');
        }
        return res.value;
    }
    getStat(uriOrFilename: UrlOrReference): Promise<Stats> {
        const ref = toFileReference(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsStat.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'getStat');
        }
        return res.value;
    }
    getStatSync(uriOrFilename: UrlOrReference): Stats {
        const ref = toFileReference(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsStatSync.create(ref));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'getStatSync');
        }
        return res.value;
    }
    compareStats(left: Stats, right: Stats): number {
        return compareStats(left, right);
    }
    toURL(uriOrFilename: UrlOrReference): URL {
        if (isFileReference(uriOrFilename)) return uriOrFilename.url;
        return toURL(uriOrFilename);
    }
    uriBasename(uriOrFilename: UrlOrReference): string {
        return urlBasename(this.toURL(uriOrFilename));
    }
    uriDirname(uriOrFilename: UrlOrReference): URL {
        return urlDirname(this.toURL(uriOrFilename));
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
