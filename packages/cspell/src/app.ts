import * as path from 'path';
import * as commander from 'commander';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require(path.join(__dirname, '..', 'package.json'));
import { CSpellApplicationOptions, BaseOptions, checkText } from './application';
import * as App from './application';
import chalk = require('chalk');

interface Options extends CSpellApplicationOptions {
    legacy?: boolean;
    summary: boolean;
    issues: boolean;
    silent: boolean;
    mustFindFiles: boolean;
}
type TraceOptions = App.TraceOptions;
// interface InitOptions extends Options {}

const templateIssue = `${chalk.green('${uri}')}:${chalk.yellow('${row}:${col}')} - Unknown word (${chalk.red(
    '${text}'
)})`;
const templateIssueLegacy = `${chalk.green('${uri}')}[\${row}, \${col}]: Unknown word: ${chalk.red('${text}')}`;
const templateIssueWordsOnly = '${text}';

function genIssueEmitter(template: string) {
    return function issueEmitter(issue: App.Issue) {
        console.log(formatIssue(template, issue));
    };
}

function errorEmitter(message: string, error: Error) {
    console.error(chalk.red(message), error.toString());
}

function infoEmitter(message: string, msgType: App.MessageType) {
    switch (msgType) {
        case 'Debug':
            console.info(chalk.cyan(message));
            break;
        case 'Info':
            console.info(chalk.yellow(message));
            break;
        case 'Progress':
            console.info(chalk.white(message));
            break;
    }
}

function debugEmitter(message: string) {
    infoEmitter(message, App.MessageTypes.Debug);
}

function nullEmitter(_: string | App.Issue) {
    /* empty */
}
async function asyncNullEmitter(_: string | App.Issue) {
    /* empty */
}

function getEmitters(options: Options): App.Emitters {
    const issueTemplate = options.wordsOnly
        ? templateIssueWordsOnly
        : options.legacy
        ? templateIssueLegacy
        : templateIssue;
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

    prog.exitOverride();

    prog.version(npmPackage.version)
        .description('Spelling Checker for Code')
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
        )
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color');

    prog.option('-v, --verbose', 'display more information about the files being checked and the configuration')
        .option(
            '--local <local>',
            'Set language locals. i.e. "en,fr" for English and French, or "en-GB" for British English.'
        )
        .option('--language-id <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
        .option('--languageId <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
        .option('--wordsOnly', 'Only output the words not found in the dictionaries.')
        .option('-u, --unique', 'Only output the first instance of a word not found in the dictionaries.')
        .option('--debug', 'Output information useful for debugging cspell.json files.')
        .option('-e, --exclude <glob>', 'Exclude files matching the glob pattern')
        .option('--no-issues', 'Do not show the spelling errors.')
        .option('--no-summary', 'Turn off summary message in console')
        .option('-s, --silent', 'Silent mode, suppress error messages')
        .option('-r, --root <root folder>', 'Root directory, defaults to current directory.')
        .option('--must-find-files', 'Error if no files are found', false)
        .option('--no-must-find-files', 'Do not error is no files are found')
        // The following options are planned features
        // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
        // .option('--force', 'Force the exit value to always be 0')
        .option('--legacy', 'Legacy output')
        .addHelpText('after', usage)
        .arguments('[files...]')
        .action((files: string[] | undefined, options: Options) => {
            const { mustFindFiles } = options;
            const emitters: App.Emitters = getEmitters(options);
            if (!files || !files.length) {
                prog.help();
                return;
            }
            return App.lint(files, options, emitters).then((result) => {
                if (options.summary && !options.silent) {
                    console.error(
                        'CSpell: Files checked: %d, Issues found: %d in %d files',
                        result.files,
                        result.issues,
                        result.filesWithIssues.size
                    );
                }
                if (result.issues || result.errors || (mustFindFiles && !result.files)) {
                    throw new CheckFailed('check failed', 1);
                }
            });
        });

    type TraceCommandOptions = TraceOptions;

    prog.command('trace')
        .description('Trace words')
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
        )
        .option(
            '--local <local>',
            'Set language locals. i.e. "en,fr" for English and French, or "en-GB" for British English.'
        )
        .option('--languageId <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color')
        .arguments('<words...>')
        .action(async (words: string[], options: TraceCommandOptions) => {
            const results = await App.trace(words, options);
            results.forEach(emitTraceResult);
            const numFound = results.reduce((n, r) => n + (r.found ? 1 : 0), 0);
            if (!numFound) {
                console.error('No matches found');
                throw new CheckFailed('no matches', 1);
            }
        });

    type CheckCommandOptions = BaseOptions;

    prog.command('check <files...>')
        .description('Spell check file(s) and display the result. The full file is displayed in color.')
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
        )
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color')
        .action(async (files: string[], options: CheckCommandOptions) => {
            let issueCount = 0;
            let fileCount = 0;
            for (const filename of files) {
                console.log(chalk.yellowBright(`Check file: ${filename}`));
                console.log();
                try {
                    fileCount++;
                    const result = await checkText(filename, options);
                    for (const item of result.items) {
                        const fn =
                            item.flagIE === App.IncludeExcludeFlag.EXCLUDE
                                ? chalk.gray
                                : item.isError
                                ? chalk.red
                                : chalk.whiteBright;
                        const t = fn(item.text);
                        process.stdout.write(t);
                        issueCount += item.isError ? 1 : 0;
                    }
                    console.log();
                } catch (e) {
                    console.error(`File not found "${filename}"`);
                    throw new CheckFailed('File not found', 1);
                }
                console.log();
            }
            if (issueCount) {
                throw new CheckFailed('Issues found', 1);
            }
            if (!fileCount) {
                console.error('No files found');
                throw new CheckFailed('No files found', 1);
            }
        });

    /*
        program
            .command('init')
            .description('(Alpha) Initialize a cspell.json file.')
            .option('-o, --output <cspell.json>', 'define where to write file.')
            .option('--extends <cspell.json>', 'extend an existing cspell.json file.')
            .action((options: InitOptions) => {
                CSpellApplication.createInit(options).then(
                    () => process.exit(0),
                    () => process.exit(1)
                );
                console.log('Init');
            });
        */

    return prog.parseAsync(args).then(() => {
        return;
    });
}

const usage = `
Examples:
    cspell "*.js"                   Check all .js files in the current directory
    cspell "**/*.js"                Check all .js files from the current directory
    cspell "src/**/*.js"            Only check .js under src
    cspell "**/*.txt" "**/*.js"     Check both .js and .txt files.
    cat LICENSE | cspell stdin      Read from stdin the contents of LICENSE
`;

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
    constructor(message: string, readonly _errorCode: number) {
        super(message);
    }
}
