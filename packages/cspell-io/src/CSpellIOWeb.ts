import { CSpellIO } from './CSpellIO';
import { ErrorNotImplemented } from './errors/ErrorNotImplemented';
import { compareStats } from './common/stat';
import { Stats } from './models/Stats';

export class CSpellIOWeb implements CSpellIO {
    readFile(_uriOrFilename: string): Promise<string> {
        throw new ErrorNotImplemented('readFile');
    }
    readFileSync(_uriOrFilename: string): string {
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
