import { mkdir } from 'node:fs/promises';
import * as path from 'node:path';

import { opAppend, opMap, pipe } from '@cspell/cspell-pipe/sync';
import * as Trie from 'cspell-trie-lib';

import type { CompileOptions } from './CompileOptions.js';
import { WordListCompiler } from './CompilerDefinitions.js';
import { getLogger } from './logger.js';
import { normalizeTargetWords } from './wordListParser.js';
import { writeTextToFile } from './writeTextToFile.js';

const mkdirp = async (p: string) => {
    await mkdir(p, { recursive: true });
};

// Indicate that a word list has already been processed.
const wordListHeader = `
# cspell-tools: keep-case no-split`;
const wordListHeaderLines = wordListHeader.split('\n').map((a) => a.trim());

export async function compileWordListToTarget(
    lines: Iterable<string>,
    destFilename: string,
    options: CompileOptions,
): Promise<void> {
    const compiler = createWordListCompiler(options);

    return createTargetFile(destFilename, compiler(lines));
}

export function createWordListCompiler(options: CompileOptions): WordListCompiler {
    return (lines: Iterable<string>) => {
        const finalLines = normalize(lines, options);

        const directives = options.dictionaryDirectives ?? [];
        const directivesLines = directives.map((a) => `# cspell-dictionary: ${a}`);

        return pipe(
            [...wordListHeaderLines, ...directivesLines, ''],
            opAppend(finalLines),
            opMap((a) => a + '\n'),
        );
    };
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
        // if (forms.some((a) => /^[*+]?col[*+]?$/.test(a))) {
        //     console.warn('Found col %o', { forms, mForms });
        // }
        if (mForms.size <= 1) {
            for (const form of mForms.values()) {
                yield* form;
            }
            continue;
        }
        // Handle upper / lower mix.
        const words = [...mForms.keys()];
        const lc = words[0].toLowerCase();
        const lcForm = mForms.get(lc);
        if (!lcForm) {
            for (const form of mForms.values()) {
                yield* form;
            }
            continue;
        }
        mForms.delete(lc);
        const sLcForms = new Set(lcForm);
        yield* lcForm;
        if (sLcForms.has('*' + lc + '*')) continue;
        for (const forms of mForms.values()) {
            for (const form of forms) {
                if (sLcForms.has(form.toLowerCase())) continue;
                yield form;
            }
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
    none = 1 << 0,
    both = 1 << 1,
    pfx = 1 << 2,
    sfx = 1 << 3,
    all = none | both | pfx | sfx,
}

function applyFlags(word: string, flags: Flags): string[] {
    if (flags === Flags.none) return [word];
    if (flags === Flags.all) return ['*' + word + '*'];
    if (flags === Flags.both) return ['+' + word + '+'];
    if (flags === Flags.pfx) return [word + '+'];
    if (flags === Flags.sfx) return ['+' + word];

    if (flags === (Flags.none | Flags.sfx)) return ['*' + word];
    if (flags === (Flags.none | Flags.pfx)) return [word + '*'];
    if (flags === (Flags.none | Flags.pfx | Flags.sfx)) return [word + '*', '*' + word];
    if (flags === (Flags.none | Flags.both)) {
        // the "correct" answer is [word, '+' + word + '+']
        // but practically it makes sense to allow all combinations.
        return ['*' + word + '*'];
    }
    if (flags === (Flags.none | Flags.both | Flags.sfx)) return [word, '+' + word + '*'];
    if (flags === (Flags.none | Flags.both | Flags.pfx)) return [word, '*' + word + '+'];
    if (flags === (Flags.both | Flags.pfx)) return ['*' + word + '+'];
    if (flags === (Flags.both | Flags.sfx)) return ['+' + word + '*'];
    if (flags === (Flags.both | Flags.pfx | Flags.sfx)) return ['+' + word + '*', '*' + word + '+'];
    return ['+' + word, word + '+'];
}

function removeDuplicateForms(forms: Iterable<string>): Map<string, string[]> {
    function flags(word: string, flag: Flags = 0) {
        const canBePrefix = word.endsWith('*');
        const mustBePrefix = !canBePrefix && word.endsWith('+');
        const isPrefix = canBePrefix || mustBePrefix;
        const canBeSuffix = word.startsWith('*');
        const mustBeSuffix = !canBeSuffix && word.startsWith('+');
        const isSuffix = canBeSuffix || mustBeSuffix;
        if (canBePrefix && canBeSuffix) return flag | Flags.all;
        if (mustBePrefix && mustBeSuffix) return flag | Flags.both;
        if (!isPrefix && !isSuffix) return flag | Flags.none;
        flag |= isPrefix && !isSuffix ? Flags.pfx : 0;
        flag |= isSuffix && !isPrefix ? Flags.sfx : 0;
        flag |= canBePrefix && !mustBeSuffix ? Flags.none : 0;
        flag |= canBeSuffix && !mustBePrefix ? Flags.none : 0;
        return flag;
    }

    const m = new Map<string, Flags>();
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

export async function createTargetFile(
    destFilename: string,
    seq: Iterable<string> | string,
    compress?: boolean,
): Promise<void> {
    const rel = path.relative(process.cwd(), destFilename);
    const log = getLogger();
    log(`Writing to file ${rel}${compress ? '.gz' : ''}`);
    const destDir = path.dirname(destFilename);
    await mkdirp(destDir);
    await writeTextToFile(destFilename, seq, compress);
}

// function sort(words: Iterable<string>): Iterable<string> {
//     return [...words].sort();
// }

export interface TrieOptions {
    base?: number | undefined;
    trie3?: boolean | undefined;
    trie4?: boolean | undefined;
}

export interface CompileTrieOptions extends CompileOptions, TrieOptions {}

export async function compileTrieToTarget(
    words: Iterable<string>,
    destFilename: string,
    options: CompileTrieOptions,
): Promise<void> {
    await createTrieTarget(destFilename, options)(words);
}

function createTrieTarget(destFilename: string, options: TrieOptions): (words: Iterable<string>) => Promise<void> {
    return async (words: Iterable<string>) => {
        await createTargetFile(destFilename, createTrieCompiler(options)(words));
        const log = getLogger();
        log(`Done writing to file ${path.basename(destFilename)}`);
    };
}

export function createTrieCompiler(options: TrieOptions): WordListCompiler {
    return (words: Iterable<string>) => {
        const log = getLogger();
        log('Reading Words into Trie');
        const base = options.base ?? 32;
        const version = options.trie4 ? 4 : options.trie3 ? 3 : 1;
        const root = Trie.buildTrie(words).root;
        log('Reduce duplicate word endings');
        const trie = Trie.consolidate(root);
        log('Trie compilation complete');
        return Trie.serializeTrie(trie, {
            base,
            comment: 'Built by cspell-tools.',
            version,
        });
    };
}

export const __testing__: {
    wordListHeader: string;
    removeDuplicates: typeof removeDuplicates;
} = {
    wordListHeader,
    removeDuplicates,
};
