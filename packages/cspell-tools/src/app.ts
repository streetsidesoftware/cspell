// For large dictionaries, it is necessary to increase the memory limit.

import { compileWordList, compileTrie, Logger } from './compiler';
import * as compiler from './compiler';
import * as path from 'path';
import * as program from 'commander';
import glob from 'glob';
import { genSequence, Sequence } from 'gensequence';
import { streamWordsFromFile } from './compiler/iterateWordsFromFile';
import { ReaderOptions } from './compiler/Reader';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require(path.join(__dirname, '..', 'package.json'));

function globP(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        glob(pattern, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
}

interface CompileCommonOptions {
    output?: string;
    compress: boolean;
    case: boolean;
    max_depth?: string;
    merge?: string;
    experimental: string[];
}

interface CompileOptions extends CompileCommonOptions {
    split: boolean;
    sort: boolean;
}

interface CompileTrieOptions extends CompileCommonOptions {
    trie3: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log: Logger = (message?: any, ...optionalParams: any[]) => {
    console.log(`${new Date().toISOString()} ${message}`, ...optionalParams);
};

compiler.setLogger(log);

function collect(value: string, previous: string[]) {
    return previous.concat([value]);
}

export function run(program: program.Command, argv: string[]): Promise<void> {
    program.exitOverride();

    return new Promise((resolve, reject) => {
        program.version(npmPackage.version);

        program
            .command('compile <src...>')
            .description('compile words lists into simple dictionary files.')
            .option(
                '-o, --output <path>',
                'Specify the output directory, otherwise files are written back to the same location.'
            )
            .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
            .option('-m, --max_depth <limit>', 'Maximum depth to apply suffix rules.')
            .option('-M, --merge <target>', 'Merge all files into a single target file (extensions are applied)')
            .option('-s, --no-split', 'Treat each line as a dictionary entry, do not split')
            .option(
                '-x, --experimental <flag>',
                'Experimental flags, used for testing new concepts. Flags: compound',
                collect,
                []
            )
            .option('--no-sort', 'Do not sort the result')
            .action((src: string[], options: CompileOptions) => {
                const experimental = new Set(options.experimental);
                const skipNormalization = experimental.has('compound');
                const result = processAction(src, '.txt', options, async (src, dst) => {
                    return compileWordList(src, dst, {
                        splitWords: options.split,
                        sort: options.sort,
                        skipNormalization,
                    }).then(() => src);
                });
                resolve(result);
            });

        program
            .command('compile-trie <src...>')
            .description('Compile words lists or Hunspell dictionary into trie files used by cspell.')
            .option(
                '-o, --output <path>',
                'Specify the output directory, otherwise files are written back to the same location.'
            )
            .option('-m, --max_depth <limit>', 'Maximum depth to apply suffix rules.')
            .option('-M, --merge <target>', 'Merge all files into a single target file (extensions are applied)')
            .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
            .option(
                '-x, --experimental <flag>',
                'Experimental flags, used for testing new concepts. Flags: compound',
                collect,
                []
            )
            .option('--trie3', '[Beta] Use file format trie3')
            .action((src: string[], options: CompileTrieOptions) => {
                const experimental = new Set(options.experimental);
                const skipNormalization = experimental.has('compound');
                const compileOptions = { ...options, skipNormalization };
                const result = processAction(src, '.trie', options, async (words: Sequence<string>, dst) => {
                    return compileTrie(words, dst, compileOptions);
                });
                resolve(result);
            });

        try {
            program.parse(argv);
            if (!argv.slice(2).length) {
                program.help();
            }
        } catch (e) {
            reject(e);
        }

        resolve();
    });
}

interface FileToProcess {
    src: string;
    words: Sequence<string>;
}

function parseNumber(s: string | undefined): number | undefined {
    const n = parseInt(s ?? '');
    return isNaN(n) ? undefined : n;
}

// eslint-disable-next-line no-unused-vars
type ActionFn = (words: Sequence<string>, dst: string) => Promise<unknown>;

async function processAction(
    src: string[],
    fileExt: '.txt' | '.trie',
    options: CompileCommonOptions,
    action: ActionFn
): Promise<void> {
    console.log(
        'Compile:\n output: %s\n compress: %s\n files:\n  %s \n\n',
        options.output || 'default',
        options.compress ? 'true' : 'false',
        src.join('\n  ')
    );

    const ext = fileExt + (options.compress ? '.gz' : '');
    const maxDepth = parseNumber(options.max_depth);
    const experimental = new Set(options.experimental);
    const useAnnotation = experimental.has('compound');
    const readerOptions: ReaderOptions = { maxDepth, useAnnotation };

    const globResults = await Promise.all(src.map((s) => globP(s)));
    const filesToProcess = genSequence(globResults)
        .concatMap((files) => files)
        .map(async (filename) => {
            log(`Reading ${path.basename(filename)}`);
            const words = await streamWordsFromFile(filename, readerOptions);
            log(`Done reading ${path.basename(filename)}`);
            const f: FileToProcess = {
                src: filename,
                words,
            };
            return f;
        });

    const r = options.merge
        ? processFiles(action, filesToProcess, toMergeTargetFile(options.merge, options.output, ext))
        : processFilesIndividually(action, filesToProcess, (s) => toTargetFile(s, options.output, ext));
    await r;
    log(`Complete.`);
}

function toFilename(name: string, ext: string) {
    return path.basename(name).replace(/((\.txt|\.dic|\.aff|\.trie)(\.gz)?)?$/, '') + ext;
}

function toTargetFile(filename: string, destination: string | undefined, ext: string) {
    const outFileName = toFilename(filename, ext);
    const dir = destination ?? path.dirname(filename);
    return path.join(dir, outFileName);
}

function toMergeTargetFile(filename: string, destination: string | undefined, ext: string) {
    const outFileName = path.join(path.dirname(filename), toFilename(filename, ext));
    return path.resolve(destination ?? '.', outFileName);
}

async function processFilesIndividually(
    action: ActionFn,
    filesToProcess: Sequence<Promise<FileToProcess>>,
    srcToTarget: (_src: string) => string
) {
    const toProcess = filesToProcess.map(async (pFtp) => {
        const { src, words } = await pFtp;
        const dst = srcToTarget(src);
        log('Process "%s" to "%s"', src, dst);
        await action(words, dst);
        log('Done "%s" to "%s"', src, dst);
    });

    for (const p of toProcess) {
        await p;
    }
}

async function processFiles(action: ActionFn, filesToProcess: Sequence<Promise<FileToProcess>>, mergeTarget: string) {
    const toProcess = await Promise.all([...filesToProcess]);
    const dst = mergeTarget;

    const words = genSequence(toProcess)
        .map((ftp) => {
            const { src } = ftp;
            log('Process "%s" to "%s"', src, dst);
            return ftp;
        })
        .concatMap((ftp) => ftp.words);
    await action(words, dst);
    log('Done "%s"', dst);
}
