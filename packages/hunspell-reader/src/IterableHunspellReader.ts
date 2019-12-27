import {parseAffFileToAff} from './affReader';
import {Aff} from './aff';
import { genSequence, Sequence } from 'gensequence';
import { WordInfo } from './types';
import * as fs from 'fs-extra';
import { decode } from 'iconv-lite';

const defaultEncoding = 'UTF-8';

export { WordInfo } from './types';

export interface HunspellSrcData {
    /** The Aff rules to use with the dictionary entries */
    aff: Aff;
    /** the hunspell dictionary entries complete with affix flags */
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

    /** the number of .dic entries */
    get size(): number {
        return this.src.dic.length;
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

    /**
     * Iterator for all the words in the dictionary. The words are in the order found in the .dic after the
     * transformations have been applied. No filtering is done based upon the AFF flags.
     */
    [Symbol.iterator]() { return this.seqWords(); }

    /**
     * create an iterable sequence of the words in the dictionary.
     *
     * @param tapPreApplyRules -- optional function to be called before rules are applied to a word.
     *                            It is mostly used for monitoring progress in combination with `size`.
     */
    seqAffWords(tapPreApplyRules?: (w: string, index: number) => any, maxDepth?: number) {
        const seq = genSequence(this.src.dic);
        let count = 0;
        const dicWords = tapPreApplyRules ? seq.map(a => (tapPreApplyRules(a, count++), a)) : seq;
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
