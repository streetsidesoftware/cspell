import * as path from 'path';
import * as commander from 'commander';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require(path.join(__dirname, '..', 'package.json'));
import { checkText } from './application';
import { CSpellApplicationOptions, BaseOptions, TraceOptions } from './options';
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
import { isSpellingDictionaryLoadError, SpellingDictionaryLoadError, ImportError } from 'cspell-lib';

interface Options extends CSpellApplicationOptions {
    legacy?: boolean;
    summary: boolean;
    issues: boolean;
    silent: boolean;
    mustFindFiles: boolean;
    progress?: boolean;
    /**
     * issues are shown with a relative path to the root or `cwd`
     */
    relative?: boolean;
}
// interface InitOptions extends Options {}

const templateIssue = `{green $uri}:{yellow $row:$col} - Unknown word ({red $text})`;
const templateIssueWithSuggestions = `{green $uri}:{yellow $row:$col} - Unknown word ({red $text}) Suggestions: {yellow [$suggestions]}`;
const templateIssueWithContext = `{green $uri}:{yellow $row:$col} $padRowCol- Unknown word ({red $text})$padContext -- {gray $contextLeft}{red {underline $text}}{gray $contextRight}`;
const templateIssueWithContextWithSuggestions = `{green $uri}:{yellow $row:$col} $padRowCol- Unknown word ({red $text})$padContext -- {gray $contextLeft}{red {underline $text}}{gray $contextRight}\n\t Suggestions: {yellow [$suggestions]}`;
const templateIssueLegacy = `${chalk.green('$uri')}[$row, $col]: Unknown word: ${chalk.red('$text')}`;
const templateIssueWordsOnly = '$text';

function genIssueEmitter(template: string) {
    const defaultWidth = 10;
    let maxWidth = defaultWidth;
    let uri: string | undefined;

    return function issueEmitter(issue: Issue) {
        if (uri !== issue.uri) {
            maxWidth = defaultWidth;
            uri = issue.uri;
        }
        maxWidth = Math.max(maxWidth * 0.999, issue.text.length, 10);
        console.log(formatIssue(template, issue, Math.ceil(maxWidth)));
    };
}

function errorEmitter(message: string, error: Error | SpellingDictionaryLoadError | ImportError) {
    if (isSpellingDictionaryLoadError(error)) {
        error = error.cause;
    }
    console.error(chalk.red(message), error.toString());
}

type InfoEmitter = Record<MessageType, (msg: string) => void>;

function nullEmitter() {
    /* empty */
}

function relativeFilename(filename: string, cwd = process.cwd()): string {
    const rel = path.relative(cwd, filename);
    if (rel.startsWith('..')) return filename;
    return '.' + path.sep + rel;
}

function reportProgress(p: ProgressItem) {
    if (isProgressFileComplete(p)) {
        const fc = '' + p.fileCount;
        const fn = (' '.repeat(fc.length) + p.fileNum).slice(-fc.length);
        const idx = fn + '/' + fc;
        const filename = chalk.gray(relativeFilename(p.filename));
        const time = reportTime(p.elapsedTimeMs);
        const skipped = p.processed === false ? ' skipped' : '';
        const hasErrors = p.numErrors ? chalk.red` X` : '';
        console.error(`${idx} ${filename} ${time}${skipped}${hasErrors}`);
    }
}

function reportTime(elapsedTimeMs: number | undefined): string {
    if (elapsedTimeMs === undefined) return '-';
    const color = elapsedTimeMs < 1000 ? chalk.white : elapsedTimeMs < 2000 ? chalk.yellow : chalk.redBright;
    return color(elapsedTimeMs.toFixed(2) + 'ms');
}

function getEmitters(options: Options): Emitters {
    const issueTemplate = options.wordsOnly
        ? templateIssueWordsOnly
        : options.legacy
        ? templateIssueLegacy
        : options.showContext
        ? options.showSuggestions
            ? templateIssueWithContextWithSuggestions
            : templateIssueWithContext
        : options.showSuggestions
        ? templateIssueWithSuggestions
        : templateIssue;
    const { silent, issues, progress, verbose, debug } = options;

    const emitters: InfoEmitter = {
        Debug: !silent && debug ? (s) => console.info(chalk.cyan(s)) : nullEmitter,
        Info: !silent && verbose ? (s) => console.info(chalk.yellow(s)) : nullEmitter,
    };

    function infoEmitter(message: string, msgType: MessageType): void {
        emitters[msgType]?.(message);
    }

    const root = options.root || process.cwd();
    function relativeIssue(fn: (i: Issue) => void): (i: Issue) => void {
        if (!options.relative) return fn;
        return (i: Issue) => {
            const r = { ...i };
            r.uri = r.uri ? relativeFilename(r.uri, root) : r.uri;
            fn(r);
        };
    }

    return {
        issue: relativeIssue(silent || !issues ? nullEmitter : genIssueEmitter(issueTemplate)),
        error: silent ? nullEmitter : errorEmitter,
        info: infoEmitter,
        debug: emitters.Debug,
        progress: !silent && progress ? reportProgress : nullEmitter,
    };
}

export async function run(program?: commander.Command, argv?: string[]): Promise<void> {
    const prog = program || commander;
    const args = argv || process.argv;

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
            '--locale <locale>',
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
        .option('--relative', 'Issues are displayed relative to root.')
        .option('--show-context', 'Show the surrounding text around an issue.')
        .option('--show-suggestions', 'Show spelling suggestions.')
        .option('--must-find-files', 'Error if no files are found', true)
        .option('--no-must-find-files', 'Do not error is no files are found')
        // The following options are planned features
        // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
        // .option('--force', 'Force the exit value to always be 0')
        .option('--legacy', 'Legacy output')
        .option('--local <local>', 'Deprecated -- Use: --locale')
        .addHelpText('after', usage)
        .arguments('[files...]')
        .action((files: string[], options: Options) => {
            const { mustFindFiles } = options;
            const emitters: Emitters = getEmitters(options);
            return App.lint(files, options, emitters).then((result) => {
                if (!files.length && !result.files) {
                    spellCheckCommand.outputHelp();
                    throw new CheckFailed('outputHelp', 1);
                }
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
            '--locale <locale>',
            'Set language locales. i.e. "en,fr" for English and French, or "en-GB" for British English.'
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
    cspell "**/*.{txt,js,md}"       Check .txt, .js, and .md files.
    cat LICENSE | cspell stdin      Check stdin
`;

function collect(value: string, previous: string[] | undefined): string[] {
    if (!previous) {
        return [value];
    }
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

function formatIssue(templateStr: string, issue: Issue, maxIssueTextWidth: number) {
    function clean(t: string) {
        return t.replace(/\s+/, ' ');
    }
    const { uri = '', row, col, text, context, offset } = issue;
    const contextLeft = clean(context.text.slice(0, offset - context.offset));
    const contextRight = clean(context.text.slice(offset + text.length - context.offset));
    const contextFull = clean(context.text);
    const padContext = ' '.repeat(Math.max(maxIssueTextWidth - text.length, 0));
    const rowText = row.toString();
    const colText = col.toString();
    const padRowCol = ' '.repeat(Math.max(1, 8 - (rowText.length + colText.length)));
    const suggestions = issue.suggestions?.join(', ') || '';
    const t = template(templateStr);
    return chalk(t)
        .replace(/\$\{col\}/g, colText)
        .replace(/\$\{row\}/g, rowText)
        .replace(/\$\{text\}/g, text)
        .replace(/\$\{uri\}/g, uri)
        .replace(/\$col/g, colText)
        .replace(/\$contextFull/g, contextFull)
        .replace(/\$contextLeft/g, contextLeft)
        .replace(/\$contextRight/g, contextRight)
        .replace(/\$padContext/g, padContext)
        .replace(/\$padRowCol/g, padRowCol)
        .replace(/\$row/g, rowText)
        .replace(/\$suggestions/g, suggestions)
        .replace(/\$text/g, text)
        .replace(/\$uri/g, uri);
}

class TS extends Array<string> {
    raw: string[];
    constructor(s: string) {
        super(s);
        this.raw = [s];
    }
}

function template(s: string): TemplateStringsArray {
    return new TS(s);
}

export class CheckFailed extends Error {
    constructor(message: string, readonly exitCode: number = 1) {
        super(message);
    }
}
