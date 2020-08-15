#!/usr/bin/env node

import * as path from 'path';
import * as commander from 'commander';
const npmPackage = require(path.join(__dirname, '..', 'package.json'));
import { CSpellApplicationOptions, BaseOptions, checkText } from './application';
import * as App from './application';
import chalk = require('chalk');

interface Options extends CSpellApplicationOptions {
    legacy?: boolean;
    summary: boolean;
    issues: boolean;
    silent: boolean;
}
interface TraceOptions extends App.TraceOptions {}
// interface InitOptions extends Options {}

const templateIssue = `${chalk.green('${uri}')}:${chalk.yellow('${row}:${col}')} - Unknown word (${chalk.red('${text}')})`;
const templateIssueLegacy = `${chalk.green('${uri}')}[\${row}, \${col}]: Unknown word: ${chalk.red('${text}')}`;
const templateIssueWordsOnly = '${text}';

function genIssueEmitter(template: string) {
    return function issueEmitter(issue: App.Issue) {
        console.log(formatIssue(template, issue));
    };
}

function errorEmitter(message: string, error: Error) {
    console.error(chalk.red(message), error);
    return Promise.resolve();
}

function infoEmitter(message: string, msgType: App.MessageType) {
    switch (msgType) {
        case 'Debug': console.info(chalk.cyan(message)); break;
        case 'Info': console.info(chalk.yellow(message)); break;
        case 'Progress': console.info(chalk.white(message)); break;
    }
}

function debugEmitter(message: string) {
    infoEmitter(message, App.MessageTypes.Debug);
}

function nullEmitter(_: string | App.Issue) {}
async function asyncNullEmitter(_: string | App.Issue) {}

function getEmitters(options: Options): App.Emitters {
    const issueTemplate = options.wordsOnly ? templateIssueWordsOnly : options.legacy ? templateIssueLegacy : templateIssue;
    const { silent = false, issues } = options;
    return {
        issue: silent || !issues ? nullEmitter : genIssueEmitter(issueTemplate),
        error: silent ? asyncNullEmitter : errorEmitter,
        info: silent || !options.verbose ? nullEmitter : infoEmitter,
        debug: options.debug ? debugEmitter : nullEmitter,
    };
}

export async function run(program?: commander.Command, argv?: string[]): Promise<void> {
    const prog = program || commander;
    const args = argv || process.argv;

    return new Promise((resolve, rejects) => {
        let showHelp = true;

        (prog as any).exitOverride();

        prog
            .version(npmPackage.version)
            .description('Spelling Checker for Code')
            .option(
                '-c, --config <cspell.json>',
                'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
            )
            .option('--no-color', 'Turn off color.')
            .option('--color', 'Force color');

        prog
            .option('-v, --verbose', 'display more information about the files being checked and the configuration')
            .option('--local <local>', 'Set language locals. i.e. "en,fr" for English and French, or "en-GB" for British English.')
            .option('--legacy', 'Legacy output')
            .option('--languageId <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
            .option('--wordsOnly', 'Only output the words not found in the dictionaries.')
            .option('-u, --unique', 'Only output the first instance of a word not found in the dictionaries.')
            .option('--debug', 'Output information useful for debugging cspell.json files.')
            .option('-e, --exclude <glob>', 'Exclude files matching the glob pattern')
            .option('--no-issues', 'Do not show the spelling errors.')
            .option('--no-summary', 'Turn off summary message in console')
            .option('-s, --silent', 'Silent mode, suppress error messages')
            .option('-r, --root <root folder>', 'Root directory, defaults to current directory.')
            // The following options are planned features
            // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
            // .option('--force', 'Force the exit value to always be 0')
            .arguments('<files...>')
            .action((files: string[] | undefined, options: Options) => {
                const emitters: App.Emitters = getEmitters(options);
                if (!files || !files.length) {
                    return;
                }
                showHelp = false;
                return App.lint(files, options, emitters).then(
                    (result) => {
                        if (options.summary && !options.silent) {
                            console.error(
                                'CSpell: Files checked: %d, Issues found: %d in %d files',
                                result.files,
                                result.issues,
                                result.filesWithIssues.size
                            );
                        }
                        if (result.issues) {
                            throw new CheckFailed('check failed', 1);
                        }
                    }
                );
            });

        interface TraceCommandOptions {
            parent: TraceOptions;
        }
        prog
            .command('trace')
            .description('Trace words')
            .option(
                '-c, --config <cspell.json>',
                'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
            )
            .option('--local <local>', 'Set language locals. i.e. "en,fr" for English and French, or "en-GB" for British English.')
            .option('--languageId <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
            .option('--no-color', 'Turn off color.')
            .option('--color', 'Force color')
            .arguments('<words...>')
            .action((words: string[], options: TraceCommandOptions) => {
                showHelp = false;
                return App.trace(words, options.parent).then(
                    (result) => {
                        result.forEach(emitTraceResult);
                    }
                );
            });

        interface CheckCommandOptions {
            parent: BaseOptions;
        }

        prog
            .command('check <files...>')
            .description('Spell check file(s) and display the result. The full file is displayed in color.')
            .option(
                '-c, --config <cspell.json>',
                'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
            )
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
                            const fn =
                                item.flagIE === App.IncludeExcludeFlag.EXCLUDE ? chalk.gray : item.isError ? chalk.red : chalk.whiteBright;
                            const t = fn(item.text);
                            process.stdout.write(t);
                        }
                        console.log();
                    } catch (e) {
                        console.error(`Failed to read "${filename}"`);
                    }
                    console.log();
                }
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

        const usage = `

Examples:
    cspell "*.js"                   Check all .js files in the current directory
    cspell "**/*.js"                Check all .js files from the current directory
    cspell "src/**/*.js"            Only check .js under src
    cspell "**/*.txt" "**/*.js"     Check both .js and .txt files.
    cat LICENSE | cspell stdin      Read from stdin the contents of LICENSE
`;

        prog.on('--help', function () {
            console.log(usage);
            showHelp = false;
        });

        function reject(e: any) {
            if (showHelp) {
                prog.help();
            }
            rejects(e);
        }

        try {
            prog.parseAsync(args).then(() => {
                if (showHelp) {
                    prog.help();
                }
                resolve();
            }).catch(reject);
        } catch (e) {
            reject(e);
        }
    });
}

function emitTraceResult(r: App.TraceResult) {
    const terminalWidth = process.stdout.columns || 120;
    const widthName = 20;
    const w = chalk.green(r.word);
    const f = r.found ? chalk.whiteBright('*') : chalk.dim('-');
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

function formatIssue(template: string, issue: App.Issue) {
    const { uri = '', row, col, text } = issue;
    return template
        .replace(/\$\{uri\}/, uri)
        .replace(/\$\{row\}/, row.toString())
        .replace(/\$\{col\}/, col.toString())
        .replace(/\$\{text\}/, text);
}

export class CheckFailed extends Error {
    constructor(message: string, readonly errorCode: number, ) {
        super(message);
    }
}
