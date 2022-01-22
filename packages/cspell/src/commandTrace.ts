import { Command, Option as CommanderOption } from 'commander';
import * as App from './application';
import { TraceOptions } from './options';
import { emitTraceResults } from './emitters/traceEmitter';
import { CheckFailed } from './util/errors';

// interface InitOptions extends Options {}

type TraceCommandOptions = TraceOptions;

export function commandTrace(prog: Command): Command {
    return prog
        .command('trace')
        .description(`Trace words -- Search for words in the configuration and dictionaries.`)
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
        )
        .option(
            '--locale <locale>',
            'Set language locales. i.e. "en,fr" for English and French, or "en-GB" for British English.'
        )
        .option('--language-id <language>', 'Use programming language. i.e. "php" or "scala"')
        .addOption(
            new CommanderOption('--languageId <language>', 'Use programming language. i.e. "php" or "scala"').hideHelp()
        )
        .option('--allow-compound-words', 'Turn on allowCompoundWords')
        .addOption(new CommanderOption('--allowCompoundWords', 'Turn on allowCompoundWords').hideHelp())
        .option('--no-allow-compound-words', 'Turn off allowCompoundWords')
        .option('--no-ignore-case', 'Do not ignore case and accents when searching for words')
        .option('--stdin', 'Read words from stdin.')
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color')
        .arguments('[words...]')
        .action(async (words: string[], options: TraceCommandOptions) => {
            let numFound = 0;
            for await (const results of App.trace(words, options)) {
                emitTraceResults(results, { cwd: process.cwd() });
                numFound += results.reduce((n, r) => n + (r.found ? 1 : 0), 0);
                const numErrors = results.map((r) => r.errors?.length || 0).reduce((n, r) => n + r, 0);
                if (numErrors) {
                    console.error('Dictionary Errors.');
                    throw new CheckFailed('dictionary errors', 1);
                }
            }
            if (!numFound) {
                console.error('No matches found');
                throw new CheckFailed('no matches', 1);
            }
        });
}
