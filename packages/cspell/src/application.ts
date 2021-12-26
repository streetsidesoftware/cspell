import type { CSpellReporter, RunResult } from '@cspell/cspell-types';
import * as cspell from 'cspell-lib';
import { CheckTextInfo, TraceResult, traceWords } from 'cspell-lib';
import * as path from 'path';
import { calcFinalConfigInfo, readConfig, readFile } from './fileHelper';
import { LintRequest, runLint } from './lint';
import { BaseOptions, LinterOptions, TraceOptions } from './options';
import * as util from './util/util';
export { IncludeExcludeFlag } from 'cspell-lib';
export type { TraceResult } from 'cspell-lib';

export type AppError = NodeJS.ErrnoException;

export function lint(fileGlobs: string[], options: LinterOptions, emitters: CSpellReporter): Promise<RunResult> {
    const cfg = new LintRequest(fileGlobs, options, emitters);
    return runLint(cfg);
}

export async function trace(words: string[], options: TraceOptions): Promise<TraceResult[]> {
    const { local } = options;
    const { languageId, locale = local, allowCompoundWords, ignoreCase } = options;
    const configFile = await readConfig(options.config, undefined);
    const config = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), configFile.config);
    const results = await traceWords(words, config, { languageId, locale, ignoreCase, allowCompoundWords });
    return results;
}

export type CheckTextResult = CheckTextInfo;

export async function checkText(filename: string, options: BaseOptions): Promise<CheckTextResult> {
    const pSettings = readConfig(options.config, path.dirname(filename));
    const [foundSettings, text] = await Promise.all([pSettings, readFile(filename)]);
    const settingsFromCommandLine = util.clean({
        languageId: options.languageId || undefined,
        language: options.locale || options.local || undefined,
    });
    const info = calcFinalConfigInfo(foundSettings, settingsFromCommandLine, filename, text);
    return cspell.checkText(text, info.configInfo.config);
}

export function createInit(): Promise<void> {
    return Promise.reject();
}
