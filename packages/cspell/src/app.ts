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
import { emitTraceResults } from './traceEmitter';
import { getReporter } from './cli-reporter';
import { CheckFailed } from './util/errors';
import { DEFAULT_CACHE_LOCATION } from './util/cache';

export { CheckFailed } from './util/errors';

export interface Options extends CSpellApplicationOptions {
    files: string[];
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

export async function run(program?: commander.Command, argv?: string[]): Promise<void> {
    const prog = program || commander.program;
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
        .option('--no-must-find-files', 'Do not error if no files are found')
        // The following options are planned features
        // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
        // .option('--force', 'Force the exit value to always be 0')
        .option('--legacy', 'Legacy output')
        .option('--local <local>', 'Deprecated -- Use: --locale')
        .option('--cache', 'Only check changed files', false)
        .option('--cache-location <path>', `Path to the cache file or directory (default: "${DEFAULT_CACHE_LOCATION}")`)
        .addHelpText('after', usage)
        .arguments('[files...]')
        .action((files: string[], options: Options) => {
            options.files = files;
            const { mustFindFiles } = options;
            const cliReporter = getReporter(options);
            if (options.cacheLocation) {
                options.cache = true;
            }
            return App.lint(files, options, cliReporter).then((result) => {
                if (!files.length && !result.files) {
                    spellCheckCommand.outputHelp();
                    throw new CheckFailed('outputHelp', 1);
                }
                if (result.issues || result.errors || (mustFindFiles && !result.files)) {
                    throw new CheckFailed('check failed', 1);
                }
                return;
            });
        });

    type TraceCommandOptions = TraceOptions;

    prog.command('trace')
        .description(
            `Trace words
  Search for words in the configuration and dictionaries.`
        )
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
            emitTraceResults(results, { cwd: process.cwd() });
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
