import * as fs from 'node:fs/promises';

import type { Sequence } from 'gensequence';
import { genSequence } from 'gensequence';
import pkgIconvLite from 'iconv-lite';

import type { AffWord } from './affDef.js';
import type { Aff } from './affLegacy.js';
import { parseAffFileToAffLegacy } from './affReader.js';
import type { WordInfo } from './types.js';
import { filterOrderedList } from './util.js';

const { decode } = pkgIconvLite;

// eslint-disable-next-line unicorn/text-encoding-identifier-case
const defaultEncoding = 'UTF-8';

export { WordInfo } from './types.js';

export interface HunspellSrcData {
    /** The Aff rules to use with the dictionary entries */
    aff: Aff;
    /** the hunspell dictionary entries complete with affix flags */
    dic: string[];
}

export class IterableHunspellReaderLegacy implements Iterable<string> {
    readonly aff: Aff;

    constructor(readonly src: HunspellSrcData) {
        this.aff = src.aff;
    }

    get dic(): string[] {
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
    [Symbol.iterator](): Sequence<string> {
        return this.wholeWords();
    }

    /**
     * create an iterable sequence of the words in the dictionary.
     *
     * @param tapPreApplyRules -- optional function to be called before rules are applied to a word.
     *                            It is mostly used for monitoring progress in combination with `size`.
     */
    seqAffWords(tapPreApplyRules?: (dicEntry: string, index: number) => void, maxDepth?: number): Sequence<AffWord> {
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
        maxDepth?: number,
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
    seqWords(): Sequence<string> {
        return this.seqAffWords()
            .map((w) => w.word)
            .filter(createMatchingWordsFilter());
    }

    /**
     * Returns an iterable that will only return stand alone words.
     */
    wholeWords(): Sequence<string> {
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
    seqRootWords(): Sequence<string> {
        return this.dicWordsSeq().map((w) => w.word);
    }

    /**
     *
     * @param affFile - path to aff file.
     * @param dicFile - path to dic file.
     * @returns IterableHunspellReader
     */
    static async createFromFiles(affFile: string, dicFile: string): Promise<IterableHunspellReaderLegacy> {
        const aff = await parseAffFileToAffLegacy(affFile, defaultEncoding);
        const buffer = await fs.readFile(dicFile);
        const dicFileContent = decode(buffer, aff.affInfo.SET);
        const dic = dicFileContent
            .split('\n')
            .slice(1) // The first entry is the count of entries.
            .map((a) => a.trim())
            .filter((line) => !!line);
        return new IterableHunspellReaderLegacy({ aff, dic });
    }
}

export function createMatchingWordsFilter(): (t: string) => boolean {
    return filterOrderedList<string>((a, b) => a !== b);
}
