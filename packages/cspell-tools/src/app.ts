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
            .option('-s, --no-split', 'Treat each line as a dictionary entry, do not split')
            .option('--no-sort', 'Do not sort the result')
            .action((src: string[], options: { output?: string, compress: boolean, split: boolean, sort: boolean, case: boolean, max_depth?: string }) => {
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
            .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
            .action((src: string[], options: { output?: string, compress: boolean, max_depth?: string }) => {
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


async function processAction(
    src: string[],
    fileExt: '.txt' | '.trie',
    options: { output?: string, compress: boolean, max_depth?: string },
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
    const toProcess = genSequence(globResults)
        .concatMap(files => files)
        .map(s => {
            const outFilename = path.basename(s).replace(/(\.txt|\.dic|\.aff)?$/, ext);
            const dir = options.output ? options.output : path.dirname(s);
            return [s, path.join(dir, outFilename)] as [string, string];
        })
        .map(async ([src, dst]) => {
            console.log('Process "%s" to "%s"', src, dst);
            const words = await streamWordsFromFile(src, readerOptions);
            await action(words, dst);
            console.log('Done "%s" to "%s"', src, dst);
        });

    for (const p of toProcess) {
        await p;
    }
    console.log(`Complete.`);
}

if (require.main === module) {
    run(program, process.argv).catch(() => process.exit(1));
}
