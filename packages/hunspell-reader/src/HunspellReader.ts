import {parseAffFileToAff} from './affReader';
import {Aff, AffWord} from './aff';
import {lineReader} from './fileReader';
import {Observable} from 'rxjs';
import {map, skip, tap, flatMap} from 'rxjs/operators';
import * as monitor from './monitor';

export interface WordInfo {
    word: string;
    rules: string;
}


export interface HunspellSrcInfo {
    aff: Aff;
    dic: Observable<string>;
}

export class HunspellReader {

    readonly aff: Aff;

    constructor(readonly src: HunspellSrcInfo) {
        this.aff = src.aff;
    }


    /**
     * @internal
     */
    readDicWords(): Observable<WordInfo> {
        return this.src.dic.pipe(
            skip(1), // The first entry is the count of entries.
            map(line => {
                const [word, rules] = line.split('/', 2);
                return { word, rules };
            }),
        );
    }


    readWordsRx(): Observable<AffWord> {
        const r = this.src.dic.pipe(
            tap(() => monitor.incCounter('cntIn')),
            flatMap(dicWord => this.aff.applyRulesToDicEntry(dicWord)),
            tap(() => monitor.incCounter('cntOut')),
        );
        return r;
    }

    /**
     * Reads all the word combinations out of a hunspell dictionary.
     */
    readWords(): Observable<string> {
        return this.readWordsRx()
            .pipe(map(affWord => affWord.word));
    }

    /**
     * Reads the words in the dictionary without applying the transformation rules.
     */
    readRootWords(): Observable<string> {
        return this.readDicWords()
            .pipe(map(w => w.word));
    }

    /**
     * @internal
     */
    private static readDicEntries(aff: Aff, dicFile: string): Observable<string> {
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
    constructor(public aff: Aff, readonly getDic: () => Observable<string>) {}
    get dic(): Observable<string> {
        return this.getDic();
    }
}
