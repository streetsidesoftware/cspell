import {parseAffFileToAff} from './affReader';
import {Aff} from './aff';
import { genSequence, Sequence } from 'gensequence';
import { WordInfo } from './types';
import * as fs from 'fs-extra';

const defaultEncoding = 'UTF-8';

export interface WordInfo {
    word: string;
    rules: string;
}


export interface HunspellSrcData {
    aff: Aff;
    dic: string[];
}

export class IterableHunspellReader implements Iterable<string> {

    readonly aff: Aff;

    constructor(readonly src: HunspellSrcData) {
        this.aff = src.aff;
    }

    /**
     * @internal
     */
    dicWordsSeq(): Sequence<WordInfo> {
        return genSequence(this.src.dic)
            .map(line => {
                const [word, rules] = line.split('/', 2);
                return { word, rules };
            })
        ;
    }

    /**
     * iterates through the root words of the dictionary
     */
    iterateRootWords(): Iterable<string> {
        return this.seqRootWords();
    }

    iterateWords(): Iterable<string> {
        return this.seqWords();
    }

    [Symbol.iterator]() { return this.seqWords(); }

    /**
     * @internal
     */
    seqWords() {
        return genSequence(this.src.dic)
        .concatMap(dicWord => this.aff.applyRulesToDicEntry(dicWord))
        .map(w => w.word);
    }

    /**
     * @internal
     */
    seqRootWords() {
        return this.dicWordsSeq().map(w => w.word);
    }

    static async createFromFiles(affFile: string, dicFile: string) {
        const aff = await parseAffFileToAff(affFile);
        const dicFileContent = await fs.readFile(dicFile, aff.affInfo.SET || defaultEncoding);
        const dic = dicFileContent.split('\n')
            .slice(1) // The first entry is the count of entries.
            .filter(line => !!line);
        return new IterableHunspellReader({ aff, dic });
    }
}
