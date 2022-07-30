import type { Stats } from './models';
import { BufferEncoding } from './models/BufferEncoding';
import type { TextFileResource } from './models/FileResource';

export interface CSpellIO {
    readFile(uriOrFilename: string | URL, encoding?: BufferEncoding): Promise<TextFileResource>;
    readFileSync(uriOrFilename: string | URL, encoding?: BufferEncoding): TextFileResource;
    writeFile(uriOrFilename: string | URL, content: string): Promise<void>;
    getStat(uriOrFilename: string | URL): Promise<Stats>;
    getStatSync(uriOrFilename: string | URL): Stats;
    compareStats(left: Stats, right: Stats): number;
}
