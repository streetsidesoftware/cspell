#!/usr/bin/env node

// For large dictionaries, it is necessary to increase the memory limit.
// # !/usr/bin/env node --max_old_space_size=8192


import { compileWordList, compileTrie } from './compiler';
import * as path from 'path';
import * as program from 'commander';
import * as glob from 'glob';
import { genSequence, Sequence } from 'gensequence';
import { streamWordsFromFile } from './compiler/iterateWordsFromFile';
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
    merge: boolean;
}

interface CompileOptions extends CompileCommonOptions {
    split: boolean;
    sort: boolean;
}

interface CompileTrieOptions extends CompileCommonOptions {
}

export function run(
    program: program.Command,
    argv: string[]
): Promise<void> {
    (program as any).exitOverride();

    return new Promise((resolve, rejects) => {
        program
            .version(npmPackage.version);

        program
            .command('compile <src...>')
            .description('compile words lists into simple dictionary files.')
            .option('-o, --output <path>', 'Specify the output directory, otherwise files are written back to the same location.')
            .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
            .option('-m, --max_depth <limit>', 'Maximum depth to apply suffix rules.')
            .option('-M, --merge', 'Merge all files into a single files')
            .option('-s, --no-split', 'Treat each line as a dictionary entry, do not split')
            .option('--no-sort', 'Do not sort the result')
            .action((src: string[], options: CompileOptions) => {
                const result = processAction(src, '.txt', options, async (src, dst) => {
                    return compileWordList(src, dst, { splitWords: options.split, sort: options.sort }).then(() => src);
                });
                resolve(result);
            });

        program
            .command('compile-trie <src...>')
            .description('Compile words lists or Hunspell dictionary into trie files used by cspell.')
            .option('-o, --output <path>', 'Specify the output directory, otherwise files are written back to the same location.')
            .option('-m, --max_depth <limit>', 'Maximum depth to apply suffix rules.')
            .option('-M, --merge', 'Merge all files into a single files')
            .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
            .action((src: string[], options: CompileTrieOptions) => {
                const result = processAction(src, '.trie', options, async (words: Sequence<string>, dst) => {
                    return compileTrie(words, dst);
                });
                resolve(result);
            });

        try {
            program.parse(argv);
            if (!argv.slice(2).length) {
                program.help();
            }
        } catch (e) {
            rejects(e);
        }

        resolve();
    });
}

interface FileToProcess {
    src: string;
    dst: string;
    words: Sequence<string>;
}

async function processAction(
    src: string[],
    fileExt: '.txt' | '.trie',
    options: CompileCommonOptions,
    action: (words: Sequence<string>, dst: string) => Promise<any>)
: Promise<void> {
    console.log('Compile:\n output: %s\n compress: %s\n files:\n  %s \n\n',
        options.output || 'default',
        options.compress ? 'true' : 'false',
        src.join('\n  '));

    const ext = fileExt + (options.compress ? '.gz' : '');
    const { max_depth } = options;
    const maxDepth = max_depth !== undefined ? Number.parseInt(max_depth) : undefined;
    const readerOptions = { maxDepth };

    const globResults = await Promise.all(src.map(s => globP(s)));
    const filesToProcess = genSequence(globResults)
        .concatMap(files => files)
        .map(async s => {
            const words = await streamWordsFromFile(s, readerOptions);
            const f: FileToProcess = {
                src: s,
                dst: toTargetFile(s, options.output, ext),
                words,
            };
            return f;
        });

    const toProcess = filesToProcess
    .map(async pFtp => {
        const { src, dst, words } = await pFtp;
        console.log('Process "%s" to "%s"', src, dst);
        await action(words, dst);
        console.log('Done "%s" to "%s"', src, dst);
    });

    for (const p of toProcess) {
        await p;
    }
    console.log(`Complete.`);
}

function toTargetFile(filename: string, destination: string | undefined, ext: string) {
    const outFilename = path.basename(filename).replace(/((\.txt|\.dic|\.aff)(\.gz)?)?$/, ext);
    const dir = destination ?? path.dirname(filename);
    return path.join(dir, outFilename);
}

if (require.main === module) {
    run(program, process.argv).catch(() => process.exit(1));
}
