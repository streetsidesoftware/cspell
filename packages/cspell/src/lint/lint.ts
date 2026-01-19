import * as path from 'node:path';
import { formatWithOptions } from 'node:util';

import { isAsyncIterable, operators, opFilter, pipeAsync } from '@cspell/cspell-pipe';
import { opMap, pipe } from '@cspell/cspell-pipe/sync';
import type { Glob, RunResult } from '@cspell/cspell-types';
import { MessageTypes } from '@cspell/cspell-types';
import { toFileURL } from '@cspell/url';
import chalk from 'chalk';
import { dictionaryCacheEnableLogging, dictionaryCacheGetLog } from 'cspell-dictionary';
import { findRepoRoot, GitIgnore } from 'cspell-gitignore';
import { GlobMatcher, type GlobMatchOptions, type GlobPatternNormalized, type GlobPatternWithRoot } from 'cspell-glob';
import type { Logger } from 'cspell-lib';
import {
    ENV_CSPELL_GLOB_ROOT,
    getDefaultConfigLoader,
    isBinaryFile as cspellIsBinaryFile,
    mergeSettings,
    setLogger,
    shouldCheckDocument,
} from 'cspell-lib';

import { console } from '../console.js';
import { releaseCSpellAPI } from '../cspell-api/cspell-api.js';
import { getEnvironmentVariable, setEnvironmentVariable, truthy } from '../environment.js';
import { getFeatureFlags } from '../featureFlags/index.js';
import type { CSpellReporterConfiguration } from '../models.js';
import { npmPackage } from '../pkgInfo.js';
import type { CreateCacheSettings, CSpellLintResultCache } from '../util/cache/index.js';
import { calcCacheSettings, createCache } from '../util/cache/index.js';
import { type ConfigInfo, readConfig } from '../util/configFileHelper.js';
import { ApplicationError, CheckFailed, toApplicationError } from '../util/errors.js';
import {
    filenameToUri,
    findFiles,
    getFileSize,
    isBinaryFile,
    isFile,
    isNotDir,
    readFileInfo,
    readFileListFiles,
    relativeToCwd,
    resolveFilename,
} from '../util/fileHelper.js';
import type { GlobOptions } from '../util/glob.js';
import {
    buildGlobMatcher,
    extractGlobsFromMatcher,
    extractPatterns,
    normalizeFileOrGlobsToRoot,
    normalizeGlobsToRoot,
} from '../util/glob.js';
import type { LintFileResult } from '../util/LintFileResult.js';
import { prefetchIterable } from '../util/prefetch.js';
import type { FinalizedReporter } from '../util/reporters.js';
import { extractReporterIssueOptions, LintReporter } from '../util/reporters.js';
import { getTimeMeasurer } from '../util/timer.js';
import { unindent } from '../util/unindent.js';
import { sizeToNumber } from '../util/unitNumbers.js';
import * as util from '../util/util.js';
import { wordWrapAnsiText } from '../util/wrap.js';
import { writeFileOrStream } from '../util/writeFile.js';
import type { LintRequest } from './LintRequest.js';
import { countConfigErrors, processFile, type ProcessFileOptions } from './processFile.js';
import type { PFCached, PFFile, PFSkipped, PrefetchFileResult } from './types.js';

const version = npmPackage.version;

const BATCH_FETCH_SIZE = 8;
const BATCH_PROCESS_SIZE = 1;

const debugStats = false;

const { opFilterAsync } = operators;

export async function runLint(cfg: LintRequest): Promise<RunResult> {
    await using _api = {
        async [Symbol.asyncDispose]() {
            await releaseCSpellAPI();
        },
    };
    const reporter = new LintReporter(cfg.reporter, cfg.options);
    const configErrors = new Set<string>();
    const verboseLevel = calcVerboseLevel(cfg.options);
    const useColor = cfg.options.color ?? true;

    const timer = getTimeMeasurer();

    const logDictRequests = truthy(getEnvironmentVariable('CSPELL_ENABLE_DICTIONARY_LOGGING'));
    if (logDictRequests) {
        dictionaryCacheEnableLogging(true);
    }

    const lintResult = await run();

    if (logDictRequests) {
        await writeDictionaryLog();
    }

    await reporter.result(lintResult);
    const elapsed = timer();
    if (getFeatureFlags().getFlag('timer') || verboseLevel >= 1 || cfg.options.showPerfSummary) {
        console.log(`Elapsed Time: ${elapsed.toFixed(2)}ms`);
    }
    return lintResult;

    function prefetch(filename: string, configInfo: ConfigInfo, cache: CSpellLintResultCache): PrefetchFileResult {
        if (isBinaryFile(filename, cfg.root)) {
            return { filename, result: Promise.resolve({ skip: true, skipReason: 'Binary file.' }) };
        }
        const reportIssueOptions = extractReporterIssueOptions(configInfo.config);

        async function fetch(): Promise<PFCached | PFFile | PFSkipped> {
            const getElapsedTimeMs = getTimeMeasurer();
            const cachedResult = await cache.getCachedLintResults(filename);
            if (cachedResult) {
                reporter.debug(`Filename: ${filename}, using cache`);
                const fileResult = { ...cachedResult, elapsedTimeMs: getElapsedTimeMs() };
                return { fileResult };
            }
            const uri = filenameToUri(filename, cfg.root).href;
            const checkResult = await shouldCheckDocument({ uri }, {}, configInfo.config);
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
        return { filename, result };
    }

    async function processFiles(
        files: string[] | AsyncIterable<string>,
        configInfo: ConfigInfo,
        cacheSettings: CreateCacheSettings,
    ): Promise<RunResult> {
        const fileCount = Array.isArray(files) ? files.length : undefined;
        const status: RunResult = runResult();
        const cache = await createCache(cacheSettings);
        const failFast = cfg.options.failFast ?? configInfo.config.failFast ?? false;

        function* prefetchFiles(files: string[]) {
            const iter = prefetchIterable(
                pipe(
                    files,
                    opMap((filename) => prefetch(filename, configInfo, cache)),
                ),
                BATCH_FETCH_SIZE,
            );
            for (const v of iter) {
                yield v;
            }
        }

        async function* prefetchFilesAsync(files: string[] | AsyncIterable<string>) {
            for await (const filename of files) {
                yield prefetch(filename, configInfo, cache);
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

        async function processPrefetchFileResult(pf: PrefetchFileResult, index: number) {
            const { filename, result: pFetchResult } = pf;
            const getElapsedTimeMs = getTimeMeasurer();
            const fetchResult = await pFetchResult;
            if (fetchResult instanceof Error) {
                throw fetchResult;
            }
            reporter.emitProgressBegin(filename, index, fileCount ?? index);
            if (fetchResult?.skip) {
                const result: LintFileResult = {
                    ...emptyResult,
                    fileInfo: { filename },
                    elapsedTimeMs: getElapsedTimeMs(),
                    skippedReason: fetchResult.skipReason,
                };
                return {
                    filename,
                    fileNum: index,
                    result,
                };
            }
            const result = await processFile(filename, cache, fetchResult, getProcessFileOptions(configInfo));
            return { filename, fileNum: index, result };
        }

        async function* loadAndProcessFiles() {
            let i = 0;
            if (isAsyncIterable(files)) {
                for await (const pf of prefetchFilesAsync(files)) {
                    yield processPrefetchFileResult(pf, ++i);
                }
                return;
            }
            if (BATCH_PROCESS_SIZE <= 1) {
                for (const pf of prefetchFiles(files)) {
                    await pf.result; // force one at a time
                    yield processPrefetchFileResult(pf, ++i);
                }
                return;
            }
            yield* pipe(
                prefetchIterable(
                    pipe(
                        prefetchFiles(files),
                        opMap(async (pf) => processPrefetchFileResult(pf, ++i)),
                    ),
                    BATCH_PROCESS_SIZE,
                ),
            );
        }

        const toLoadAndProcess = loadAndProcessFiles();

        for await (const fileP of toLoadAndProcess) {
            const { filename, fileNum, result } = fileP;
            status.files += 1;
            status.cachedFiles = (status.cachedFiles || 0) + (result.cached ? 1 : 0);
            status.skippedFiles = (status.skippedFiles || 0) + (result.processed ? 0 : 1);
            const numIssues = reporter.emitProgressComplete(filename, fileNum, fileCount ?? fileNum, result);
            if (numIssues || result.errors) {
                status.filesWithIssues.add(relativeToCwd(filename, cfg.root));
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

    async function run(): Promise<RunResult> {
        if (cfg.options.root) {
            setEnvironmentVariable(ENV_CSPELL_GLOB_ROOT, cfg.root);
        }

        const configInfo: ConfigInfo = await readConfig(cfg.configFile, cfg.root, cfg.options.stopConfigSearchAt);

        const processFileOptions = getProcessFileOptions(configInfo);

        if (cfg.options.defaultConfiguration !== undefined) {
            configInfo.config.loadDefaultConfiguration = cfg.options.defaultConfiguration;
        }
        configInfo.config = mergeSettings(configInfo.config, cfg.cspellSettingsFromCliOptions);
        const reporterConfig: CSpellReporterConfiguration = util.clean({
            maxNumberOfProblems: configInfo.config.maxNumberOfProblems,
            maxDuplicateProblems: configInfo.config.maxDuplicateProblems,
            minWordLength: configInfo.config.minWordLength,
            ...cfg.options,
            console,
        });

        const reporters = cfg.options.reporter ?? configInfo.config.reporters;
        reporter.config = reporterConfig;
        await reporter.loadReportersAndFinalize(reporters);
        setLogger(getLoggerFromReporter(reporter, useColor));

        const globInfo = await determineGlobs(configInfo, cfg);
        const { fileGlobs, excludeGlobs } = globInfo;
        const hasFileLists = !!cfg.fileLists.length;
        if (!fileGlobs.length && !hasFileLists && !cfg.files?.length) {
            // Nothing to do.
            return runResult();
        }
        header(fileGlobs, excludeGlobs);

        checkGlobs(fileGlobs, reporter);

        if (verboseLevel > 1) {
            reporter.info(`Config Files Found:\n    ${relativeToCwd(configInfo.source)}\n`, MessageTypes.Info);
        }

        const configErrors = countConfigErrors(configInfo, processFileOptions);
        if (configErrors && cfg.options.exitCode !== false && !cfg.options.continueOnError) {
            return runResult({ errors: configErrors });
        }

        // Get Exclusions from the config files.
        const { root } = cfg;

        try {
            const cacheSettings = await calcCacheSettings(configInfo.config, { ...cfg.options, version }, root);
            const files = await determineFilesToCheck(configInfo, cfg, reporter, globInfo);

            const result = await processFiles(files, configInfo, cacheSettings);
            if (configErrors && cfg.options.exitCode !== false) {
                result.errors ||= configErrors;
            }
            debugStats && console.error('stats: %o', getDefaultConfigLoader().getStats());
            return result;
        } catch (e) {
            const err = toApplicationError(e);
            reporter.error('Linter', err);
            return runResult({ errors: 1 });
        }
    }

    function header(files: string[], cliExcludes: string[]) {
        if (verboseLevel < 2) return;
        const formattedFiles = files.length > 100 ? [...files.slice(0, 100), '...'] : files;

        reporter.info(
            unindent`
                cspell;
                Date: ${new Date().toUTCString()}
                Options:
                    verbose:   ${yesNo(!!cfg.options.verbose)}
                    config:    ${cfg.configFile || 'default'}
                    exclude:   ${wordWrapAnsiText(cliExcludes.join(', '), 60, '  ')}
                    files:     ${formattedFiles}
                    wordsOnly: ${yesNo(!!cfg.options.wordsOnly)}
                    unique:    ${yesNo(!!cfg.options.unique)}
                `,
            MessageTypes.Info,
        );
    }

    function getProcessFileOptions(configInfo: ConfigInfo): ProcessFileOptions {
        const processFileOptionsGeneral: ProcessFileOptions = {
            reporter,
            chalk,
            configInfo,
            cfg,
            verboseLevel,
            useColor,
            configErrors,
            // We could use the cli settings here but it is much slower.
            userSettings: cfg.cspellSettingsFromCliOptions,
            // userSettings: configInfo.config,
        };
        return processFileOptionsGeneral;
    }
}

interface AppGlobInfo {
    /** globs from cli or config.files */
    allGlobs: Glob[];
    /** GitIgnore config to use. */
    gitIgnore: GitIgnore | undefined;
    /** file globs used to search for matching files. */
    fileGlobs: string[];
    /** globs to exclude files found. */
    excludeGlobs: string[];
    /** normalized cli exclude globs */
    normalizedExcludes: string[];
}

function checkGlobs(globs: string[], reporter: FinalizedReporter) {
    globs
        .filter((g) => g.startsWith("'") || g.endsWith("'"))
        .map((glob) => chalk.yellow(glob))
        .forEach((glob) =>
            reporter.error(
                'Linter',
                new CheckFailed(
                    `Glob starting or ending with ' (single quote) is not likely to match any files: ${glob}.`,
                ),
            ),
        );
}

async function determineGlobs(configInfo: ConfigInfo, cfg: LintRequest): Promise<AppGlobInfo> {
    const useGitignore = cfg.options.gitignore ?? configInfo.config.useGitignore ?? false;
    const gitignoreRoots = cfg.options.gitignoreRoot ?? configInfo.config.gitignoreRoot;
    const gitIgnore = useGitignore ? await generateGitIgnore(gitignoreRoots) : undefined;

    const cliGlobs: string[] = cfg.fileGlobs;
    const allGlobs: Glob[] =
        (cliGlobs.length && cliGlobs) || (cfg.options.filterFiles !== false && configInfo.config.files) || [];
    const combinedGlobs = await normalizeFileOrGlobsToRoot(allGlobs, cfg.root);
    const cliExcludeGlobs = extractPatterns(cfg.excludes).map((p) => p.glob as Glob);
    const normalizedExcludes = normalizeGlobsToRoot(cliExcludeGlobs, cfg.root, true);
    const includeGlobs = combinedGlobs.filter((g) => !g.startsWith('!'));
    const excludeGlobs = [
        ...combinedGlobs.filter((g) => g.startsWith('!')).map((g) => g.slice(1)),
        ...normalizedExcludes,
    ];
    const fileGlobs: string[] = includeGlobs;

    const appGlobs = { allGlobs, gitIgnore, fileGlobs, excludeGlobs, normalizedExcludes };
    return appGlobs;
}

async function determineFilesToCheck(
    configInfo: ConfigInfo,
    cfg: LintRequest,
    reporter: FinalizedReporter,
    globInfo: AppGlobInfo,
): Promise<string[] | AsyncIterable<string>> {
    async function _determineFilesToCheck(): Promise<string[] | AsyncIterable<string>> {
        const { fileLists } = cfg;
        const hasFileLists = !!fileLists.length;
        const { allGlobs, gitIgnore, fileGlobs, excludeGlobs, normalizedExcludes } = globInfo;

        // Get Exclusions from the config files.
        const { root } = cfg;
        const globsToExcludeRaw = [...(configInfo.config.ignorePaths || []), ...excludeGlobs];
        const globsToExclude = globsToExcludeRaw.filter((g) => !globPattern(g).startsWith('!'));
        if (globsToExclude.length !== globsToExcludeRaw.length) {
            const globs = globsToExcludeRaw.map((g) => globPattern(g)).filter((g) => g.startsWith('!'));
            const msg = `Negative glob exclusions are not supported: ${globs.join(', ')}`;
            reporter.info(msg, MessageTypes.Warning);
        }
        const globMatcher = buildGlobMatcher(globsToExclude, root, true);
        const ignoreGlobs = extractGlobsFromMatcher(globMatcher);
        // cspell:word nodir
        const globOptions: GlobOptions = {
            root,
            cwd: root,
            ignore: [...ignoreGlobs, ...normalizedExcludes],
            nodir: true,
        };
        const enableGlobDot = cfg.enableGlobDot ?? configInfo.config.enableGlobDot;
        if (enableGlobDot !== undefined) {
            globOptions.dot = enableGlobDot;
        }

        const opFilterExcludedFiles = opFilter(filterOutExcludedFilesFn(globMatcher));
        const includeFilter = createIncludeFileFilterFn(allGlobs, root, enableGlobDot);
        const rawCliFiles = cfg.files?.map((file) => resolveFilename(file, root)).filter(includeFilter);
        const cliFiles = cfg.options.mustFindFiles
            ? rawCliFiles
            : rawCliFiles && pipeAsync(rawCliFiles, opFilterAsync(isFile));
        const foundFiles = hasFileLists
            ? concatAsyncIterables(cliFiles, await useFileLists(fileLists, includeFilter))
            : cliFiles || (await findFiles(fileGlobs, globOptions));
        const filtered = gitIgnore ? await gitIgnore.filterOutIgnored(foundFiles) : foundFiles;
        const files = isAsyncIterable(filtered)
            ? pipeAsync(filtered, opFilterExcludedFiles)
            : [...pipe(filtered, opFilterExcludedFiles)];
        return files;
    }

    function isExcluded(filename: string, globMatcherExclude: GlobMatcher) {
        if (cspellIsBinaryFile(toFileURL(filename))) {
            return true;
        }
        const { root } = cfg;
        const absFilename = path.resolve(root, filename);
        const r = globMatcherExclude.matchEx(absFilename);

        if (r.matched) {
            const { glob, source } = extractGlobSource(r.pattern);
            if (calcVerboseLevel(cfg.options) > 1) {
                reporter.info(
                    `Excluded File: ${path.relative(root, absFilename)}; Excluded by ${glob} from ${source}`,
                    MessageTypes.Info,
                );
            }
        }

        return r.matched;
    }

    function filterOutExcludedFilesFn(globMatcherExclude: GlobMatcher): (file: string) => boolean {
        const patterns = globMatcherExclude.patterns;
        const excludeInfo = patterns
            .map(extractGlobSource)
            .map(({ glob, source }) => `Glob: ${glob} from ${source}`)
            .filter(util.uniqueFn());
        if (calcVerboseLevel(cfg.options) > 1) {
            reporter.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`, MessageTypes.Info);
        }

        return (filename: string): boolean => !isExcluded(filename, globMatcherExclude);
    }

    return _determineFilesToCheck();
}

function extractGlobSource(g: GlobPatternWithRoot | GlobPatternNormalized) {
    const { glob, rawGlob, source } = <GlobPatternNormalized>g;
    return {
        glob: rawGlob || glob,
        source,
    };
}

function runResult(init: Partial<RunResult> = {}): RunResult {
    const { files = 0, filesWithIssues = new Set<string>(), issues = 0, errors = 0, cachedFiles = 0 } = init;
    return { files, filesWithIssues, issues, errors, cachedFiles };
}

function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}

function getLoggerFromReporter(reporter: Pick<FinalizedReporter, 'info' | 'error'>, useColor: boolean): Logger {
    const inspectOptions = { colors: useColor };
    const log: Logger['log'] = (...params) => {
        const msg = formatWithOptions(inspectOptions, ...params);
        reporter.info(msg, 'Info');
    };

    const error: Logger['error'] = (...params) => {
        const msg = formatWithOptions(inspectOptions, ...params);
        const err = { message: '', name: 'error', toString: () => '' };
        reporter.error(msg, err);
    };
    const warn: Logger['warn'] = (...params) => {
        const msg = formatWithOptions(inspectOptions, ...params);
        reporter.info(msg, 'Warning');
    };

    return {
        log,
        warn,
        error,
    };
}

async function generateGitIgnore(roots: string | string[] | undefined) {
    const root = (typeof roots === 'string' ? [roots].filter((r) => !!r) : roots) || [];
    if (!root?.length) {
        const cwd = process.cwd();
        const repo = (await findRepoRoot(cwd)) || cwd;
        root.push(repo);
    }
    return new GitIgnore(root?.map((p) => path.resolve(p)));
}

async function useFileLists(
    fileListFiles: string[],
    filterFiles: (file: string) => boolean,
): Promise<string[] | AsyncIterable<string>> {
    const files = readFileListFiles(fileListFiles);
    return pipeAsync(files, opFilter(filterFiles), opFilterAsync(isNotDir));
}

function createIncludeFileFilterFn(includeGlobPatterns: Glob[] | undefined, root: string, dot: boolean | undefined) {
    if (!includeGlobPatterns?.length) {
        return () => true;
    }
    const patterns = includeGlobPatterns.map((g) => (g === '.' ? '/**' : g));
    const options: GlobMatchOptions = { root, mode: 'include' };
    if (dot !== undefined) {
        options.dot = dot;
    }
    const globMatcher = new GlobMatcher(patterns, options);

    return (file: string) => globMatcher.match(file);
}

async function* concatAsyncIterables<T>(
    ...iterables: (AsyncIterable<T> | Iterable<T> | undefined)[]
): AsyncIterable<T> {
    for (const iter of iterables) {
        if (!iter) continue;
        yield* iter;
    }
}

async function writeDictionaryLog() {
    const fieldsCsv = getEnvironmentVariable('CSPELL_ENABLE_DICTIONARY_LOG_FIELDS') || 'time, word, value';
    const fields = fieldsCsv.split(',').map((f) => f.trim());
    const header = fields.join(', ') + '\n';
    const lines = dictionaryCacheGetLog()
        .filter((d) => d.method === 'has')
        .map((d) => fields.map((f) => (f in d ? `${d[f as keyof typeof d]}` : '')).join(', '));
    const data = header + lines.join('\n') + '\n';
    const filename = getEnvironmentVariable('CSPELL_ENABLE_DICTIONARY_LOG_FILE') || 'cspell-dictionary-log.csv';

    await writeFileOrStream(filename, data);
}

function globPattern(g: Glob) {
    return typeof g === 'string' ? g : g.glob;
}

function calcVerboseLevel(options: LintRequest['options']): number {
    return options.verboseLevel ?? (options.verbose ? 1 : 0);
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
