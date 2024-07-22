import type { Command } from 'commander';
import { Option as CommanderOption } from 'commander';

import * as App from './application.mjs';
import { console } from './console.js';
import { isDictionaryPathFormat } from './emitters/DictionaryPathFormat.js';
import { emitTraceResults } from './emitters/traceEmitter.js';
import type { TraceOptions } from './options.js';
import { CheckFailed } from './util/errors.js';

// interface InitOptions extends Options {}

type TraceCommandOptions = TraceOptions;

export function commandTrace(prog: Command): Command {
    return prog
        .command('trace')
        .description(`Trace words -- Search for words in the configuration and dictionaries.`)
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.',
        )
        .option(
            '--locale <locale>',
            'Set language locales. i.e. "en,fr" for English and French, or "en-GB" for British English.',
        )
        .option('--language-id <language>', 'Use programming language. i.e. "php" or "scala".')
        .addOption(
            new CommanderOption(
                '--languageId <language>',
                'Use programming language. i.e. "php" or "scala".',
            ).hideHelp(),
        )
        .option('--allow-compound-words', 'Turn on allowCompoundWords')
        .addOption(new CommanderOption('--allowCompoundWords', 'Turn on allowCompoundWords.').hideHelp())
        .option('--no-allow-compound-words', 'Turn off allowCompoundWords')
        .option('--ignore-case', 'Ignore case and accents when searching for words.')
        .option('--no-ignore-case', 'Do not ignore case and accents when searching for words.')
        .addOption(
            new CommanderOption('--dictionary-path <format>', 'Configure how to display the dictionary path.')
                .choices(['hide', 'short', 'long', 'full'])
                .default('long', 'Display most of the path.'),
        )
        .option('--stdin', 'Read words from stdin.')
        .option('--all', 'Show all dictionaries.')
        .addOption(new CommanderOption('--only-found', 'Show only dictionaries that have the words.').conflicts('all'))
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color')
        .addOption(
            new CommanderOption(
                '--default-configuration',
                'Load the default configuration and dictionaries.',
            ).hideHelp(),
        )
        .addOption(
            new CommanderOption(
                '--no-default-configuration',
                'Do not load the default configuration and dictionaries.',
            ),
        )
        .arguments('[words...]')
        .action(async (words: string[], options: TraceCommandOptions) => {
            App.parseApplicationFeatureFlags(options.flag);
            let numFound = 0;
            const dictionaryPathFormat = isDictionaryPathFormat(options.dictionaryPath)
                ? options.dictionaryPath
                : 'long';

            let prefix = '';
            for await (const results of App.trace(words, options)) {
                const byWord = groupBy(results, (r) => r.word);
                for (const split of results.splits) {
                    const splitResults = byWord.get(split.word) || [];
                    const filtered = filterTraceResults(splitResults, options);
                    emitTraceResults(split.word, split.found, filtered, {
                        cwd: process.cwd(),
                        dictionaryPathFormat,
                        prefix,
                        showWordFound: results.splits.length > 1,
                    });
                    prefix = '\n';
                    numFound += results.reduce((n, r) => n + (r.found ? 1 : 0), 0);
                    const numErrors = results.map((r) => r.errors?.length || 0).reduce((n, r) => n + r, 0);
                    if (numErrors) {
                        console.error('Dictionary Errors.');
                        throw new CheckFailed('dictionary errors', 1);
                    }
                }
            }
            if (!numFound) {
                console.error('No matches found');
                throw new CheckFailed('no matches', 1);
            }
        });
}

function filterTraceResults(results: App.TraceResult[], options: TraceCommandOptions): App.TraceResult[] {
    if (options.all) return results;
    return results.filter((r) => filterTraceResult(r, options.onlyFound));
}

function filterTraceResult(result: App.TraceResult, onlyFound?: boolean): boolean {
    return (
        result.found ||
        result.forbidden ||
        result.noSuggest ||
        !!result.preferredSuggestions ||
        (!onlyFound && result.dictActive)
    );
}

function groupBy<T>(items: Iterable<T>, key: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of items) {
        const k = key(item);
        const a = map.get(k) || [];
        a.push(item);
        map.set(k, a);
    }
    return map;
}
