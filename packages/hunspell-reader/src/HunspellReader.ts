import {parseAffFileToAff} from './affReader';
import {Aff, AffWord} from './aff';
import {lineReader} from './fileReader';
import * as Rx from 'rxjs/Rx';
import * as monitor from './monitor';

export interface WordInfo {
    word: string;
    rules: string;
}


export interface HunspellSrcInfo {
    aff: Aff;
    dic: Rx.Observable<string>;
}

export class HunspellReader {

    readonly aff: Aff;

    constructor(readonly src: HunspellSrcInfo) {
        this.aff = src.aff;
    }


    /**
     * @internal
     */
    readDicWords(): Rx.Observable<WordInfo> {
        return this.src.dic
            .skip(1) // The first entry is the count of entries.
            .map(line => {
                const [word, rules] = line.split('/', 2);
                return { word, rules };
            });
    }


    readWordsRx(): Rx.Observable<AffWord> {
        const r = this.src.dic
            .do(() => monitor.incCounter('cntIn'))
            .flatMap(dicWord => this.aff.applyRulesToDicEntry(dicWord))
            .do(() => monitor.incCounter('cntOut'))
            ;
        return r;
    }

    /**
     * Reads all the word combinations out of a hunspell dictionary.
     */
    readWords(): Rx.Observable<string> {
        return this.readWordsRx()
            .map(affWord => affWord.word);
    }

    /**
     * Reads the words in the dictionary without applying the transformation rules.
     */
    readRootWords(): Rx.Observable<string> {
        return this.readDicWords()
            .map(w => w.word);
    }

    /**
     * @internal
     */
    private static readDicEntries(aff: Aff, dicFile: string): Rx.Observable<string> {
        return lineReader(dicFile, aff.affInfo.SET);
    }

    static createFromFiles(affFile: string, dicFile: string) {
        return parseAffFileToAff(affFile)
            .then(aff => {
                return new HunspellSrcInfoWithGetDic(aff, () => HunspellReader.readDicEntries(aff, dicFile));
            })
            .then(src => new HunspellReader(src));
    }
}

export class HunspellSrcInfoWithGetDic implements HunspellSrcInfo {
    constructor(public aff: Aff, readonly getDic: () => Rx.Observable<string>) {}
    get dic(): Rx.Observable<string> {
        return this.getDic();
    }
}
