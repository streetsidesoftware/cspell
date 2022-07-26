import type { Stats } from './models';

export interface CSpellIO {
    readFile(uriOrFilename: string): Promise<string>;
    readFileSync(uriOrFilename: string): string;
    writeFile(uriOrFilename: string, content: string): Promise<void>;
    getStat(uriOrFilename: string): Promise<Stats>;
    getStatSync(uriOrFilename: string): Stats;
    compareStats(left: Stats, right: Stats): number;
}
