import { SuggestionsForWordResult } from 'cspell-lib';
import chalk = require('chalk');
import { padLeft } from '../util/util';

export interface EmitSuggestionOptions {
    verbose?: number;
    lineWidth?: number;
}

export function emitSuggestionResult(result: SuggestionsForWordResult, options: EmitSuggestionOptions): void {
    const { word, suggestions } = result;
    const { verbose } = options;

    console.log(word ? chalk.green(word) : chalk.yellow('<empty>') + ':');

    if (!suggestions.length) {
        console.log(chalk.yellow(' <no suggestions>'));
        return;
    }

    if (verbose) {
        const maxWidth = suggestions.map((r) => r.word.length).reduce((max, len) => Math.max(max, len), 0);
        for (const r of suggestions) {
            const { word, cost, dictionaries } = r;
            const padding = ' '.repeat(maxWidth - word.length);
            const strCost = padLeft(cost.toString(10), 4);
            const dicts = dictionaries.map((n) => chalk.gray(n)).join(', ');
            console.log(` - ${word}${padding} - ${chalk.yellow(strCost)} ${dicts}`);
        }
    } else {
        for (const r of suggestions) {
            console.log(` - ${r.word}`);
        }
    }
}
