import * as cspell from 'cspell-lib';
import * as path from 'path';
import * as util from './util/util';
import { traceWords, TraceResult, CheckTextInfo } from 'cspell-lib';
export { TraceResult, IncludeExcludeFlag } from 'cspell-lib';
import { CSpellReporter, RunResult } from '@cspell/cspell-types';
import { CSpellApplicationConfiguration } from './CSpellApplicationConfiguration';
import { BaseOptions, CSpellApplicationOptions, TraceOptions } from './options';
import { runLint } from './lint';
import { calcFinalConfigInfo, readConfig, readFile } from './fileHelper';

export type AppError = NodeJS.ErrnoException;

export function lint(files: string[], options: CSpellApplicationOptions, emitters: CSpellReporter): Promise<RunResult> {
    const cfg = new CSpellApplicationConfiguration(files, options, emitters);
    return runLint(cfg);
}

export async function trace(words: string[], options: TraceOptions): Promise<TraceResult[]> {
    const { local } = options;
    const { languageId, locale = local } = options;
    const configFile = await readConfig(options.config, undefined);
    const config = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), configFile.config);
    const results = await traceWords(words, config, { languageId, locale });
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
