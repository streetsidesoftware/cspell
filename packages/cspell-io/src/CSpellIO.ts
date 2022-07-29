import { BufferEncoding } from './models/BufferEncoding';
import type { Stats } from './models';

export interface CSpellIO {
    readFile(uriOrFilename: string, encoding?: BufferEncoding): Promise<string>;
    readFileSync(uriOrFilename: string, encoding?: BufferEncoding): string;
    writeFile(uriOrFilename: string, content: string): Promise<void>;
    getStat(uriOrFilename: string): Promise<Stats>;
    getStatSync(uriOrFilename: string): Stats;
    compareStats(left: Stats, right: Stats): number;
}
