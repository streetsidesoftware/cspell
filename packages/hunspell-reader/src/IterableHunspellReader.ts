import * as fs from 'fs-extra';
import { genSequence, Sequence } from 'gensequence';
import { decode } from 'iconv-lite';
import { Aff } from './aff';
import type { AffWord } from './affDef';
import { parseAffFileToAff } from './affReader';
import { WordInfo } from './types';
import { filterOrderedList } from './util';

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
        return genSequence(this.src.dic).map((line) => {
            const [word, rules] = line.split('/', 2);
            return { word, rules, prefixes: [], suffixes: [] };
        });
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
     * transformations have been applied. Forbidden and CompoundOnly words are filtered out.
     */
    [Symbol.iterator]() {
        return this.wholeWords();
    }

    /**
     * create an iterable sequence of the words in the dictionary.
     *
     * @param tapPreApplyRules -- optional function to be called before rules are applied to a word.
     *                            It is mostly used for monitoring progress in combination with `size`.
     */
    seqAffWords(tapPreApplyRules?: (dicEntry: string, index: number) => void, maxDepth?: number) {
        return this.seqTransformDictionaryEntries(tapPreApplyRules, maxDepth).concatMap((a) => a);
    }

    /**
     * create an iterable sequence of the words in the dictionary.
     *
     * @param tapPreApplyRules -- optional function to be called before rules are applied to a word.
     *                            It is mostly used for monitoring progress in combination with `size`.
     */
    seqTransformDictionaryEntries(
        tapPreApplyRules?: (dicEntry: string, index: number) => void,
        maxDepth?: number
    ): Sequence<AffWord[]> {
        const seq = genSequence(this.src.dic);
        let count = 0;
        const dicWords = tapPreApplyRules ? seq.map((a) => (tapPreApplyRules(a, count++), a)) : seq;
        return dicWords.map((dicWord) => this.aff.applyRulesToDicEntry(dicWord, maxDepth));
    }

    /**
     * Iterator for all the words in the dictionary. The words are in the order found in the .dic after the
     * transformations have been applied. Forbidden and CompoundOnly ARE INCLUDED.
     *
     * @internal
     */
    seqWords() {
        return this.seqAffWords()
            .map((w) => w.word)
            .filter(createMatchingWordsFilter());
    }

    /**
     * Returns an iterable that will only return stand alone words.
     */
    wholeWords() {
        return (
            this.seqAffWords()
                // Filter out words that are forbidden or only allowed in Compounds.
                .filter((w) => !w.flags.isForbiddenWord && !w.flags.isOnlyAllowedInCompound)
                .map((w) => w.word)
                .filter(createMatchingWordsFilter())
        );
    }

    /**
     * @internal
     */
    seqRootWords() {
        return this.dicWordsSeq().map((w) => w.word);
    }

    /**
     *
     * @param affFile - path to aff file.
     * @param dicFile - path to dic file.
     * @returns IterableHunspellReader
     */
    static async createFromFiles(affFile: string, dicFile: string) {
        const aff = await parseAffFileToAff(affFile, defaultEncoding);
        const buffer = await fs.readFile(dicFile);
        const dicFileContent = decode(buffer, aff.affInfo.SET);
        const dic = dicFileContent
            .split('\n')
            .slice(1) // The first entry is the count of entries.
            .map((a) => a.trim())
            .filter((line) => !!line);
        return new IterableHunspellReader({ aff, dic });
    }
}

export function createMatchingWordsFilter() {
    return filterOrderedList<string>((a, b) => a !== b);
}
