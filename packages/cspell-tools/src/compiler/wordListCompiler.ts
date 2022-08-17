import { genSequence, Sequence } from 'gensequence';
import * as Text from './text';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import * as Trie from 'cspell-trie-lib';
import { writeSeqToFile } from './fileWriter';
import { uniqueFilter } from 'hunspell-reader/dist/util';
import { extractInlineSettings, InlineSettings } from './inlineSettings';

const regNonWordOrSpace = /[^\p{L}\p{M}' ]+/giu;
const regNonWordOrDigit = /[^\p{L}\p{M}'\w-]+/giu;
const regExpSpaceOrDash = /[- ]+/g;
const regExpRepeatChars = /(.)\1{4,}/i;

// Indicate that a word list has already been processed.
const wordListHeader = `
# cspell-tools: keep-case no-split
`;
const wordListHeaderLines = wordListHeader.split('\n').map((a) => a.trim());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Logger = (message?: any, ...optionalParams: any[]) => void;

let log: Logger = defaultLogger;

export function setLogger(logger?: Logger): void {
    log = logger ?? defaultLogger;
}

function defaultLogger(message?: unknown, ...optionalParams: unknown[]) {
    console.log(message, ...optionalParams);
}

type Normalizer = (lines: Sequence<string>) => Sequence<string>;
type LineProcessor = (line: string) => Iterable<string>;
type WordMapper = (word: string) => Iterable<string>;

export function legacyNormalizeWords(lines: Sequence<string>): Sequence<string> {
    return lines.concatMap((line) => legacyLineToWords(line));
}

export function legacyLineToWords(line: string): Sequence<string> {
    // Remove punctuation and non-letters.
    const filteredLine = line.replace(regNonWordOrSpace, '|');
    const wordGroups = filteredLine.split('|');

    const words = genSequence(wordGroups)
        .concatMap((a) => [a, ...a.split(regExpSpaceOrDash)])
        .concatMap((a) => splitCamelCase(a))
        .map((a) => a.trim())
        .filter((a) => !!a)
        .filter((s) => !regExpRepeatChars.test(s))
        .map((a) => a.toLowerCase());

    return words;
}

function splitCamelCase(word: string): Sequence<string> | string[] {
    const splitWords = Text.splitCamelCaseWord(word);
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return genSequence(splitWords).concatMap((w) => w.split(regExpSpaceOrDash));
    }
    return splitWords;
}

export interface CompileOptions {
    skipNormalization: boolean | undefined;
    splitWords: boolean | undefined;
    keepRawCase: boolean;
    sort: boolean;
    legacy: boolean | undefined;
}

function createNormalizer(options: CompileOptions): Normalizer {
    const { skipNormalization = false, splitWords, keepRawCase, legacy } = options;
    if (skipNormalization) {
        return (lines: Sequence<string>) => lines;
    }
    const lineProcessor = legacy ? legacyLineToWords : splitWords ? splitLine : noSplit;
    const wordMapper = keepRawCase ? mapWordIdentity : mapWordToDictionaryEntries;

    const initialState: CompilerState = {
        inlineSettings: {},
        lineProcessor,
        wordMapper,
    };

    const fnNormalizeLines = (lines: Iterable<string>) =>
        normalizeWordListSeq(lines, initialState)
            .filter((a) => !!a)
            .pipe(createInlineBufferedSort())
            .filter(uniqueFilter(10000));

    return fnNormalizeLines;
}

export async function compileWordList(
    lines: Sequence<string>,
    destFilename: string,
    options: CompileOptions
): Promise<void> {
    const normalizer = createNormalizer(options);
    const seq = normalizer(lines);

    const header = genSequence(wordListHeaderLines);
    const finalSeq = header.concat(options.sort ? genSequence(sort(seq)) : seq);

    return createWordListTarget(destFilename)(finalSeq);
}

export function createWordListTarget(destFilename: string): (seq: Sequence<string>) => Promise<void> {
    const target = createTarget(destFilename);
    return (seq: Sequence<string>) => target(seq.map((a) => a + '\n'));
}

function createTarget(destFilename: string): (seq: Sequence<string>) => Promise<void> {
    const destDir = path.dirname(destFilename);
    const pDir = mkdirp(destDir);
    return async (seq: Sequence<string>) => {
        await pDir;
        return writeSeqToFile(seq, destFilename);
    };
}

function mapWordToDictionaryEntries(w: string): Iterable<string> {
    return Trie.parseDictionaryLines([w]);
}

function mapWordIdentity(w: string): string[] {
    return [w];
}
interface CompilerState {
    inlineSettings: InlineSettings;
    lineProcessor: LineProcessor;
    wordMapper: WordMapper;
}

function normalizeWordListSeq(lines: Iterable<string>, initialState: CompilerState): Sequence<string> {
    return genSequence(normalizeWordListGen(lines, initialState));
}

function* normalizeWordListGen(lines: Iterable<string>, initialState: CompilerState): Iterable<string> {
    let state = initialState;

    for (let line of lines) {
        line = line.normalize('NFC');
        state = adjustState(state, line);
        for (const word of state.lineProcessor(line)) {
            const w = word.trim();
            if (!w) continue;
            yield* state.wordMapper(w);
        }
    }
}

function createInlineBufferedSort(bufferSize = 1000): (lines: Iterable<string>) => Iterable<string> {
    function* inlineBufferedSort(lines: Iterable<string>): Iterable<string> {
        const buffer: string[] = [];

        for (const line of lines) {
            buffer.push(line);
            if (buffer.length >= bufferSize) {
                buffer.sort();
                yield* buffer;
                buffer.length = 0;
            }
        }

        buffer.sort();
        yield* buffer;
    }

    return inlineBufferedSort;
}

function adjustState(state: CompilerState, line: string): CompilerState {
    const inlineSettings = extractInlineSettings(line);
    if (!inlineSettings) return state;
    const r = { ...state };
    r.inlineSettings = { ...r.inlineSettings, ...inlineSettings };
    r.wordMapper =
        inlineSettings.keepRawCase === undefined
            ? r.wordMapper
            : inlineSettings.keepRawCase
            ? mapWordIdentity
            : mapWordToDictionaryEntries;
    r.lineProcessor = inlineSettings.split === undefined ? r.lineProcessor : inlineSettings.split ? splitLine : noSplit;
    return r;
}

function sort(words: Iterable<string>): Iterable<string> {
    return [...words].sort();
}

export interface TrieOptions {
    base?: number;
    trie3?: boolean;
    trie4?: boolean;
}

export interface CompileTrieOptions extends CompileOptions, TrieOptions {}

export const consolidate = Trie.consolidate;

export async function compileTrie(
    words: Sequence<string>,
    destFilename: string,
    options: CompileTrieOptions
): Promise<void> {
    const normalizer = createNormalizer(options);
    await createTrieTarget(destFilename, options)(normalizer(words));
}

export function createTrieTarget(
    destFilename: string,
    options: TrieOptions
): (words: Sequence<string>) => Promise<void> {
    const target = createTarget(destFilename);
    return async (words: Sequence<string>) => {
        log('Reading Words into Trie');
        const base = options.base ?? 32;
        const version = options.trie4 ? 4 : options.trie3 ? 3 : 1;
        const root = Trie.buildTrie(words).root;
        log('Reduce duplicate word endings');
        const trie = consolidate(root);
        log(`Writing to file ${path.basename(destFilename)}`);
        await target(
            Trie.serializeTrie(trie, {
                base,
                comment: 'Built by cspell-tools.',
                version,
            })
        );
        log(`Done writing to file ${path.basename(destFilename)}`);
    };
}

/**
 * Splits a line of text into words, but does not split words.
 * @param line text line to split.
 * @returns array of words
 * @example `readline.clearLine(stream, dir)` => ['readline', 'clearLine', 'stream', 'dir']
 * @example `New York` => ['New', 'York']
 * @example `don't` => [`don't`]
 * @example `Event: 'SIGCONT'` => ['Event', 'SIGCONT']
 */
function splitLine(line: string): string[] {
    line = line.replace(/#.*/, ''); // remove comment
    line = line.trim();
    line = line.replace(/\bU\+[0-9A-F]+\b/gi, '|'); // Remove Unicode Definitions
    line = line.replace(regNonWordOrDigit, '|');
    line = line.replace(/'(?=\|)/g, ''); // remove trailing '
    line = line.replace(/'$/, ''); // remove trailing '
    line = line.replace(/(?<=\|)'/g, ''); // remove leading '
    line = line.replace(/^'/, ''); // remove leading '
    line = line.replace(/\s*\|\s*/g, '|'); // remove spaces around |
    line = line.replace(/[|]+/g, '|'); // reduce repeated |
    line = line.replace(/^\|/, ''); // remove leading |
    line = line.replace(/\|$/, ''); // remove trailing |
    const lines = line
        .split('|')
        .map((a) => a.trim())
        .filter((a) => !!a)
        .filter((a) => !a.match(/^[0-9_-]+$/)) // pure numbers and symbols
        .filter((a) => !a.match(/^[ux][0-9A-F]*$/i)) // hex digits
        .filter((a) => !a.match(/^0[xo][0-9A-F]*$/i)); // c-style hex/octal digits

    return lines;
}

function noSplit(line: string): string[] {
    line = line.replace(/#.*/, ''); // remove comment
    line = line.trim();
    return !line ? [] : [line];
}

export const __testing__ = {
    splitLine: splitLine,
    createNormalizer,
    wordListHeader,
};
