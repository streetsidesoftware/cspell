import { mkdir } from 'node:fs/promises';
import * as path from 'node:path';

import { opAppend, opMap, pipe } from '@cspell/cspell-pipe/sync';
import * as Trie from 'cspell-trie-lib';

import type { CompileOptions } from './CompileOptions.js';
import { writeSeqToFile } from './fileWriter.js';
import { getLogger } from './logger.js';
import { normalizeTargetWords } from './wordListParser.js';

const mkdirp = async (p: string) => {
    await mkdir(p, { recursive: true });
};

// Indicate that a word list has already been processed.
const wordListHeader = `
# cspell-tools: keep-case no-split`;
const wordListHeaderLines = wordListHeader.split('\n').map((a) => a.trim());

export async function compileWordList(
    lines: Iterable<string>,
    destFilename: string,
    options: CompileOptions,
): Promise<void> {
    const finalLines = normalize(lines, options);

    const directives = options.dictionaryDirectives ?? [];
    const directivesLines = directives.map((a) => `# cspell-dictionary: ${a}`);

    const finalSeq = pipe([...wordListHeaderLines, ...directivesLines, ''], opAppend(finalLines));

    return createWordListTarget(destFilename)(finalSeq);
}

function normalize(lines: Iterable<string>, options: CompileOptions): Iterable<string> {
    const filter = normalizeTargetWords(options);

    const cleanLines = options.removeDuplicates ? removeDuplicates(lines) : lines;

    const iter = pipe(cleanLines, filter);
    if (!options.sort) return iter;

    const result = new Set(iter);
    return [...result].sort();
}

function stripCompoundAFix(word: string): string {
    return word.replaceAll('*', '').replaceAll('+', '');
}

function* removeDuplicates(words: Iterable<string>): Iterable<string> {
    const wordSet = new Set(words);
    const wordForms = new Map<string, string[]>();
    for (const word of wordSet) {
        const lc = stripCompoundAFix(word.toLowerCase());
        const forms = wordForms.get(lc) ?? [];
        forms.push(word);
        wordForms.set(lc, forms);
    }

    for (const forms of wordForms.values()) {
        if (forms.length <= 1) {
            yield* forms;
            continue;
        }
        const mForms = removeDuplicateForms(forms);
        if (mForms.size <= 1) {
            yield* mForms.values();
            continue;
        }
        // Handle upper / lower mix.
        const words = [...mForms.keys()];
        const lc = words[0].toLowerCase();
        const lcForm = mForms.get(lc);
        if (!lcForm) {
            yield* mForms.values();
            continue;
        }
        mForms.delete(lc);
        yield lcForm;
        for (const form of mForms.values()) {
            if (form.toLowerCase() === lcForm) continue;
            yield form;
        }
    }
}

/**
 * solo
 * optional_prefix*
 * optional_suffix*
 * required_prefix+
 * required_suffix+
 */

enum Flags {
    base = 0,
    noPfx = 1 << 0,
    noSfx = 1 << 1,
    pfx = 1 << 2,
    sfx = 1 << 3,
    noFix = noPfx | noSfx,
    midFix = pfx | sfx,
}

function applyFlags(word: string, flags: number): string {
    if (flags === Flags.noFix) return word;
    if (flags === (Flags.noFix | Flags.midFix)) return '*' + word + '*';
    const p = flags & Flags.pfx ? (flags & Flags.noPfx ? '*' : '+') : '';
    const s = flags & Flags.sfx ? (flags & Flags.noSfx ? '*' : '+') : '';
    return s + word + p;
}

function removeDuplicateForms(forms: Iterable<string>): Map<string, string> {
    function flags(word: string, flag: number = 0) {
        let f = Flags.base;
        const isOptPrefix = word.endsWith('*');
        const isPrefix = !isOptPrefix && word.endsWith('+');
        const isAnyPrefix = isPrefix || isOptPrefix;
        const isOptSuffix = word.startsWith('*');
        const isSuffix = !isOptSuffix && word.startsWith('+');
        const isAnySuffix = isSuffix || isOptSuffix;
        f |= isAnyPrefix ? Flags.pfx : 0;
        f |= !isPrefix ? Flags.noPfx : 0;
        f |= isAnySuffix ? Flags.sfx : 0;
        f |= !isSuffix ? Flags.noSfx : 0;
        return flag | f;
    }

    const m = new Map<string, number>();
    for (const form of forms) {
        const k = stripCompoundAFix(form);
        m.set(k, flags(form, m.get(k)));
    }
    return new Map(
        [...m.entries()].map(([form, flag]) => {
            return [form, applyFlags(form, flag)];
        }),
    );
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
    removeDuplicates,
};
