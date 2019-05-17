#!/usr/bin/env node

// For large dictionaries, it is necessary to increase the memory limit.
// # !/usr/bin/env node --max_old_space_size=8192


import { compileWordList, compileTrie } from './compiler';
import * as path from 'path';
import * as program from 'commander';
import * as glob from 'glob';
import { genSequence } from 'gensequence';
const npmPackage = require(path.join(__dirname, '..', 'package.json'));

function globP(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        glob(pattern, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
}

program
    .version(npmPackage.version);

program
    .command('compile <src...>')
    .description('compile words lists into simple dictionary files.')
    .option('-o, --output <path>', 'Specify the output directory, otherwise files are written back to the same location.')
    .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
    .option('-s, --no-split', 'Treat each line as a dictionary entry, do not split')
    .option('--no-sort', 'Do not sort the result')
    .action(async (src: string[], options: { output?: string, compress: boolean, split: boolean, sort: boolean, case: boolean }) => {
        return processAction(src, '.txt', options, async (src, dst) => {
            console.log('Process "%s" to "%s"', src, dst);
            await compileWordList(src, dst, { splitWords: options.split, sort: options.sort }).then(() => src);
            console.log('Done "%s" to "%s"', src, dst);
            return src;
        });
    });

program
    .command('compile-trie <src...>')
    .description('Compile words lists or Hunspell dictionary into trie files used by cspell.')
    .option('-o, --output <path>', 'Specify the output directory, otherwise files are written back to the same location.')
    .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
    .action((src: string[], options: { output?: string, compress: boolean }) => {
        return processAction(src, '.trie', options, async (src, dst) => {
            console.log('Process "%s" to "%s"', src, dst);
            return compileTrie(src, dst).then(() => src);
        });
    });

async function processAction(
    src: string[],
    fileExt: '.txt' | '.trie',
    options: { output?: string, compress: boolean },
    action: (src: string, dst: string) => Promise<any>)
: Promise<void> {
    console.log('Compile:\n output: %s\n compress: %s\n files:\n  %s \n\n',
    options.output || 'default',
    options.compress ? 'true' : 'false',
    src.join('\n  ') );

    const ext = fileExt + (options.compress ? '.gz' : '');

    const globResults = await Promise.all(src.map(s => globP(s)));
    const toProcess = genSequence(globResults)
        .concatMap(files => files)
        .map(s => {
            const outFilename = path.basename(s).replace(/(\.txt|\.dic|\.aff)?$/, ext);
            const dir = options.output ? options.output : path.dirname(s);
            return [s, path.join(dir, outFilename)] as [string, string];
        })
        .map(([src, dst]) => action(src, dst));

    for (const p of toProcess) {
        await p;
    }
    console.log(`Complete.`);
}

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}

