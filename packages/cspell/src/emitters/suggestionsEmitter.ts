import type { SuggestionsForWordResult, SuggestedWord } from 'cspell-lib';
import chalk = require('chalk');
import { padLeft } from '../util/util';

export interface EmitSuggestionOptions {
    verbose?: number;
    lineWidth?: number;
    output?: {
        log: (text: string) => void;
    };
}

export function emitSuggestionResult(result: SuggestionsForWordResult, options: EmitSuggestionOptions): void {
    const { word, suggestions } = result;
    const { verbose, output = console } = options;

    output.log(word ? chalk.green(word) : chalk.yellow('<empty>') + ':');

    if (!suggestions.length) {
        console.log(chalk.yellow(' <no suggestions>'));
        return;
    }

    if (verbose) {
        const maxWidth = suggestions.map((r) => r.word.length).reduce((max, len) => Math.max(max, len), 0);
        for (const sug of suggestions) {
            const { word, cost, dictionaries } = sug;
            const padding = ' '.repeat(maxWidth - word.length);
            const forbid = sug.forbidden ? chalk.red('X') : ' ';
            const ignore = sug.noSuggest ? chalk.yellow('N') : ' ';
            const strCost = padLeft(cost.toString(10), 4);
            const dicts = dictionaries.map((n) => chalk.gray(n)).join(', ');
            output.log(` - ${formatWord(word, sug)}${padding} ${forbid}${ignore} - ${chalk.yellow(strCost)} ${dicts}`);
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
