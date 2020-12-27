import * as path from 'path';
import * as commander from 'commander';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require(path.join(__dirname, '..', 'package.json'));
import { CSpellApplicationOptions, BaseOptions, checkText } from './application';
import * as App from './application';
import chalk = require('chalk');
import {
    addPathsToGlobalImports,
    addPathsToGlobalImportsResultToTable,
    listGlobalImports,
    listGlobalImportsResultToTable,
    removePathsFromGlobalImports,
} from './link';
import { tableToLines } from './util/table';
import { Emitters, isProgressFileComplete, MessageType, ProgressItem, Issue } from './emitters';

interface Options extends CSpellApplicationOptions {
    legacy?: boolean;
    summary: boolean;
    issues: boolean;
    silent: boolean;
    mustFindFiles: boolean;
    progress?: boolean;
}
type TraceOptions = App.TraceOptions;
// interface InitOptions extends Options {}

const templateIssue = `${chalk.green('${uri}')}:${chalk.yellow('${row}:${col}')} - Unknown word (${chalk.red(
    '${text}'
)})`;
const templateIssueLegacy = `${chalk.green('${uri}')}[\${row}, \${col}]: Unknown word: ${chalk.red('${text}')}`;
const templateIssueWordsOnly = '${text}';

function genIssueEmitter(template: string) {
    return function issueEmitter(issue: Issue) {
        console.log(formatIssue(template, issue));
    };
}

function errorEmitter(message: string, error: Error) {
    console.error(chalk.red(message), error.toString());
}

type InfoEmitter = Record<MessageType, (msg: string) => void>;

function nullEmitter() {
    /* empty */
}

function relativeFilename(filename: string): string {
    const cwd = process.cwd();
    if (filename.startsWith(cwd)) {
        return '.' + filename.slice(cwd.length);
    }
    return filename;
}

function reportProgress(p: ProgressItem) {
    if (isProgressFileComplete(p)) {
        const fc = '' + p.fileCount;
        const fn = (' '.repeat(fc.length) + p.fileNum).slice(-fc.length);
        const idx = fn + '/' + fc;
        const filename = chalk.gray(relativeFilename(p.filename));
        const time = p.elapsedTimeMs !== undefined ? chalk.white(p.elapsedTimeMs.toFixed(2) + 'ms') : '-';
        console.error(`${idx} ${filename} ${time}`);
    }
}

function getEmitters(options: Options): Emitters {
    const issueTemplate = options.wordsOnly
        ? templateIssueWordsOnly
        : options.legacy
        ? templateIssueLegacy
        : templateIssue;
    const { silent, issues, progress, verbose, debug } = options;

    const emitters: InfoEmitter = {
        Debug: !silent && debug ? (s) => console.info(chalk.cyan(s)) : nullEmitter,
        Info: !silent && verbose ? (s) => console.info(chalk.yellow(s)) : nullEmitter,
    };

    function infoEmitter(message: string, msgType: MessageType): void {
        emitters[msgType]?.(message);
    }

    return {
        issue: silent || !issues ? nullEmitter : genIssueEmitter(issueTemplate),
        error: silent ? nullEmitter : errorEmitter,
        info: infoEmitter,
        debug: emitters.Debug,
        progress: !silent && progress ? reportProgress : nullEmitter,
    };
}

export async function run(program?: commander.Command, argv?: string[]): Promise<void> {
    const prog = program || commander;
    const args = argv || process.argv;

    prog.passCommandToAction(false);

    prog.exitOverride();

    prog.version(npmPackage.version)
        .description('Spelling Checker for Code')
        .name('cspell')
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color');

    const spellCheckCommand = prog.command('lint', { isDefault: true });
    spellCheckCommand
        .description('Check spelling')
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
        )
        .option('-v, --verbose', 'display more information about the files being checked and the configuration')
        .option(
            '--locale <local>',
            'Set language locales. i.e. "en,fr" for English and French, or "en-GB" for British English.'
        )
        .option('--language-id <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
        .option('--languageId <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
        .option('--wordsOnly', 'Only output the words not found in the dictionaries.')
        .option('-u, --unique', 'Only output the first instance of a word not found in the dictionaries.')
        .option('--debug', 'Output information useful for debugging cspell.json files.')
        .option(
            '-e, --exclude <glob>',
            'Exclude files matching the glob pattern. This option can be used multiple times to add multiple globs. ',
            collect
        )
        .option('--no-issues', 'Do not show the spelling errors.')
        .option('--no-progress', 'Turn off progress messages')
        .option('--no-summary', 'Turn off summary message in console')
        .option('-s, --silent', 'Silent mode, suppress error messages')
        .option('-r, --root <root folder>', 'Root directory, defaults to current directory.')
        .option('--must-find-files', 'Error if no files are found', true)
        .option('--no-must-find-files', 'Do not error is no files are found')
        // The following options are planned features
        // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
        // .option('--force', 'Force the exit value to always be 0')
        .option('--legacy', 'Legacy output')
        .option('--local <local>', 'Deprecated -- Use: --locale')
        .arguments('[files...]')
        .action((files: string[], options: Options) => {
            const { mustFindFiles } = options;
            const emitters: Emitters = getEmitters(options);
            if (!files.length) {
                spellCheckCommand.help((text) => text + usage);
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
                return;
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
            const numErrors = results.map((r) => r.errors?.length || 0).reduce((n, r) => n + r, 0);
            if (numErrors) {
                console.error('Dictionary Errors.');
                throw new CheckFailed('dictionary errors', 1);
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
            for (const filename of files) {
                console.log(chalk.yellowBright(`Check file: ${filename}`));
                console.log();
                try {
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
        });

    const linkCommand = prog
        .command('link')
        .description('Link dictionaries any other settings to the cspell global config.');

    linkCommand
        .command('list', { isDefault: true })
        .alias('ls')
        .description('List currently linked configurations.')
        .action(() => {
            const imports = listGlobalImports();
            const table = listGlobalImportsResultToTable(imports.list);
            tableToLines(table).forEach((line) => console.log(line));
            return;
        });

    linkCommand
        .command('add <dictionaries...>')
        .alias('a')
        .description('Add dictionaries any other settings to the cspell global config.')
        .action((dictionaries: string[]) => {
            const r = addPathsToGlobalImports(dictionaries);
            const table = addPathsToGlobalImportsResultToTable(r);
            console.log('Adding:');
            tableToLines(table).forEach((line) => console.log(line));
            if (r.error) {
                throw new CheckFailed(r.error, 1);
            }
            return;
        });

    linkCommand
        .command('remove <paths...>')
        .alias('r')
        .description('Remove matching paths / packages from the global config.')
        .action((dictionaries: string[]) => {
            const r = removePathsFromGlobalImports(dictionaries);
            console.log('Removing:');
            if (r.error) {
                throw new CheckFailed(r.error, 1);
            }
            r.removed.map((f) => console.log(f));
            return;
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

    return prog.parseAsync(args).then(() => {
        return;
    });
}

function collect(value: string, previous: string[] | undefined): string[] {
    if (!previous) {
        return [value];
    }
    console.log(previous);
    return previous.concat([value]);
}

function emitTraceResult(r: App.TraceResult) {
    const terminalWidth = process.stdout.columns || 120;
    const widthName = 20;
    const errors = r.errors?.map((e) => e.message)?.join('\n\t') || '';
    const w = chalk.green(r.word);
    const f = r.found ? chalk.whiteBright('*') : errors ? chalk.red('X') : chalk.dim('-');
    const n = chalk.yellowBright(pad(r.dictName, widthName));
    const used = [r.word.length, 1, widthName].reduce((a, b) => a + b, 3);
    const widthSrc = terminalWidth - used;
    const c = errors ? chalk.red : chalk.white;
    const s = c(trimMid(r.dictSource, widthSrc));
    const line = [w, f, n, s].join(' ');
    console.log(line);
    if (errors) {
        console.error('\t' + chalk.red(errors));
    }
}

function pad(s: string, w: number): string {
    return (s + ' '.repeat(w)).substr(0, w);
}

function trimMid(s: string, w: number): string {
    s = s.trim();
    if (s.length <= w) {
        return s;
    }
    const l = Math.floor((w - 3) / 2);
    const r = Math.ceil((w - 3) / 2);
    return s.substr(0, l) + '...' + s.substr(-r);
}

function formatIssue(template: string, issue: Issue) {
    const { uri = '', row, col, text } = issue;
    return template
        .replace(/\$\{uri\}/, uri)
        .replace(/\$\{row\}/, row.toString())
        .replace(/\$\{col\}/, col.toString())
        .replace(/\$\{text\}/, text);
}

export class CheckFailed extends Error {
    constructor(message: string, readonly errorCode: number) {
        super(message);
    }
}
