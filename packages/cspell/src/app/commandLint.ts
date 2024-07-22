import type { AddHelpTextContext, Command } from 'commander';
import { Option as CommanderOption } from 'commander';

import * as App from './application.mjs';
import type { LinterCliOptions } from './options.js';
import { DEFAULT_CACHE_LOCATION } from './util/cache/index.js';
import { CheckFailed } from './util/errors.js';
import { unindent } from './util/unindent.js';

// interface InitOptions extends Options {}

const usage = `\
[options] [globs...] [file://<path> ...] [stdin[://<path>]]

Patterns:
 - [globs...]            Glob Patterns
 - [stdin]               Read from "stdin" assume text file.
 - [stdin://<path>]      Read from "stdin", use <path> for file type and config.
 - [file://<path>]       Check the file at <path>

Examples:
    cspell .                        Recursively check all files.
    cspell lint .                   The same as "cspell ."
    cspell "*.js"                   Check all .js files in the current directory
    cspell "**/*.js"                Check all .js files recursively
    cspell "src/**/*.js"            Only check .js under src
    cspell "**/*.txt" "**/*.js"     Check both .js and .txt files.
    cspell "**/*.{txt,js,md}"       Check .txt, .js, and .md files.
    cat LICENSE | cspell stdin      Check stdin
    cspell stdin://docs/doc.md      Check stdin as if it was "./docs/doc.md"\
`;

const advanced = `
More Examples:

    cspell "**/*.js" --reporter @cspell/cspell-json-reporter
        This will spell check all ".js" files recursively and use
        "@cspell/cspell-json-reporter".

    cspell . --reporter default
        This will force the default reporter to be used overriding
        any reporters defined in the configuration.

    cspell . --reporter ./<path>/reporter.cjs
        Use a custom reporter. See API for details.

    cspell "*.md" --exclude CHANGELOG.md --files README.md CHANGELOG.md
        Spell check only check "README.md" but NOT "CHANGELOG.md".

    cspell "/*.md" --no-must-find-files --files $FILES
        Only spell check the "/*.md" files in $FILES,
        where $FILES is a shell variable that contains the list of files.

References:
    https://cspell.org
    https://github.com/streetsidesoftware/cspell
`;

function collect(value: string | string[], previous: string[] | undefined): string[] {
    const values = Array.isArray(value) ? value : [value];
    return previous ? [...previous, ...values] : values;
}

export function commandLint(prog: Command): Command {
    const spellCheckCommand = prog.command('lint', { isDefault: true });
    spellCheckCommand
        .description('Check spelling')
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.',
        )
        .option('-v, --verbose', 'Display more information about the files being checked and the configuration.')
        .option(
            '--locale <locale>',
            'Set language locales. i.e. "en,fr" for English and French, or "en-GB" for British English.',
        )
        .option('--language-id <file-type>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
        .addOption(
            crOpt(
                '--languageId <file-type>',
                'Alias of "--language-id". Force programming language for unknown extensions. i.e. "php" or "scala"',
            ).hideHelp(),
        )
        .option('--words-only', 'Only output the words not found in the dictionaries.')
        .addOption(crOpt('--wordsOnly', 'Only output the words not found in the dictionaries.').hideHelp())
        .option('-u, --unique', 'Only output the first instance of a word not found in the dictionaries.')
        .option(
            '-e, --exclude <glob>',
            'Exclude files matching the glob pattern. This option can be used multiple times to add multiple globs. ',
            collect,
        )
        // .option('--include <glob>', 'Include files matching the glob pattern. This option can be used multiple times.', collect)
        .option(
            '--file-list <path or stdin>',
            'Specify a list of files to be spell checked.' +
                ' The list is filtered against the glob file patterns.' +
                ' Note: the format is 1 file path per line.',
            collect,
        )
        .option('--file [file...]', 'Specify files to spell check. They are filtered by the [globs...].', collect)
        .addOption(crOpt('--files [file...]', 'Alias of "--file". Files to spell check.', collect).hideHelp())
        .option('--no-issues', 'Do not show the spelling errors.')
        .option('--no-progress', 'Turn off progress messages')
        .option('--no-summary', 'Turn off summary message in console.')
        .option('-s, --silent', 'Silent mode, suppress error messages.')
        .option('--no-exit-code', 'Do not return an exit code if issues are found.')
        .addOption(
            crOpt('--quiet', 'Only show spelling issues or errors.').implies({
                summary: false,
                progress: false,
            }),
        )
        .option('--fail-fast', 'Exit after first file with an issue or error.')
        .addOption(crOpt('--no-fail-fast', 'Process all files even if there is an error.').hideHelp())
        .option('-r, --root <root folder>', 'Root directory, defaults to current directory.')
        .addOption(crOpt('--relative', 'Issues are displayed relative to the root.').default(true).hideHelp())
        .option('--no-relative', 'Issues are displayed with absolute path instead of relative to the root.')
        .option('--show-context', 'Show the surrounding text around an issue.')
        .option('--show-suggestions', 'Show spelling suggestions.')
        .addOption(crOpt('--no-show-suggestions', 'Do not show spelling suggestions or fixes.').default(undefined))
        .addOption(crOpt('--must-find-files', 'Error if no files are found.').default(true).hideHelp())
        .option('--no-must-find-files', 'Do not error if no files are found.')
        // The --filter-files option is still under design review.
        // .option('--filter-files', 'Use the `files` configuration to filter files found.')
        // .option(
        //     '--no-filter-files',
        //     'Do NOT use the `files` configuration to filter files (Only applies to --files options).',
        // )
        // The following options are planned features
        // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
        // .option('--force', 'Force the exit value to always be 0')
        .addOption(crOpt('--legacy', 'Legacy output').hideHelp())
        .addOption(crOpt('--local <local>', 'Deprecated -- Use: --locale').hideHelp())
        .option('--cache', 'Use cache to only check changed files.')
        .option('--no-cache', 'Do not use cache.')
        .option('--cache-reset', 'Reset the cache file.')
        .addOption(
            crOpt('--cache-strategy <strategy>', 'Strategy to use for detecting changed files.').choices([
                'metadata',
                'content',
            ]),
        )
        .option(
            '--cache-location <path>',
            `Path to the cache file or directory. (default: "${DEFAULT_CACHE_LOCATION}")`,
        )
        .option('--dot', 'Include files and directories starting with `.` (period) when matching globs.')
        .option('--gitignore', 'Ignore files matching glob patterns found in .gitignore files.')
        .option('--no-gitignore', 'Do NOT use .gitignore files.')
        .option('--gitignore-root <path>', 'Prevent searching for .gitignore files past root.', collect)
        .option('--validate-directives', 'Validate in-document CSpell directives.')
        .addOption(crOpt('--no-validate-directives', 'Do not validate in-document CSpell directives.').hideHelp())
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color.')
        .addOption(crOpt('--default-configuration', 'Load the default configuration and dictionaries.').hideHelp())
        .addOption(crOpt('--no-default-configuration', 'Do not load the default configuration and dictionaries.'))
        .option('--debug', 'Output information useful for debugging cspell.json files.')
        .option('--reporter <module|path>', 'Specify one or more reporters to use.', collect)
        .addOption(
            crOpt('--skip-validation', 'Collect and process documents, but do not spell check.')
                .implies({ cache: false })
                .hideHelp(),
        )
        .addOption(crOpt('--issues-summary-report', 'Output a summary of issues found.').hideHelp())
        .addOption(crOpt('--show-perf-summary', 'Output a performance summary report.').hideHelp())
        .option('--issue-template [template]', 'Use a custom issue template. See --help --issue-template for details.')
        // Planned options
        // .option('--dictionary <dictionary name>', 'Enable a dictionary by name.', collect)
        // .option('--no-dictionary <dictionary name>', 'Disable a dictionary by name.', collect)
        // .option('--import', 'Import a configuration file.', collect)
        .usage(usage)
        .addHelpText('after', augmentCommandHelp)
        .arguments('[globs...]')
        .action(async (fileGlobs: string[], options: LinterCliOptions) => {
            // console.error('lint: %o', { fileGlobs, options });
            const useExitCode = options.exitCode ?? true;
            if (options.skipValidation) {
                options.cache = false;
            }
            App.parseApplicationFeatureFlags(options.flag);
            const { mustFindFiles, fileList, files, file } = options;
            const result = await App.lint(fileGlobs, options);
            if (!fileGlobs.length && !result.files && !result.errors && !fileList && !files?.length && !file?.length) {
                spellCheckCommand.outputHelp();
                throw new CheckFailed('outputHelp', 1);
            }
            if (result.errors || (mustFindFiles && !result.files)) {
                throw new CheckFailed('check failed', 1);
            }
            if (result.issues) {
                const exitCode = useExitCode ? 1 : 0;
                throw new CheckFailed('check failed', exitCode);
            }
            return;
        });

    return spellCheckCommand;
}

function helpIssueTemplate(opts: LinterCliOptions): string {
    if (!('issueTemplate' in opts)) return '';

    return unindent`
      Issue Template:
        Use "--issue-template"  to set the template to use when reporting issues.

        The template is a string that can contain the following placeholders:
        - $filename - the file name
        - $col - the column number
        - $row - the row number
        - $text - the word that is misspelled
        - $message - the issues message: "unknown word", "word is misspelled", etc.
        - $messageColored - the issues message with color based upon the message type.
        - $uri - the URI of the file
        - $suggestions - suggestions for the misspelled word (if requested)
        - $quickFix - possible quick fixes for the misspelled word.
        - $contextFull - the full context of the misspelled word.
        - $contextLeft - the context to the left of the misspelled word.
        - $contextRight - the context to the right of the misspelled word.

        Color is supported using the following template pattern:
        - \`{<style[.style]> <text>}\` - where \`<style>\` is a style name and \`<text>\` is the text to style.

        Styles
        - \`bold\`, \`italic\`, \`underline\`, \`strikethrough\`, \`dim\`, \`inverse\`
        - \`black\`, \`red\`, \`green\`, \`yellow\`, \`blue\`, \`magenta\`, \`cyan\`, \`white\`

        Example:
          --issue-template '{green $filename}:{yellow $row}:{yellow $col} $message {red $text} $quickFix {dim $suggestions}'
    `;
}

/**
 * Add additional help text to the command.
 * When the verbose flag is set, show the hidden options.
 * @param context
 * @returns
 */
function augmentCommandHelp(context: AddHelpTextContext) {
    const output: string[] = [];
    const command = context.command;
    const opts = command.opts();
    const showHidden = !!opts.verbose;
    const hiddenHelp: string[] = [];
    const help = command.createHelp();
    const hiddenOptions = command.options.filter((opt) => opt.hidden && showHidden);
    const flagColWidth = Math.max(...command.options.map((opt) => opt.flags.length), 0);
    const indent = flagColWidth + 4;
    for (const options of hiddenOptions) {
        if (!hiddenHelp.length) {
            hiddenHelp.push('\nHidden Options:');
        }
        hiddenHelp.push(
            help.wrap(
                `  ${options.flags.padEnd(flagColWidth)}  ${options.description}`,
                process.stdout.columns || 80,
                indent,
            ),
        );
    }
    output.push(...hiddenHelp, advanced);
    return helpIssueTemplate(opts) + output.join('\n');
}

/**
 * Create Option - a helper function to create a commander option.
 * @param name - the name of the option
 * @param description - the description of the option
 * @param parseArg - optional function to parse the argument
 * @param defaultValue - optional default value
 * @returns CommanderOption
 */
function crOpt<T>(
    name: string,
    description: string,
    parseArg?: (value: string, previous: T) => T,
    defaultValue?: T,
): CommanderOption {
    const option = new CommanderOption(name, description);
    if (parseArg) {
        option.argParser(parseArg);
    }
    if (defaultValue !== undefined) {
        option.default(defaultValue);
    }
    return option;
}
