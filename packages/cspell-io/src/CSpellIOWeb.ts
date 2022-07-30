import { CSpellIO } from './CSpellIO';
import { ErrorNotImplemented } from './errors/ErrorNotImplemented';
import { compareStats } from './common/stat';
import type { Stats } from './models/Stats';
import type { TextFileResource } from './models/FileResource';

export class CSpellIOWeb implements CSpellIO {
    readFile(_uriOrFilename: string | URL): Promise<TextFileResource> {
        throw new ErrorNotImplemented('readFile');
    }
    readFileSync(_uriOrFilename: string | URL): TextFileResource {
        throw new ErrorNotImplemented('readFileSync');
    }
    writeFile(_uriOrFilename: string | URL, _content: string): Promise<void> {
        throw new ErrorNotImplemented('writeFile');
    }
    getStat(_uriOrFilename: string | URL): Promise<Stats> {
        throw new ErrorNotImplemented('getStat');
    }
    getStatSync(_uriOrFilename: string | URL): Stats {
        throw new ErrorNotImplemented('getStatSync');
    }
    compareStats(left: Stats, right: Stats): number {
        return compareStats(left, right);
    }
}
