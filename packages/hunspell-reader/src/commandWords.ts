// cSpell:ignore findup
import { Command } from 'commander';
import { createWriteStream, openSync, writeSync } from 'fs';
import type { Sequence } from 'gensequence';
import { genSequence } from 'gensequence';

import type { AffWord } from './affDef.js';
import { asAffWord } from './affLegacy.js';
import { IterableHunspellReaderLegacy } from './IterableHunspellReaderLegacy.js';
import { iterableToStream } from './iterableToStream.js';
import { batch, uniqueFilter } from './util.js';

const uniqueHistorySize = 500_000;

let logStream: NodeJS.WritableStream = process.stderr;

export function getCommand(): Command {
    const commander = new Command('words');

    commander
        .arguments('<hunspell_dic_file>')
        .option('-o, --output <file>', 'output file - defaults to stdout')
        .option('-s, --sort', 'sort the list of words')
        .option('-u, --unique', 'make sure the words are unique.')
        .option('-l, --lower_case', 'output in lower case')
        .option('-T, --no-transform', 'Do not apply the prefix and suffix transforms.  Root words only.')
        .option('-x, --infix', 'Return words with prefix / suffix breaks. ex: "un<do>ing"')
        .option('-r, --rules', 'Append rules used to generate word.')
        .option('-p, --progress', 'Show progress.')
        .option('-m, --max_depth <limit>', 'Maximum depth to apply suffix rules.')
        .option('-n, --number <limit>', 'Limit the number of words to output.')
        .option('--forbidden', 'include forbidden words')
        .option('--partial_compounds', 'include words that must be part of a compound word')
        .option('--only_forbidden', 'includes only words that are forbidden')
        .description('Output all the words in the <hunspell.dic> file.')
        .action(action);

    return commander;
}

function notify(message: string, newLine = true) {
    message = message + (newLine ? '\n' : '');
    logStream.write(message, 'utf-8');
}

function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}

function affWordToInfix(aff: AffWord): AffWord {
    return { ...aff, word: aff.prefix + '<' + aff.base + '>' + aff.suffix };
}

function mapWord(map: (word: string) => string): (aff: AffWord) => AffWord {
    return (aff: AffWord) => ({ ...aff, word: map(aff.word) });
}

function appendRules(aff: AffWord): AffWord {
    return { ...aff, word: aff.word + '\t[' + aff.rulesApplied + ' ]\t' + '(' + aff.dic + ')' };
}

function writeSeqToFile(seq: Sequence<string>, outFile: string | undefined): Promise<void> {
    return new Promise((resolve, reject) => {
        let resolved = false;
        const out = outFile ? createWriteStream(outFile) : process.stdout;
        const bufferedSeq = genSequence(batch(seq, 500)).map((batch) => batch.join(''));
        const dataStream = iterableToStream(bufferedSeq);
        const fileStream = dataStream.pipe(out);
        const endEvents = ['finish', 'close', 'end'];

        function resolvePromise() {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        }
        const endHandler = () => {
            cleanupStreams();
            setTimeout(resolvePromise, 10);
        };
        const errorHandler = (e: Error) => {
            cleanupStreams();
            reject(e);
        };

        listenToStreams();

        function listenToStreams() {
            endEvents.forEach((event) => fileStream.addListener(event, endHandler));
            fileStream.addListener('error', errorHandler);
            dataStream.addListener('end', endHandler);
        }

        function cleanupStreams() {
            endEvents.forEach((event) => fileStream.removeListener(event, endHandler));
            fileStream.removeListener('error', errorHandler);
            dataStream.removeListener('end', endHandler);
        }
    });
}

interface ErrorWithCode {
    code?: string;
}

async function action(hunspellDicFilename: string, options: Options): Promise<void> {
    try {
        await actionPrime(hunspellDicFilename, options);
    } catch (err) {
        const reason = asError(err);
        if (reason?.code === 'EPIPE') {
            console.log(reason);
            return;
        }
        throw err;
    }
}

function asError(err: unknown): ErrorWithCode | undefined {
    return err && typeof err === 'object' ? (err as ErrorWithCode) : undefined;
}

interface Options {
    sort?: boolean;
    unique?: boolean;
    lower_case?: boolean;
    output?: string;
    transform?: boolean;
    infix?: boolean;
    rules?: boolean; // append rules
    progress?: boolean; // show progress
    number?: string; // limit the number to output
    max_depth?: string; // limit the recursive depth to apply suffixes.
    forbidden: boolean; // include forbidden words
    only_forbidden: boolean; // only include forbidden words
    partial_compounds: boolean; // include partial word compounds
}

async function actionPrime(hunspellDicFilename: string, options: Options) {
    const {
        sort = false,
        unique = false,
        output: outputFile,
        lower_case: lowerCase = false,
        transform = true,
        infix = false,
        rules = false,
        progress: showProgress = false,
        max_depth,
        forbidden = false,
        only_forbidden: onlyForbidden = false,
        partial_compounds: partialCompoundsAllowed = false,
    } = options;
    logStream = outputFile ? process.stdout : process.stderr;
    const log = notify;
    log('Write words');
    log(`Sort: ${yesNo(sort)}`);
    log(`Unique: ${yesNo(unique)}`);
    const baseFile = hunspellDicFilename.replace(/\.(dic|aff)$/, '');
    const dicFile = baseFile + '.dic';
    const affFile = baseFile + '.aff';
    log(`Dic file: ${dicFile}`);
    log(`Aff file: ${affFile}`);
    log(`Generating Words...`);
    const reader = await IterableHunspellReaderLegacy.createFromFiles(affFile, dicFile);
    if (max_depth && Number.parseInt(max_depth) >= 0) {
        reader.maxDepth = Number.parseInt(max_depth);
    }
    const transformers: ((aff: AffWord) => AffWord)[] = [];
    const filters: ((aff: AffWord) => boolean)[] = [];
    if (!forbidden && !onlyForbidden) filters.push((aff) => !aff.flags.isForbiddenWord);
    if (onlyForbidden) filters.push((aff) => !!aff.flags.isForbiddenWord);
    if (!partialCompoundsAllowed) filters.push((aff) => !aff.flags.isOnlyAllowedInCompound);
    if (infix) {
        transformers.push(affWordToInfix);
    }
    if (lowerCase) {
        transformers.push(mapWord((a) => a.toLowerCase()));
    }
    if (rules) {
        transformers.push(appendRules);
    }
    transformers.push(mapWord((a) => a.trim()));
    const dicSize = reader.dic.length;
    let current = 0;
    const calcProgress = () => '\r' + current + ' / ' + dicSize;
    const reportProgressRate = 253;
    const callback = showProgress
        ? () => {
              current++;
              !(current % reportProgressRate) && process.stderr.write(calcProgress(), 'utf-8');
          }
        : () => {
              /* void */
          };
    const seqWords = transform ? reader.seqAffWords(callback) : reader.seqRootWords().map(asAffWord);
    const filterUnique = unique ? uniqueFilter<string>(uniqueHistorySize) : (_: string) => true;

    const applyTransformers = (aff: AffWord) => transformers.reduce((aff, fn) => fn(aff), aff);
    const applyFilters = (aff: AffWord) => filters.reduce((cur, fn) => cur && fn(aff), true);

    const allWords = seqWords
        .filter(applyFilters)
        .map(applyTransformers)
        .map((a) => a.word)
        .filter((a) => !!a)
        .filter(filterUnique)
        .map((a) => a + '\n');

    const words = options.number ? allWords.take(Number.parseInt(options.number)) : allWords;

    if (sort) {
        log('Sorting...');
        const data = words.toArray().sort().join('');
        const fd = outputFile ? openSync(outputFile, 'w') : 1;
        writeSync(fd, data);
    } else {
        await writeSeqToFile(words, outputFile);
    }
    if (showProgress) {
        console.error(calcProgress());
    }
    log('Done.');
}
