import type { CSpellReporter, RunResult } from '@cspell/cspell-types';
import * as cspell from 'cspell-lib';
import { CheckTextInfo, TraceResult, traceWordsAsync, suggestionsForWords, SuggestionError } from 'cspell-lib';
import * as path from 'path';
import { calcFinalConfigInfo, readConfig, readFile } from './util/fileHelper';
import { LintRequest, runLint } from './lint';
import { BaseOptions, fixLegacy, LegacyOptions, LinterOptions, SuggestionOptions, TraceOptions } from './options';
import { readStdin } from './util/stdin';
import * as util from './util/util';
import * as async from './util/async';
export { IncludeExcludeFlag } from 'cspell-lib';
export type { TraceResult } from 'cspell-lib';

export type AppError = NodeJS.ErrnoException;

export function lint(fileGlobs: string[], options: LinterOptions, emitters: CSpellReporter): Promise<RunResult> {
    options = fixLegacy(options);
    const cfg = new LintRequest(fileGlobs, options, emitters);
    return runLint(cfg);
}

export async function* trace(words: string[], options: TraceOptions): AsyncIterableIterator<TraceResult[]> {
    options = fixLegacy(options);
    const iWords = options.stdin ? async.mergeAsyncIterables(words, readStdin()) : words;
    const { languageId, locale, allowCompoundWords, ignoreCase } = options;
    const configFile = await readConfig(options.config, undefined);
    const config = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), configFile.config);
    yield* traceWordsAsync(iWords, config, { languageId, locale, ignoreCase, allowCompoundWords });
}

export type CheckTextResult = CheckTextInfo;

export async function checkText(filename: string, options: BaseOptions & LegacyOptions): Promise<CheckTextResult> {
    options = fixLegacy(options);
    const pSettings = readConfig(options.config, path.dirname(filename));
    const [foundSettings, text] = await Promise.all([pSettings, readFile(filename)]);
    const settingsFromCommandLine = util.clean({
        languageId: options.languageId || undefined,
        language: options.locale || options.local || undefined,
    });
    const info = calcFinalConfigInfo(foundSettings, settingsFromCommandLine, filename, text);
    return cspell.checkText(text, info.configInfo.config);
}

export async function* suggestions(
    words: string[],
    options: SuggestionOptions
): AsyncIterable<cspell.SuggestionsForWordResult> {
    options = fixLegacy(options);
    const configFile = await readConfig(options.config, undefined);
    const iWords = options.useStdin ? async.mergeAsyncIterables(words, readStdin()) : words;
    try {
        const results = suggestionsForWords(iWords, options, configFile.config);
        yield* results;
    } catch (e) {
        if (!(e instanceof SuggestionError)) throw e;
        console.error(e.message);
        process.exitCode = 1;
    }
}

export function createInit(): Promise<void> {
    return Promise.reject();
}
