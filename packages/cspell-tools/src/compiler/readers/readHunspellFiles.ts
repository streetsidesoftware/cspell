import { pipe } from '@cspell/cspell-pipe/sync';
import { COMPOUND_FIX, FORBID_PREFIX } from 'cspell-trie-lib';
import type { AffWord } from 'hunspell-reader';
import * as HR from 'hunspell-reader';

import type { AnnotatedWord, BaseReader, ReaderOptions } from './ReaderOptions.js';
import { regHunspellFile } from './regHunspellFile.js';

const DEDUPE_SIZE = 1000;

export async function readHunspellFiles(filename: string, options: ReaderOptions): Promise<BaseReader> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = await HR.IterableHunspellReader.createFromFiles(affFile, dicFile);
    reader.maxDepth = options.maxDepth !== undefined ? options.maxDepth : reader.maxDepth;

    const words = pipe(reader.seqAffWords(), _mapAffWords, dedupeAndSort);

    return {
        type: 'Hunspell',
        size: reader.dic.length,
        lines: words,
    };
}
function* dedupeAndSort(words: Iterable<AnnotatedWord>): Iterable<AnnotatedWord> {
    const buffer = new Set<string>();

    function flush() {
        const result = [...buffer].sort();
        buffer.clear();
        return result;
    }

    for (const word of words) {
        buffer.add(word);
        if (buffer.size >= DEDUPE_SIZE) {
            yield* flush();
        }
    }
    yield* flush();
}
function* _mapAffWords(affWords: Iterable<AffWord>): Iterable<AnnotatedWord> {
    const hasSpecial = /[~+!]/;
    for (const affWord of affWords) {
        const { word, flags } = affWord;
        // For now do not include words with special characters.
        if (hasSpecial.test(word)) continue;
        const compound = flags.isCompoundForbidden ? '' : COMPOUND_FIX;
        const forbid = flags.isForbiddenWord ? FORBID_PREFIX : '';
        if (!forbid) {
            if (flags.canBeCompoundBegin || flags.isCompoundPermitted) yield word + compound;
            if (flags.canBeCompoundEnd || flags.isCompoundPermitted) yield compound + word;
            if (flags.canBeCompoundMiddle || flags.isCompoundPermitted) yield compound + word + compound;
            if (!flags.isOnlyAllowedInCompound) yield word;
        } else {
            yield forbid + word;
        }
    }
}
