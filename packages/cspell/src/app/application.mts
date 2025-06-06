import { opMap, opTap, pipeAsync, toAsyncIterable } from '@cspell/cspell-pipe';
import type { CSpellReporter, CSpellSettings, RunResult } from '@cspell/cspell-types';
import type { CheckTextInfo, FeatureFlags, SuggestionsForWordResult, TraceWordResult } from 'cspell-lib';
import {
    checkTextDocument,
    getDefaultSettings,
    getGlobalSettingsAsync,
    mergeSettings,
    SuggestionError,
    suggestionsForWords,
    traceWordsAsync,
} from 'cspell-lib';

import { getReporter } from './cli-reporter.js';
import { configInit, type InitOptions } from './config/index.js';
import { console } from './console.js';
import type { TimedSuggestionsForWordResult } from './emitters/suggestionsEmitter.js';
import { getFeatureFlags, parseFeatureFlags } from './featureFlags/index.js';
import { extractUnknownWordsConfig, LintRequest, runLint } from './lint/index.js';
import { CSpellReporterConfiguration } from './models.js';
import type { BaseOptions, LegacyOptions, LinterCliOptions, SuggestionOptions, TraceOptions } from './options.js';
import { fixLegacy } from './options.js';
import { simpleRepl } from './repl/index.js';
import { readConfig } from './util/configFileHelper.js';
import { fileInfoToDocument, readFileInfo } from './util/fileHelper.js';
import { finalizeReporter } from './util/reporters.js';
import { readStdin } from './util/stdin.js';
import { getTimeMeasurer } from './util/timer.js';
import * as util from './util/util.js';
export type { TraceResult } from 'cspell-lib';
export { IncludeExcludeFlag } from 'cspell-lib';

export type AppError = NodeJS.ErrnoException;

export function lint(fileGlobs: string[], options: LinterCliOptions, reporter?: CSpellReporter): Promise<RunResult> {
    options = fixLegacy(options);
    const unknownWordsConfig = extractUnknownWordsConfig(options);
    const useOptions = { ...options, ...unknownWordsConfig };

    const reporterOptions: CSpellReporterConfiguration = { ...useOptions, console };
    const cfg = new LintRequest(
        fileGlobs,
        useOptions,
        finalizeReporter(reporter) ?? getReporter({ ...useOptions, fileGlobs }, reporterOptions),
    );
    return runLint(cfg);
}

export async function* trace(words: string[], options: TraceOptions): AsyncIterableIterator<TraceWordResult> {
    options = fixLegacy(options);
    const iWords = options.stdin ? toAsyncIterable(words, readStdin()) : words;
    const { languageId, locale, allowCompoundWords, ignoreCase } = options;
    const configFile = await readConfig(options.config, undefined);
    const loadDefault = options.defaultConfiguration ?? configFile.config.loadDefaultConfiguration ?? true;
    const additionalSettings: CSpellSettings = {};
    if (options.dictionary) {
        additionalSettings.dictionaries = options.dictionary;
    }

    const config = mergeSettings(
        await getDefaultSettings(loadDefault),
        await getGlobalSettingsAsync(),
        configFile.config,
        additionalSettings,
    );
    yield* traceWordsAsync(iWords, config, util.clean({ languageId, locale, ignoreCase, allowCompoundWords }));
}

export type CheckTextResult = CheckTextInfo;

export async function checkText(filename: string, options: BaseOptions & LegacyOptions): Promise<CheckTextResult> {
    options = fixLegacy(options);
    const fileInfo = await readFileInfo(filename);
    const { locale, languageId, validateDirectives } = options;
    const doc = fileInfoToDocument(fileInfo, languageId, locale);
    const checkOptions = {
        configFile: options.config,
        validateDirectives,
    };
    const settingsFromCommandLine = util.clean({
        languageId,
        language: locale,
        loadDefaultConfiguration: options.defaultConfiguration,
    });
    return checkTextDocument(doc, util.clean({ ...checkOptions }), settingsFromCommandLine);
}

export async function* suggestions(
    words: string[],
    options: SuggestionOptions,
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
        return elapsedTimeMs ? { ...v, elapsedTimeMs } : v;
    }
    const iWords = options.repl
        ? pipeAsync(toAsyncIterable(words, simpleRepl()), opTap(tapStart))
        : options.useStdin
          ? pipeAsync(toAsyncIterable(words, readStdin()), opTap(tapStart))
          : words.map(mapStart);
    try {
        const results = pipeAsync(
            suggestionsForWords(iWords, util.clean({ ...options }), configFile.config),
            opMap(mapEnd),
        );
        yield* results;
    } catch (e) {
        if (!(e instanceof SuggestionError)) throw e;
        console.error(e.message);
        process.exitCode = 1;
    }
}

export function createInit(options: InitOptions): Promise<void> {
    return configInit(options);
}

function registerApplicationFeatureFlags(): FeatureFlags {
    const ff = getFeatureFlags();
    const flags = [{ name: 'timer', description: 'Display elapsed time for command.' }];
    flags.forEach((flag) => ff.register(flag));
    return ff;
}

export function parseApplicationFeatureFlags(flags: string[] | undefined): FeatureFlags {
    const ff = registerApplicationFeatureFlags();
    return parseFeatureFlags(flags, ff);
}
