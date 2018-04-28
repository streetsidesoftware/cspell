#!/usr/bin/env node

// For large dictionaries, it is necessary to increase the memory limit.
// # !/usr/bin/env node --max_old_space_size=8192


import { compileWordList, compileTrie } from './compiler';
import * as path from 'path';
import * as program from 'commander';
import { Observable, bindNodeCallback, from } from 'rxjs';
import { flatMap, map, concatMap } from 'rxjs/operators';
import * as glob from 'glob';
import * as minimatch from 'minimatch';
const npmPackage = require(path.join(__dirname, '..', 'package.json'));

type GlobRx = (filename: string, options?: minimatch.IOptions) => Observable<string[]>;
const globRx: GlobRx = bindNodeCallback<string, string[]>(glob);

program
    .version(npmPackage.version);

program
    .command('compile <src...>')
    .description('compile words lists into simple dictionary files.')
    .option('-o, --output <path>', 'Specify the output directory, otherwise files are written back to the same location.')
    .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
    .action((src: string[], options: { output?: string, compress: boolean }) => {
        console.log('Compile:\n output: %s\n compress: %s\n files:\n  %s \n\n',
            options.output || 'default',
            options.compress ? 'true' : 'false',
            src.join('\n  ') );

        const ext = '.txt' + (options.compress ? '.gz' : '');

        from(src).pipe(
            flatMap(src => globRx(src)),
            flatMap(s => s),
            map(s => {
                const outFilename = path.basename(s).replace(/(\.txt|\.dic|\.aff)?$/, ext);
                const dir = options.output ? options.output : path.dirname(s);
                return [s, path.join(dir, outFilename)];
            }),
            concatMap(([src, dst]) => {
                console.log('Process "%s" to "%s"', src, dst);
                return compileWordList(src, dst).then(() => src);
            }),
        )
        .forEach(name => console.log(`Complete.`));
    });

program
    .command('compile-trie <src...>')
    .description('Compile words lists or Hunspell dictionary into trie files used by cspell.')
    .option('-o, --output <path>', 'Specify the output directory, otherwise files are written back to the same location.')
    .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
    .action((src: string[], options: { output?: string, compress: boolean }) => {
        console.log('Compile:\n output: %s\n compress: %s\n files:\n  %s \n\n',
            options.output || 'default',
            options.compress ? 'true' : 'false',
            src.join('\n  ') );

        const ext = '.trie' + (options.compress ? '.gz' : '');

        from(src).pipe(
            flatMap(src => globRx(src)),
            flatMap(s => s),
            map(s => {
                const outFilename = path.basename(s).replace(/(\.txt|\.dic|\.aff)?$/, ext);
                const dir = options.output ? options.output : path.dirname(s);
                return [s, path.join(dir, outFilename)];
            }),
            concatMap(([src, dst]) => {
                console.log('Process "%s" to "%s"', src, dst);
                return compileTrie(src, dst).then(() => src);
            })
        )
        .forEach(name => console.log(`Complete.`));
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}

