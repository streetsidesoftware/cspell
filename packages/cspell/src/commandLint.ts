import { Command, Option as CommanderOption } from 'commander';
import * as App from './application';
import { getReporter } from './cli-reporter';
import { LinterOptions } from './options';
import { DEFAULT_CACHE_LOCATION } from './util/cache';
import { CheckFailed } from './util/errors';

export interface LinterCliOptions extends LinterOptions {
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

export function commandLint(prog: Command): Command {
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
        .addOption(
            new CommanderOption(
                '--languageId <language>',
                'Force programming language for unknown extensions. i.e. "php" or "scala"'
            ).hideHelp()
        )
        .option('--words-only', 'Only output the words not found in the dictionaries.')
        .addOption(
            new CommanderOption('--wordsOnly', 'Only output the words not found in the dictionaries.').hideHelp()
        )
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
        .addOption(new CommanderOption('--must-find-files', 'Error if no files are found').default(true).hideHelp())
        .option('--no-must-find-files', 'Do not error if no files are found')
        // The following options are planned features
        // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
        // .option('--force', 'Force the exit value to always be 0')
        .option('--legacy', 'Legacy output')
        .addOption(new CommanderOption('--local <local>', 'Deprecated -- Use: --locale').hideHelp())
        .option('--cache', 'Only check changed files', false)
        .addOption(
            new CommanderOption('--cache-strategy <strategy>', 'Strategy to use for detecting changed files').choices([
                'metadata',
                'content',
            ])
        )
        .option('--cache-location <path>', `Path to the cache file or directory`, DEFAULT_CACHE_LOCATION)
        .option('--dot', 'Include files and directories starting with `.` (period) when matching globs.')
        .option('--gitignore', 'Ignore files matching glob patterns found in .gitignore files.')
        .option('--no-gitignore', 'Do NOT use .gitignore files.')
        .option('--gitignore-root <path>', 'Prevent searching for .gitignore files past root.', collect)
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color')
        .addHelpText('after', usage)
        .arguments('[files...]')
        .action((files: string[], options: LinterCliOptions) => {
            options.files = files;
            const { mustFindFiles } = options;
            const cliReporter = getReporter(options);
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

    return spellCheckCommand;
}
