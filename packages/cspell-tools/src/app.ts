#!/usr/bin/env node

import { compileWordList } from './compiler';
import * as path from 'path';
import * as program from 'commander';
import * as Rx from 'rxjs/Rx';
import * as glob from 'glob';
import * as minimatch from 'minimatch';
const npmPackage = require(path.join(__dirname, '..', 'package.json'));

type GlobRx = (filename: string, options?: minimatch.IOptions) => Rx.Observable<string[]>;
const globRx: GlobRx = Rx.Observable.bindNodeCallback<string, string[]>(glob);

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

        const ext = options.compress ? '.gz' : '';

        Rx.Observable.from(src)
            .flatMap(src => globRx(src))
            .flatMap(s => s)
            .map(s => [s, options.output ? path.join(options.output, path.basename(s) + ext) : s + ext])
            .concatMap(([src, dst]) => {
                console.log('Process "%s" to "%s"', src, dst);
                return compileWordList(src, dst).then(() => src);
            })
            .forEach(name => console.log(`Complete.`));
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}

