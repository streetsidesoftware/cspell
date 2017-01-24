import {parseAffFileToAff} from './affReader';
import {Aff, AffWord} from './aff';
import {lineReader} from './fileReader';
import * as Rx from 'rxjs/Rx';

export interface WordInfo {
    word: string;
    rules: string;
}

export class HunspellReader {

    public aff: Promise<Aff>;

    constructor(public affFile: string, public dicFile: string) {
        this.aff = parseAffFileToAff(affFile);
    }

    /**
     * @internal
     */
    readDicEntries(aff: Aff): Rx.Observable<string> {
        return lineReader(this.dicFile, aff.affInfo.SET)
            .skip(1)   // Skip the first line -- it's the number of words in the file context's.
        ;
    }


    /**
     * @internal
     */
    readDicWords(): Rx.Observable<WordInfo> {
        return Rx.Observable.fromPromise(this.aff)
            .flatMap(aff => this.readDicEntries(aff))
            .map(line => {
                const [word, rules] = line.split('/', 2);
                return { word, rules };
            });
    }


    readWordsEx(): Rx.Observable<AffWord> {
        const r = Rx.Observable.fromPromise(this.aff)
            .concatMap(aff => this.readDicEntries(aff)
                .concatMap(dicWord => aff.applyRulesToDicEntry(dicWord))
            );
        return r;
    }

    /**
     * @description Reads all the word combinations out of a hunspell dictionary.
     *
     */
    readWords(): Rx.Observable<string> {
        return this.readWordsEx()
            .map(affWord => affWord.word);
    }
}
