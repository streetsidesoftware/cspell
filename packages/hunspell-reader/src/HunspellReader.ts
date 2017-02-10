import {parseAffFileToAff} from './affReader';
import {Aff, AffWord} from './aff';
import {lineReader} from './fileReader';
import * as Rx from 'rxjs/Rx';

export interface WordInfo {
    word: string;
    rules: string;
}


export interface HunspellSrcInfo {
    aff: Aff;
    dic: Rx.Observable<string>;
}

export class HunspellReaderOld {

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


    readWordsRx(): Rx.Observable<AffWord> {
        const r = Rx.Observable.fromPromise(this.aff)
            .flatMap(aff => this.readDicEntries(aff)
                // .do(dicWord => console.log(dicWord))
                // .take(100)
                .flatMap(dicWord => aff.applyRulesToDicEntry(dicWord))
            );
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
            .map(line => {
                const [word, rules] = line.split('/', 2);
                return { word, rules };
            });
    }


    readWordsRx(): Rx.Observable<AffWord> {
        const r = this.src.dic
            .flatMap(dicWord => this.aff.applyRulesToDicEntry(dicWord));
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
        return lineReader(dicFile, aff.affInfo.SET)
            .skip(1)   // Skip the first line -- it's the number of words in the file context's.
        ;
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
