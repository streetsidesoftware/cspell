#!/usr/bin/env node

import * as path from 'path';
import * as program from 'commander';
const npmPackage = require(path.join(__dirname, '..', 'package.json'));
import { CSpellApplication, CSpellApplicationOptions, AppError} from './application';

interface Options extends CSpellApplicationOptions, program.IExportedCommand {}

let showHelp = true;

program
    .version(npmPackage.version)
    .description('Spelling Checker for Code')
    ;

program
    .option('-c, --config <cspell.json>', 'Configuration file to use.  By default cspell looks for cspell.json in the current directory.')
    .option('-v, --verbose', 'output more information about the files being checked and the configuration')
    .option('-e, --exclude <glob>', 'Exclude files matching the glob pattern')
    .arguments('<files...>')
    .action(function (files: string[], options: Options) {
        showHelp = false;
        const app = new CSpellApplication(files, options, console.log);
        app.run().then(
            result => {
                console.log('CSpell: Files checked: %d, Issues found: %d', result.files, result.issues);
                process.exit(result.issues ? 1 : 0);
            },
            (error: AppError) => {
                console.error(error.message);
                process.exit(1);
            }
        );
    });



program.parse(process.argv);

if (showHelp) {
    program.help();
}
