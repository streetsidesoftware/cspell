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
    .option('-v, --verbose', 'display more information about the files being checked and the configuration')
    .option('-w, --wordsOnly', 'Only output the words not found in the dictionaries.')
    .option('-u, --unique', 'Only output the first instance of a word not found in the dictionaries.')
    .option('--debug', 'Output information useful for debugging cspell.json files.')
    .option('-e, --exclude <glob>', 'Exclude files matching the glob pattern')
    .arguments('<files...>')
    .action(function (files: string[], options: Options) {
        showHelp = false;
        const app = new CSpellApplication(files, options, console.log);
        app.run().then(
            result => {
                console.error('CSpell: Files checked: %d, Issues found: %d in %d files', result.files, result.issues, result.filesWithIssues.size);
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
