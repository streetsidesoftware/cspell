import { isAsyncIterable } from '@cspell/cspell-pipe';
import { opMap, pipe } from '@cspell/cspell-pipe/sync';
import type { CSpellSettings, CSpellSettingsWithSourceTrace, RunResult } from '@cspell/cspell-types';
import type { ChalkInstance } from 'chalk';
import { shouldCheckDocument } from 'cspell-lib';

import type { CreateCacheSettings, CSpellLintResultCache } from '../util/cache/index.js';
import { createCache } from '../util/cache/index.js';
import type { ConfigInfo } from '../util/configFileHelper.js';
import { ApplicationError, toApplicationError } from '../util/errors.js';
import { filenameToUri, getFileSize, isBinaryFile, readFileInfo, relativeToCwd } from '../util/fileHelper.js';
import type { LintFileResult } from '../util/LintFileResult.js';
import { prefetchIterable } from '../util/prefetch.js';
import type { LintFileReporter, LintReporter } from '../util/reporters.js';
import { extractReporterIssueOptions } from '../util/reporters.js';
import { getTimeMeasurer } from '../util/timer.js';
import { sizeToNumber } from '../util/unitNumbers.js';
import type { LintRequest } from './LintRequest.js';
import type { ProcessFileOptions } from './processFile.js';
import { processFile } from './processFile.js';
import type {
    FileToProcess,
    PFCached,
    PFFile,
    PFSkipped,
    PrefetchFileResult,
    ProcessPrefetchFileResult,
} from './types.js';

const BATCH_FETCH_SIZE = 12;
const BATCH_PROCESS_SIZE = 1;

interface PrefetchConfig {
    readonly reporter: LintFileReporter;
    readonly root: LintRequest['root'];
    readonly maxFileSize: LintRequest['maxFileSize'];
    readonly config: CSpellSettings;
    readonly cache: CSpellLintResultCache;
}

function prefetch(fileToProcess: FileToProcess, cfg: PrefetchConfig): PrefetchFileResult {
    const { filename } = fileToProcess;
    if (isBinaryFile(filename, cfg.root)) {
        return {
            ...fileToProcess,
            result: Promise.resolve({ skip: true, skipReason: 'Binary file.' }),
        };
    }
    const reportIssueOptions = extractReporterIssueOptions(cfg.config);

    async function fetch(): Promise<PFCached | PFFile | PFSkipped> {
        const getElapsedTimeMs = getTimeMeasurer();
        const cachedResult = await cfg.cache.getCachedLintResults(filename);
        if (cachedResult) {
            cfg.reporter.debug(`Filename: ${filename}, using cache`);
            const fileResult = { ...cachedResult, elapsedTimeMs: getElapsedTimeMs() };
            return { fileResult };
        }
        const uri = filenameToUri(filename, cfg.root).href;
        const checkResult = await shouldCheckDocument({ uri }, {}, cfg.config);
        if (!checkResult.shouldCheck) {
            return { skip: true, skipReason: checkResult.reason || 'Ignored by configuration.' } as const;
        }
        const maxFileSize = processMaxFileSize(cfg.maxFileSize ?? checkResult.settings.maxFileSize);
        if (maxFileSize) {
            const size = await getFileSize(filename);
            if (size > maxFileSize) {
                return {
                    skip: true,
                    skipReason: `File exceeded max file size of ${maxFileSize.toLocaleString()}`,
                } as const;
            }
        }
        const fileInfo = await readFileInfo(filename, undefined, true);
        return { fileInfo, reportIssueOptions };
    }

    const result: Promise<PFCached | PFFile | PFSkipped | Error> = fetch().catch((e) => toApplicationError(e));
    return { ...fileToProcess, result };
}

export interface ProcessFilesOptions {
    readonly lintReporter: LintReporter;
    readonly configInfo: ConfigInfo;
    readonly verboseLevel: number;
    readonly useColor: boolean;
    readonly cfg: LintRequest;
    readonly configErrors: Set<string>;
    readonly chalk: ChalkInstance;
    readonly userSettings: CSpellSettingsWithSourceTrace;
    readonly cacheSettings: CreateCacheSettings;
}

export async function processFiles(
    files: FileToProcess[] | AsyncIterable<FileToProcess>,
    options: ProcessFilesOptions,
): Promise<RunResult> {
    const status: RunResult = runResult();
    const cache = await createCache(options.cacheSettings);
    const failFast = options.cfg.options.failFast ?? options.configInfo.config.failFast ?? false;
    const reporter: LintFileReporter = options.lintReporter;
    const prefetchConfig: PrefetchConfig = {
        reporter,
        root: options.cfg.root,
        maxFileSize: options.cfg.maxFileSize,
        config: options.configInfo.config,
        cache,
    };
    const processFileOptionsGeneral: ProcessFileOptions = {
        reporter,
        chalk: options.chalk,
        configInfo: options.configInfo,
        cfg: options.cfg,
        verboseLevel: options.verboseLevel,
        useColor: options.useColor,
        configErrors: options.configErrors,
        // We could use the cli settings here but it is much slower.
        // userSettings: cfg.cspellSettingsFromCliOptions,
        userSettings: options.configInfo.config,
    };

    function* prefetchFiles(files: FileToProcess[]): Iterable<PrefetchFileResult> {
        const iter = prefetchIterable(
            pipe(
                files,
                opMap((file) => prefetch(file, prefetchConfig)),
            ),
            BATCH_FETCH_SIZE,
        );
        yield* iter;
    }

    async function* prefetchFilesAsync(
        files: FileToProcess[] | AsyncIterable<FileToProcess>,
    ): AsyncIterable<PrefetchFileResult> {
        for await (const file of files) {
            yield prefetch(file, prefetchConfig);
        }
    }

    const emptyResult: LintFileResult = {
        fileInfo: { filename: '' },
        issues: [],
        processed: false,
        errors: 0,
        configErrors: 0,
        elapsedTimeMs: 1,
        reportIssueOptions: undefined,
    };

    async function processPrefetchFileResult(pf: PrefetchFileResult): Promise<ProcessPrefetchFileResult> {
        const { filename, sequence, sequenceSize, result: pFetchResult } = pf;
        const getElapsedTimeMs = getTimeMeasurer();
        const fetchResult = await pFetchResult;
        if (fetchResult instanceof Error) {
            throw fetchResult;
        }
        const fileNum = sequence + 1;
        reporter.emitProgressBegin(filename, fileNum, pf.sequenceSize ?? sequence);
        if (fetchResult?.skip) {
            const result: LintFileResult = {
                ...emptyResult,
                fileInfo: { filename },
                elapsedTimeMs: getElapsedTimeMs(),
                skippedReason: fetchResult.skipReason,
            };
            return { filename, sequence, sequenceSize, result };
        }
        const result = await processFile(filename, cache, fetchResult, processFileOptionsGeneral);
        return { filename, sequence, sequenceSize, result };
    }

    async function* loadAndProcessFiles(): AsyncIterable<ProcessPrefetchFileResult> {
        if (isAsyncIterable(files)) {
            for await (const pf of prefetchFilesAsync(files)) {
                yield processPrefetchFileResult(pf);
            }
            return;
        }
        if (BATCH_PROCESS_SIZE <= 1) {
            for (const pf of prefetchFiles(files)) {
                await pf.result; // force one at a time
                yield processPrefetchFileResult(pf);
            }
            return;
        }
        yield* pipe(
            prefetchIterable(
                pipe(
                    prefetchFiles(files),
                    opMap(async (pf) => processPrefetchFileResult(pf)),
                ),
                BATCH_PROCESS_SIZE,
            ),
        );
    }

    for await (const fileP of loadAndProcessFiles()) {
        const { filename, sequence, sequenceSize, result } = fileP;
        status.files += 1;
        status.cachedFiles = (status.cachedFiles || 0) + (result.cached ? 1 : 0);
        status.skippedFiles = (status.skippedFiles || 0) + (result.processed ? 0 : 1);
        const fileNum = sequence + 1;
        const numIssues = reporter.emitProgressComplete(filename, fileNum, sequenceSize ?? fileNum, result);
        if (numIssues || result.errors) {
            status.filesWithIssues.add(relativeToCwd(filename, options.cfg.root));
            status.issues += numIssues;
            status.errors += result.errors;
            if (failFast) {
                return status;
            }
        }
        status.errors += result.configErrors;
    }

    await cache.reconcile();
    return status;
}

function processMaxFileSize(value: number | string | undefined): number | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    const num = sizeToNumber(value);
    if (Number.isNaN(num)) {
        throw new ApplicationError(`Invalid max file size: "${value}"`);
    }
    return num;
}

export function runResult(init: Partial<RunResult> = {}): RunResult {
    const { files = 0, filesWithIssues = new Set<string>(), issues = 0, errors = 0, cachedFiles = 0 } = init;
    return { files, filesWithIssues, issues, errors, cachedFiles };
}
