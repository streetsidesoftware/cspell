import { pipeAsync, toAsyncIterable, opTap, opMap } from '@cspell/cspell-pipe';
import type { CSpellReporter, RunResult } from '@cspell/cspell-types';
import type { CheckTextInfo, SuggestionsForWordResult, TraceResult } from 'cspell-lib';
import {
    checkText as cspellLibCheckText,
    getDefaultSettings,
    getGlobalSettings,
    mergeSettings,
    SuggestionError,
    suggestionsForWords,
    traceWordsAsync,
} from 'cspell-lib';
import * as path from 'path';
import { TimedSuggestionsForWordResult } from './emitters/suggestionsEmitter';
import { LintRequest, runLint } from './lint';
import { BaseOptions, fixLegacy, LegacyOptions, LinterOptions, SuggestionOptions, TraceOptions } from './options';
import { simpleRepl } from './repl';
import { calcFinalConfigInfo, readConfig, readFile } from './util/fileHelper';
import { readStdin } from './util/stdin';
import { getTimeMeasurer } from './util/timer';
import * as util from './util/util';
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
    const iWords = options.stdin ? toAsyncIterable(words, readStdin()) : words;
    const { languageId, locale, allowCompoundWords, ignoreCase } = options;
    const configFile = await readConfig(options.config, undefined);
    const loadDefault = options.defaultConfiguration ?? configFile.config.loadDefaultConfiguration ?? true;

    const config = mergeSettings(getDefaultSettings(loadDefault), getGlobalSettings(), configFile.config);
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
        loadDefaultConfiguration: options.defaultConfiguration,
    });
    const info = calcFinalConfigInfo(foundSettings, settingsFromCommandLine, filename, text);
    return cspellLibCheckText(text, info.configInfo.config);
}

export async function* suggestions(
    words: string[],
    options: SuggestionOptions
): AsyncIterable<TimedSuggestionsForWordResult> {
    options = fixLegacy(options);
    const configFile = await readConfig(options.config, undefined);
    let timer: undefined | (() => number);
    function tapStart() {
        timer = getTimeMeasurer();
    }
    function mapStart<T>(v: T) {
        tapStart();
        return v;
    }
    function mapEnd(v: SuggestionsForWordResult): TimedSuggestionsForWordResult {
        const elapsedTimeMs = timer?.();
        return { ...v, elapsedTimeMs };
    }
    const iWords = options.repl
        ? pipeAsync(toAsyncIterable(words, simpleRepl()), opTap(tapStart))
        : options.useStdin
        ? pipeAsync(toAsyncIterable(words, readStdin()), opTap(tapStart))
        : words.map(mapStart);
    try {
        const results = pipeAsync(suggestionsForWords(iWords, options, configFile.config), opMap(mapEnd));
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
