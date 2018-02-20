#!/usr/bin/env node

import * as path from 'path';
import * as program from 'commander';
const npmPackage = require(path.join(__dirname, '..', 'package.json'));
import { CSpellApplicationOptions, AppError, ConfigOptions, checkText } from './application';
import * as App from './application';
import chalk from 'chalk';

interface Options extends CSpellApplicationOptions {}
interface TraceOptions extends App.TraceOptions {}
// interface InitOptions extends Options {}

function issueEmitter(issue: App.Issue) {
    const {uri = '', row, col, text} = issue;
    console.log(`${chalk.green(uri)}[${row}, ${col}]: Unknown word: ${chalk.red(text)}`);
}

function issueEmitterWordsOnly(issue: App.Issue) {
    const {text} = issue;
    console.log(text);
}

function errorEmitter(message: string, error: Error) {
    console.error(chalk.red(message), error);
    return Promise.resolve();
}

function infoEmitter(message: string) {
    console.info(chalk.yellow(message));
}

function debugEmitter(message: string) {
    console.info(chalk.cyan(message));
}

function nullEmitter(_: string) {}

let showHelp = true;

program
    .version(npmPackage.version)
    .description('Spelling Checker for Code')
    ;

program
    .option('-c, --config <cspell.json>', 'Configuration file to use.  By default cspell looks for cspell.json in the current directory.')
    .option('-v, --verbose', 'display more information about the files being checked and the configuration')
    .option('--local <local>', 'Set language locals. i.e. "en,fr" for English and French, or "en-GB" for British English.')
    .option('--wordsOnly', 'Only output the words not found in the dictionaries.')
    .option('-u, --unique', 'Only output the first instance of a word not found in the dictionaries.')
    .option('--debug', 'Output information useful for debugging cspell.json files.')
    .option('-e, --exclude <glob>', 'Exclude files matching the glob pattern')
    .option('--no-color', 'Turn off color.')
    .option('--color', 'Force color')
    // The following options are planned features
    // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
    // .option('--force', 'Force the exit value to always be 0')
    .arguments('<files...>')
    .action((files: string[], options: Options) => {
        const emitters: App.Emitters = {
            issue: options.wordsOnly ? issueEmitterWordsOnly : issueEmitter,
            error: errorEmitter,
            info: options.verbose ? infoEmitter : nullEmitter,
            debug: options.debug ? debugEmitter : nullEmitter,
        };
        showHelp = false;
        App.lint(files, options, emitters).then(
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

interface TraceCommandOptions {
    parent: TraceOptions;
}
program
    .command('trace')
    .description('Trace words')
    .option('-c, --config <cspell.json>', 'Configuration file to use.  By default cspell looks for cspell.json in the current directory.')
    .option('--no-color', 'Turn off color.')
    .option('--color', 'Force color')
    .arguments('<words...>')
    .action((words: string[], options: TraceCommandOptions) => {
        showHelp = false;
        App.trace(words, options.parent).then(
            result => {
                result.forEach(emitTraceResult);
                process.exit(0);
            },
            (error: AppError) => {
                console.error(error.message);
                process.exit(1);
            }
        );
    });

interface CheckCommandOptions {
    parent: ConfigOptions;
}

program
    .command('check <files...>')
    .description('Spell check file(s) and display the result. The full file is displayed in color.')
    .option('-c, --config <cspell.json>', 'Configuration file to use.  By default cspell looks for cspell.json in the current directory.')
    .option('--no-color', 'Turn off color.')
    .option('--color', 'Force color')
    .action(async (files: string[], options: CheckCommandOptions) => {
        showHelp = false;

        for (const filename of files) {
            console.log(chalk.yellowBright(`Check file: ${filename}`));
            console.log();
            try {
                const result = await checkText(filename, options.parent);
                for (const item of result.items) {
                    const fn = item.flagIE === App.IncludeExcludeFlag.EXCLUDE
                        ? chalk.gray
                        : item.isError ? chalk.red : chalk.whiteBright;
                    const t = fn(item.text);
                    process.stdout.write(t);
                }
                console.log();
            } catch (e) {
                console.error(`Failed to read "${filename}"`);
            }
            console.log();
        }
        process.exit(0);
    });

/*
program
    .command('init')
    .description('(Alpha) Initialize a cspell.json file.')
    .option('-o, --output <cspell.json>', 'define where to write file.')
    .option('--extends <cspell.json>', 'extend an existing cspell.json file.')
    .action((options: InitOptions) => {
        showHelp = false;
        CSpellApplication.createInit(options).then(
            () => process.exit(0),
            () => process.exit(1)
        );
        console.log('Init');
    });
*/

program.parse(process.argv);

if (showHelp) {
    program.help();
}

function emitTraceResult(r: App.TraceResult) {
    const terminalWidth = process.stdout.columns || 120;
    const widthName = 20;
    const w = chalk.green(r.word);
    const f = r.found
        ? chalk.whiteBright('*')
        : chalk.dim('-');
    const n = chalk.yellowBright(pad(r.dictName, widthName));
    const used = [r.word.length, 1, widthName].reduce((a, b) => a + b, 3);
    const widthSrc = terminalWidth - used;
    const s = chalk.white(trimMid(r.dictSource, widthSrc));
    const line = [w, f, n, s].join(' ');
    console.log(line);

}

function pad(s: string, w: number): string {
    return (s + ' '.repeat(w)).substr(0, w);
}

function trimMid(s: string, w: number): string {
    if (s.length <= w) {
        return s;
    }
    const l = Math.floor((w - 3) / 2);
    const r = Math.ceil((w - 3) / 2);
    return s.substr(0, l) + '...' + s.substr(-r);
}
