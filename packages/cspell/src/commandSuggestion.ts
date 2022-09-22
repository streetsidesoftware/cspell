import { Command, Option as CommanderOption } from 'commander';
import * as App from './application';
import { emitSuggestionResult } from './emitters/suggestionsEmitter';
import { parseFeatureFlags } from './featureFlags';
import { SuggestionOptions } from './options';
import { CheckFailed } from './util/errors';

// interface InitOptions extends Options {}

interface SuggestionCommandOptions extends SuggestionOptions {
    dictionary?: string[];
    verbose?: number;
    color?: boolean;
    ignoreCase?: boolean;
    stdin?: boolean;
}

function collect(value: string, previous: string[] | undefined): string[] {
    value = value.replace(/^=/, '');
    if (!previous) {
        return [value];
    }
    return previous.concat([value]);
}

function count(_: string, previous: number | undefined): number {
    return (previous || 0) + 1;
}

function asNumber(value: string, prev: number | undefined): number {
    return parseInt(value, 10) ?? prev;
}

export function commandSuggestion(prog: Command): Command {
    const suggestionCommand = prog.command('suggestions');
    suggestionCommand
        .aliases(['sug', 'suggest'])
        .description('Spelling Suggestions for words.')
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
        )
        .option(
            '--locale <locale>',
            'Set language locales. i.e. "en,fr" for English and French, or "en-GB" for British English.'
        )
        .option('--language-id <language>', 'Use programming language. i.e. "php" or "scala".')
        .addOption(
            new CommanderOption(
                '--languageId <language>',
                'Use programming language. i.e. "php" or "scala".'
            ).hideHelp()
        )
        .option('-s, --no-strict', 'Ignore case and accents when searching for words.')
        .option('--ignore-case', 'Alias of --no-strict.')
        .option('--num-changes <number>', 'Number of changes allowed to a word', asNumber, 4)
        .option('--num-suggestions <number>', 'Number of suggestions', asNumber, 8)
        .option(
            '--no-include-ties',
            'Force the number of suggested to be limited, by not including suggestions that have the same edit cost.'
        )
        .option('--stdin', 'Use stdin for input.')
        .addOption(new CommanderOption('--repl', 'REPL interface for looking up suggestions.').hideHelp())
        .option('-v, --verbose', 'Show detailed output.', count, 0)
        .option(
            '-d, --dictionary <dictionary name>',
            'Use the dictionary specified. Only dictionaries specified will be used.',
            collect
        )
        .option(
            '--dictionaries <dictionary names...>',
            'Use the dictionaries specified. Only dictionaries specified will be used.'
        )
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color')
        .arguments('[words...]')
        .action(async (words: string[], options: SuggestionCommandOptions) => {
            parseFeatureFlags(options.flag);
            options.useStdin = options.stdin;
            options.dictionaries = mergeArrays(options.dictionaries, options.dictionary);

            if (!words.length && !options.useStdin && !options.repl) {
                suggestionCommand.outputHelp();
                throw new CheckFailed('outputHelp', 1);
            }

            for await (const r of App.suggestions(words, options)) {
                emitSuggestionResult(r, options);
            }
        });
    return suggestionCommand;
}

function mergeArrays(a: string[] | undefined, b: string[] | undefined) {
    if (a === undefined) return b;
    if (b === undefined) return a;
    return a.concat(b);
}
