import { compareStats } from './common/stat.js';
import type { CSpellIO } from './CSpellIO.js';
import { ErrorNotImplemented } from './errors/errors.js';
import type { FileReference, FileResource, UrlOrReference } from './models/FileResource.js';
import type { Stats } from './models/Stats.js';

export class CSpellIOWeb implements CSpellIO {
    readFile(_uriOrFilename: string | URL): Promise<FileResource> {
        throw new ErrorNotImplemented('readFile');
    }
    readFileSync(_uriOrFilename: string | URL): FileResource {
        throw new ErrorNotImplemented('readFileSync');
    }
    writeFile(_uriOrFilename: UrlOrReference, _content: string | ArrayBufferView): Promise<FileReference> {
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
    toURL(_uriOrFilename: string | URL): URL {
        throw new ErrorNotImplemented('toURL');
    }
    uriBasename(_uriOrFilename: string | URL): string {
        throw new ErrorNotImplemented('uriBasename');
    }
    uriDirname(_uriOrFilename: string | URL): URL {
        throw new ErrorNotImplemented('uriDirname');
    }
}
