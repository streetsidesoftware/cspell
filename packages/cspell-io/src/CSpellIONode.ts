import { isServiceResponseSuccess, ServiceBus } from '@cspell/cspell-service-bus';
import { compareStats } from './common/stat';
import { CSpellIO } from './CSpellIO';
import { ErrorNotImplemented } from './errors/ErrorNotImplemented';
import { registerHandlers } from './handlers/node/file';
import { Stats } from './models/Stats';
import { toURL } from './node/file/util';
import { RequestFsReadFile, RequestFsReadFileSync } from './requests';

export class CSpellIONode implements CSpellIO {
    constructor(readonly serviceBus = new ServiceBus()) {
        registerHandlers(serviceBus);
    }

    readFile(uriOrFilename: string): Promise<string> {
        const url = toURL(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsReadFile.create({ url }));
        if (!isServiceResponseSuccess(res)) {
            throw res.error || new ErrorNotImplemented('readFile');
        }
        return res.value;
    }
    readFileSync(uriOrFilename: string): string {
        const url = toURL(uriOrFilename);
        const res = this.serviceBus.dispatch(RequestFsReadFileSync.create({ url }));
        if (!isServiceResponseSuccess(res)) {
            throw res.error || new ErrorNotImplemented('readFileSync');
        }
        return res.value;
        throw new ErrorNotImplemented('readFileSync');
    }
    writeFile(_uriOrFilename: string, _content: string): Promise<void> {
        throw new ErrorNotImplemented('writeFile');
    }
    getStat(_uriOrFilename: string): Promise<Stats> {
        throw new ErrorNotImplemented('getStat');
    }
    getStatSync(_uriOrFilename: string): Stats {
        throw new ErrorNotImplemented('getStatSync');
    }
    compareStats(left: Stats, right: Stats): number {
        return compareStats(left, right);
    }
}
