import { formatWithOptions } from 'node:util';

import type { ChalkInstance } from 'chalk';
import type {
    CSpellSettings,
    CSpellSettingsWithSourceTrace,
    Document,
    ImportFileRefWithError,
    Issue,
    SpellCheckFileResult,
    TextDocumentOffset,
    ValidationIssue,
} from 'cspell-lib';
import {
    extractDependencies,
    extractImportErrors,
    MessageTypes,
    spellCheckDocument,
    Text as cspellText,
} from 'cspell-lib';

import type { ProcessFileReporter } from '../reporters/LintFileResult.js';
import type { LintFileResult } from '../reporters/LintFileResult.js';
import { mergeReportIssueOptions, ReportItemCollector } from '../reporters/reporters.js';
import type { CSpellLintResultCache } from '../util/cache/CSpellLintResultCache.js';
import type { ConfigInfo } from '../util/configFileHelper.js';
import { toError } from '../util/errors.js';
import { extractContext } from '../util/extractContext.js';
import { fileInfoToDocument, readFileInfo, relativeToCwd } from '../util/fileHelper.js';
import { getTimeMeasurer } from '../util/timer.js';
import { indent, unindent } from '../util/unindent.js';
import * as util from '../util/util.js';
import { wordWrapAnsiText } from '../util/wrap.js';
import { LinterError } from './LinterError.js';
import type { LintRequest } from './LintRequest.js';
import type { FileToProcess, PrefetchResult } from './types.js';

export interface ProcessFileOptions {
    readonly configInfo: ConfigInfo;
    readonly verboseLevel: number;
    readonly useColor: boolean;
    readonly cfg: LintRequest;
    readonly configErrors: Set<string>;
    readonly chalk: ChalkInstance;
    readonly userSettings: CSpellSettingsWithSourceTrace;
}

export async function processFile(
    file: FileToProcess,
    cache: CSpellLintResultCache,
    prefetch: PrefetchResult | undefined,
    processFileOptions: ProcessFileOptions,
): Promise<LintFileResult> {
    if (prefetch?.fileResult) return prefetch.fileResult;
    const { filename } = file;

    const { cfg, configInfo, userSettings } = processFileOptions;

    const getElapsedTimeMs = getTimeMeasurer();
    const reportIssueOptions = prefetch?.reportIssueOptions;
    const cachedResult = await cache.getCachedLintResults(filename);
    if (cachedResult) {
        return {
            ...cachedResult,
            elapsedTimeMs: getElapsedTimeMs(),
            reportIssueOptions: { ...cachedResult.reportIssueOptions, ...reportIssueOptions },
        };
    }

    const result: LintFileResult = {
        fileInfo: {
            filename,
        },
        issues: [],
        processed: false,
        errors: 0,
        configErrors: 0,
        elapsedTimeMs: 0,
        reportIssueOptions,
        reportItems: undefined,
    };

    const reporter = new ReportItemCollector(result);

    const fileInfo = prefetch?.fileInfo || (await readFileInfo(filename, undefined, true));
    if (fileInfo.errorCode) {
        if (fileInfo.errorCode !== 'EISDIR' && cfg.options.mustFindFiles) {
            const err = new LinterError(`File not found: "${filename}"`);
            reporter.error('Linter:', err);
            result.errors += 1;
        }
        return result;
    }

    const doc = fileInfoToDocument(fileInfo, cfg.options.languageId, cfg.locale);
    const { text } = fileInfo;
    result.fileInfo = fileInfo;

    let spellResult: Partial<SpellCheckFileResult> = {};
    try {
        const { showSuggestions: generateSuggestions, validateDirectives, skipValidation } = cfg.options;
        const numSuggestions = configInfo.config.numSuggestions ?? 5;
        const validateOptions = util.clean({
            generateSuggestions,
            numSuggestions,
            validateDirectives,
            skipValidation,
        });
        const r = await spellCheckDocument(doc, validateOptions, userSettings);
        // console.warn('filename: %o %o', path.relative(process.cwd(), filename), r.perf);
        spellResult = r;
        result.processed = r.checked;
        result.perf = r.perf ? { ...r.perf } : undefined;
        result.issues = cspellText.calculateTextDocumentOffsets(doc.uri, text, r.issues).map(mapIssue);
    } catch (e) {
        reporter.error(`Failed to process "${filename}"`, toError(e));
        result.errors += 1;
    }
    result.elapsedTimeMs = getElapsedTimeMs();

    const config = spellResult.settingsUsed ?? {};
    result.reportIssueOptions = mergeReportIssueOptions(
        spellResult.settingsUsed || configInfo.config,
        reportIssueOptions,
    );

    result.configErrors += reportSpellingResultConfigErrors(reporter, spellResult, processFileOptions);

    reportCheckResult(result, doc, spellResult, config, processFileOptions);

    const dep = calcDependencies(config);

    await cache.setCachedLintResults(result, dep.files);
    return result;

    function mapIssue({ doc: _, ...tdo }: TextDocumentOffset & ValidationIssue): Issue {
        const context = cfg.showContext ? extractContext(tdo, cfg.showContext) : undefined;
        return util.clean({ ...tdo, context });
    }
}

export function reportCheckResult(
    result: LintFileResult,
    _doc: Document,
    spellResult: Partial<SpellCheckFileResult>,
    config: CSpellSettingsWithSourceTrace,
    processFileOptions: ProcessFileOptions,
): void {
    const { configInfo, verboseLevel, useColor, cfg, chalk } = processFileOptions;
    const elapsed = result.elapsedTimeMs || 0;
    const dictionaries = config.dictionaries || [];

    const reporter = new ReportItemCollector(result);

    if (verboseLevel > 1) {
        const dictsUsed = [...dictionaries]
            .sort()
            .map((name) => chalk.green(name))
            .join(', ');
        const msg = unindent`
                    File type: ${config.languageId}, Language: ${config.language}, Issues: ${
                        result.issues.length
                    } ${elapsed.toFixed(2)}ms
                    Config file Used: ${relativeToCwd(spellResult.localConfigFilepath || configInfo.source, cfg.root)}
                    Dictionaries Used:
                      ${wordWrapAnsiText(dictsUsed, 70)}`;
        reporter.info(indent(msg, '  '), MessageTypes.Info);
    }

    if (cfg.options.debug) {
        const { enabled, language, languageId, dictionaries } = config;
        const useConfig = { languageId, enabled, language, dictionaries };
        const msg = unindent`\
                Debug Config: ${formatWithOptions({ depth: 2, colors: useColor }, useConfig)}`;
        reporter.debug(msg);
    }
}

interface ConfigDependencies {
    files: string[];
}

function calcDependencies(config: CSpellSettings): ConfigDependencies {
    const { configFiles, dictionaryFiles } = extractDependencies(config);

    return { files: [...configFiles, ...dictionaryFiles] };
}

function reportConfigurationErrors(
    reporter: ProcessFileReporter,
    config: CSpellSettings,
    processFileOptions: ProcessFileOptions,
): number {
    const errors = extractImportErrors(config);
    return reportImportErrors(reporter, errors, processFileOptions);
}

function reportImportErrors(
    reporter: ProcessFileReporter,
    errors: ImportFileRefWithError[],
    processFileOptions: ProcessFileOptions,
): number {
    const { configErrors } = processFileOptions;
    let count = 0;
    errors.forEach((ref) => {
        const key = ref.error.toString();
        if (configErrors.has(key)) return;
        configErrors.add(key);
        count += 1;
        reporter.error('Configuration', ref.error);
    });

    return count;
}

function reportSpellingResultConfigErrors(
    reporter: ProcessFileReporter,
    spellResult: Partial<SpellCheckFileResult>,
    processFileOptions: ProcessFileOptions,
): number {
    const { configErrors } = processFileOptions;
    let count = reportImportErrors(reporter, spellResult.configErrors || [], processFileOptions);

    const dictionaryErrors = [...(spellResult.dictionaryErrors || [])];
    for (const [dictName, dictErrors] of dictionaryErrors) {
        const msg = `Dictionary Error with (${dictName})`;
        dictErrors.forEach((error) => {
            const key = msg + error.toString();
            if (configErrors.has(key)) return;
            configErrors.add(key);
            count += 1;
            reporter.error(msg, error);
        });
    }

    return count;
}

export function countConfigErrors(
    reporter: ProcessFileReporter,
    configInfo: ConfigInfo,
    processFileOptions: ProcessFileOptions,
): number {
    return reportConfigurationErrors(reporter, configInfo.config, processFileOptions);
}
