import {parseAffFileToAff} from './affReader';
import {Aff, AffWord} from './aff';
import {lineReader} from './fileReader';
import * as Rx from 'rx';

export interface WordInfo {
    word: string;
    rules: string;
    // props: WordProperties;
}

export interface WordProperties {
    rules: string;
}

export class HunspellReader {

    public aff: Rx.Promise<Aff>;

    constructor(public affFile: string, public dicFile: string) {
        this.aff = parseAffFileToAff(affFile);
    }

    readDicEntries(): Rx.Observable<string> {
        return lineReader(this.dicFile);
    }


    readDicWords(): Rx.Observable<WordInfo> {
        return this.readDicEntries()
            .map(line => {
                const [word, rules] = line.split('/', 2);
                return { word, rules };
            });
    }

    readWords(): Rx.Observable<AffWord> {
        const r = this.readDicEntries()
            .concatMap(dicWord => this.aff.then(aff => aff.applyRulesToDicEntry(dicWord)))
            .concatMap(a => a)
            ;
        return r;
    }
}