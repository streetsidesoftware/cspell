import { Aff, AffWord } from './aff';
import * as Rx from 'rxjs/Rx';
export interface WordInfo {
    word: string;
    rules: string;
}
export declare class HunspellReader {
    affFile: string;
    dicFile: string;
    aff: Promise<Aff>;
    constructor(affFile: string, dicFile: string);
    /**
     * @internal
     */
    readDicEntries(aff: Aff): Rx.Observable<string>;
    /**
     * @internal
     */
    readDicWords(): Rx.Observable<WordInfo>;
    readWordsEx(): Rx.Observable<AffWord>;
    /**
     * @description Reads all the word combinations out of a hunspell dictionary.
     *
     */
    readWords(): Rx.Observable<string>;
}
