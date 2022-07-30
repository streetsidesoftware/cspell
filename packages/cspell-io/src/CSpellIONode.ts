import { isServiceResponseSuccess, ServiceBus } from '@cspell/cspell-service-bus';
import { compareStats } from './common/stat';
import { CSpellIO } from './CSpellIO';
import { ErrorNotImplemented } from './errors/ErrorNotImplemented';
import { registerHandlers } from './handlers/node/file';
import type { TextFileResource } from './models/FileResource';
import type { Stats } from './models/Stats';
import { toURL } from './node/file/util';
import {
    RequestFsReadFile,
    RequestFsReadFileSync,
    RequestFsStat,
    RequestFsStatSync,
    RequestFsWriteFile,
} from './requests';

export class CSpellIONode implements CSpellIO {
    constructor(readonly serviceBus = new ServiceBus()) {
        registerHandlers(serviceBus);
    }

    readFile(uriOrFilename: string | URL, encoding: BufferEncoding = 'utf8'): Promise<TextFileResource> {
        const url = toURL(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsReadFile.create({ url, encoding }));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'readFile');
        }
        return res.value;
    }
    readFileSync(uriOrFilename: string | URL, encoding: BufferEncoding = 'utf8'): TextFileResource {
        const url = toURL(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsReadFileSync.create({ url, encoding }));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'readFileSync');
        }
        return res.value;
    }
    writeFile(uriOrFilename: string | URL, content: string): Promise<void> {
        const url = toURL(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsWriteFile.create({ url, content }));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'writeFile');
        }
        return res.value;
    }
    getStat(uriOrFilename: string | URL): Promise<Stats> {
        const url = toURL(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsStat.create({ url }));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'getStat');
        }
        return res.value;
    }
    getStatSync(uriOrFilename: string | URL): Stats {
        const url = toURL(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsStatSync.create({ url }));
        if (!isServiceResponseSuccess(res)) {
            throw genError(res.error, 'getStatSync');
        }
        return res.value;
    }
    compareStats(left: Stats, right: Stats): number {
        return compareStats(left, right);
    }
}

function genError(err: Error | undefined, alt: string): Error {
    return err || new ErrorNotImplemented(alt);
}
