import chalk from 'chalk';
import type { SuggestedWord, SuggestionsForWordResult } from 'cspell-lib';

import { padLeft, padWidth, width } from '../util/util.js';

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

const regExpRTL = /([\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC י]+)/g;

function reverseRtlText(s: string): string {
    return s.replace(regExpRTL, (s) => s.split('').reverse().join(''));
}

export function emitSuggestionResult(result: TimedSuggestionsForWordResult, options: EmitSuggestionOptions): void {
    const { word, suggestions } = result;
    const { verbose, output = console } = options;

    const elapsed = verbose && verbose > 1 && result.elapsedTimeMs ? ` ${result.elapsedTimeMs.toFixed(2)} ms` : '';

    const rWord = reverseRtlText(word);
    const wordEx = rWord !== word ? ` (${chalk.yellow(rWord)})` : '';

    output.log((word ? chalk.yellow(word) + wordEx : chalk.yellow('<empty>')) + ':' + elapsed);

    if (!suggestions.length) {
        console.log(chalk.yellow(' <no suggestions>'));
        return;
    }

    function handleRtl(word: string): string {
        const r = reverseRtlText(word);
        return r === word ? word : `${word} (${r})`;
    }

    if (verbose) {
        const mappedSugs = suggestions.map((s) => ({
            ...s,
            w: handleRtl(s.compoundWord || s.wordAdjustedToMatchCase || s.word),
        }));
        const sugWidths = mappedSugs.map((s) => width(s.w));
        const maxWidth = sugWidths.reduce((max, len) => Math.max(max, len), 0);
        for (const sug of mappedSugs) {
            const { cost, dictionaries, w } = sug;
            const padding = ' '.repeat(padWidth(w, maxWidth));
            const forbid =
                sug.forbidden && sug.isPreferred
                    ? chalk.red('*')
                    : sug.forbidden
                    ? chalk.red('X')
                    : sug.isPreferred
                    ? chalk.yellow('*')
                    : ' ';
            const ignore = sug.noSuggest ? chalk.yellow('N') : ' ';
            const strCost = padLeft(cost.toString(10), 4);
            const dicts = dictionaries.map((n) => chalk.gray(n)).join(', ');
            output.log(` - ${formatWord(w, sug)}${padding} ${forbid}${ignore} - ${chalk.yellow(strCost)} ${dicts}`);
        }
    } else {
        const mappedSugs = suggestions.map((s) => ({ ...s, word: handleRtl(s.wordAdjustedToMatchCase || s.word) }));
        for (const r of mappedSugs) {
            output.log(` - ${formatWordSingle(r)}`);
        }
    }
}

function formatWord(word: string, r: SuggestedWord): string {
    return r.forbidden || r.noSuggest
        ? chalk.gray(chalk.strikethrough(word))
        : word === r.wordAdjustedToMatchCase
        ? diff(word, r.word)
        : word;
}

function diff(wordA: string, wordB: string): string {
    const a = [...wordA];
    const b = [...wordB];
    const parts: string[] = [];

    for (let idx = 0; idx < a.length; ++idx) {
        const aa = a[idx];
        const bb = b[idx];
        parts.push(aa === bb ? aa : chalk.yellow(aa));
    }

    return parts.join('');
}

function formatWordSingle(s: SuggestedWord): string {
    let word = formatWord(s.word, s);
    word = s.forbidden ? word + chalk.red(' X') : word;
    word = s.noSuggest ? word + chalk.yellow(' Not suggested.') : word;
    word = s.isPreferred ? chalk.yellow(word + ' *') : word;
    return word;
}
