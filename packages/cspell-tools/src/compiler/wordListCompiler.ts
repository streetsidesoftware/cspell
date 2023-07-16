import { opAppend, opMap, pipe } from '@cspell/cspell-pipe/sync';
import * as Trie from 'cspell-trie-lib';
import { mkdir } from 'fs/promises';
import * as path from 'path';

import type { CompileOptions } from './CompileOptions.js';
import { writeSeqToFile } from './fileWriter.js';
import { getLogger } from './logger.js';
import { normalizeTargetWords } from './wordListParser.js';

const mkdirp = async (p: string) => {
    await mkdir(p, { recursive: true });
};

// Indicate that a word list has already been processed.
const wordListHeader = `
# cspell-tools: keep-case no-split
`;
const wordListHeaderLines = wordListHeader.split('\n').map((a) => a.trim());

export async function compileWordList(
    lines: Iterable<string>,
    destFilename: string,
    options: CompileOptions,
): Promise<void> {
    const finalLines = normalize(lines, options);

    const finalSeq = pipe(wordListHeaderLines, opAppend(finalLines));

    return createWordListTarget(destFilename)(finalSeq);
}

function normalize(lines: Iterable<string>, options: CompileOptions): Iterable<string> {
    const filter = normalizeTargetWords(options);

    const iter = pipe(lines, filter);
    if (!options.sort) return iter;

    const result = new Set(iter);
    return [...result].sort();
}

function createWordListTarget(destFilename: string): (seq: Iterable<string>) => Promise<void> {
    const target = createTarget(destFilename);
    return (seq: Iterable<string>) =>
        target(
            pipe(
                seq,
                opMap((a) => a + '\n'),
            ),
        );
}

function createTarget(destFilename: string): (seq: Iterable<string>) => Promise<void> {
    const destDir = path.dirname(destFilename);
    const pDir = mkdirp(destDir);
    return async (seq: Iterable<string>) => {
        await pDir;
        await writeSeqToFile(seq, destFilename);
    };
}

// function sort(words: Iterable<string>): Iterable<string> {
//     return [...words].sort();
// }

export interface TrieOptions {
    base?: number;
    trie3?: boolean;
    trie4?: boolean;
}

export interface CompileTrieOptions extends CompileOptions, TrieOptions {}

export async function compileTrie(
    words: Iterable<string>,
    destFilename: string,
    options: CompileTrieOptions,
): Promise<void> {
    await createTrieTarget(destFilename, options)(words);
}

function createTrieTarget(destFilename: string, options: TrieOptions): (words: Iterable<string>) => Promise<void> {
    const target = createTarget(destFilename);
    return async (words: Iterable<string>) => {
        const log = getLogger();
        log('Reading Words into Trie');
        const base = options.base ?? 32;
        const version = options.trie4 ? 4 : options.trie3 ? 3 : 1;
        const root = Trie.buildTrie(words).root;
        log('Reduce duplicate word endings');
        const trie = Trie.consolidate(root);
        log(`Writing to file ${path.basename(destFilename)}`);
        await target(
            Trie.serializeTrie(trie, {
                base,
                comment: 'Built by cspell-tools.',
                version,
            }),
        );
        log(`Done writing to file ${path.basename(destFilename)}`);
    };
}

export const __testing__ = {
    wordListHeader,
};
