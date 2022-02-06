import type { SuggestionsForWordResult, SuggestedWord } from 'cspell-lib';
import chalk = require('chalk');
import { padLeft, padWidth, width } from '../util/util';

export interface EmitSuggestionOptions {
    verbose?: number;
    lineWidth?: number;
    output?: {
        log: (text: string) => void;
    };
}

export interface TimedSuggestionsForWordResult extends SuggestionsForWordResult {
    elapsedTimeMs?: number;
}

export function emitSuggestionResult(result: TimedSuggestionsForWordResult, options: EmitSuggestionOptions): void {
    const { word, suggestions } = result;
    const { verbose, output = console } = options;

    const elapsed = verbose && verbose > 1 && result.elapsedTimeMs ? ` ${result.elapsedTimeMs.toFixed(2)} ms` : '';

    output.log((word ? chalk.yellow(word) : chalk.yellow('<empty>')) + ':' + elapsed);

    if (!suggestions.length) {
        console.log(chalk.yellow(' <no suggestions>'));
        return;
    }

    if (verbose) {
        const maxWidth = suggestions
            .map((r) => width(r.compoundWord || r.word))
            .reduce((max, len) => Math.max(max, len), 0);
        for (const sug of suggestions) {
            const { word, cost, dictionaries, compoundWord } = sug;
            const w = compoundWord || word;
            const padding = ' '.repeat(padWidth(w, maxWidth));
            const forbid = sug.forbidden ? chalk.red('X') : ' ';
            const ignore = sug.noSuggest ? chalk.yellow('N') : ' ';
            const strCost = padLeft(cost.toString(10), 4);
            const dicts = dictionaries.map((n) => chalk.gray(n)).join(', ');
            output.log(` - ${formatWord(w, sug)}${padding} ${forbid}${ignore} - ${chalk.yellow(strCost)} ${dicts}`);
        }
    } else {
        for (const r of suggestions) {
            output.log(` - ${formatWordSingle(r)}`);
        }
    }
}

function formatWord(word: string, r: SuggestedWord): string {
    return r.forbidden || r.noSuggest ? chalk.gray(chalk.strikethrough(word)) : word;
}

function formatWordSingle(s: SuggestedWord): string {
    let word = formatWord(s.word, s);
    word = s.forbidden ? word + chalk.red(' X') : word;
    word = s.noSuggest ? word + chalk.yellow(' Not suggested.') : word;
    return word;
}
