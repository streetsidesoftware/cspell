import {parseAffFileToAff} from './affReader';
import {Aff} from './aff';
import { genSequence, Sequence } from 'gensequence';
import { WordInfo } from './types';
import * as fs from 'fs-extra';
import { decode } from 'iconv-lite';

const defaultEncoding = 'UTF-8';

export { WordInfo } from './types';

export interface HunspellSrcData {
    aff: Aff;
    dic: string[];
}

export class IterableHunspellReader implements Iterable<string> {

    readonly aff: Aff;

    constructor(readonly src: HunspellSrcData) {
        this.aff = src.aff;
    }

    get dic() {
        return this.src.dic;
    }

    set maxDepth(value: number) {
        this.aff.maxSuffixDepth = value;
    }

    get maxDepth(): number {
        return this.aff.maxSuffixDepth;
    }

    /**
     * @internal
     */
    dicWordsSeq(): Sequence<WordInfo> {
        return genSequence(this.src.dic)
            .map(line => {
                const [word, rules] = line.split('/', 2);
                return { word, rules, prefixes: [], suffixes: [] };
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
     * create an iterable sequence of the words in the dictionary.
     *
     * @param tapPreApplyRules -- optional function to be called before rules are applied to a word.
     *                            It is mostly used for monitoring progress.
     */
    seqAffWords(tapPreApplyRules?: (w: string) => any, maxDepth?: number) {
        const seq = genSequence(this.src.dic);
        const dicWords = tapPreApplyRules ? seq.map(a => (tapPreApplyRules(a), a)) : seq;
        return dicWords
        .filter(a => !!a.trim())
        .concatMap(dicWord => this.aff.applyRulesToDicEntry(dicWord, maxDepth));
    }

    /**
     * @internal
     */
    seqWords() {
        return this.seqAffWords().map(w => w.word);
    }

    /**
     * @internal
     */
    seqRootWords() {
        return this.dicWordsSeq().map(w => w.word);
    }

    static async createFromFiles(affFile: string, dicFile: string) {
        const aff = await parseAffFileToAff(affFile);
        const buffer = await fs.readFile(dicFile);
        const dicFileContent = decode(buffer, aff.affInfo.SET || defaultEncoding);
        const dic = dicFileContent.split('\n')
            .slice(1) // The first entry is the count of entries.
            .filter(line => !!line);
        return new IterableHunspellReader({ aff, dic });
    }
}
