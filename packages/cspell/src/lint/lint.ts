import * as path from 'node:path';
import { formatWithOptions } from 'node:util';

import { isAsyncIterable, operators, opFilter, pipeAsync } from '@cspell/cspell-pipe';
import { pipe } from '@cspell/cspell-pipe/sync';
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
} from 'cspell-lib';

import { console } from '../console.js';
import { getEnvironmentVariable, setEnvironmentVariable, truthy } from '../environment.js';
import { getFeatureFlags } from '../featureFlags/index.js';
import type { CSpellReporterConfiguration } from '../models.js';
import { npmPackage } from '../pkgInfo.js';
import { calcCacheSettings } from '../util/cache/index.js';
import { type ConfigInfo, readConfig } from '../util/configFileHelper.js';
import { CheckFailed, toApplicationError } from '../util/errors.js';
import { findFiles, isFile, isNotDir, readFileListFiles, relativeToCwd, resolveFilename } from '../util/fileHelper.js';
import type { GlobOptions } from '../util/glob.js';
import {
    buildGlobMatcher,
    extractGlobsFromMatcher,
    extractPatterns,
    normalizeFileOrGlobsToRoot,
    normalizeGlobsToRoot,
} from '../util/glob.js';
import type { FinalizedReporter } from '../util/reporters.js';
import { LintReporter } from '../util/reporters.js';
import { getTimeMeasurer } from '../util/timer.js';
import { unindent } from '../util/unindent.js';
import * as util from '../util/util.js';
import { wordWrapAnsiText } from '../util/wrap.js';
import { writeFileOrStream } from '../util/writeFile.js';
import type { LintRequest } from './LintRequest.js';
import type { ProcessFileOptions } from './processFile.js';
import { countConfigErrors } from './processFile.js';
import type { ProcessFilesOptions } from './processFiles.js';
import { processFiles, runResult } from './processFiles.js';
import type { FileToProcess } from './types.js';

const version = npmPackage.version;

const debugStats = false;

const { opFilterAsync } = operators;

export async function runLint(cfg: LintRequest): Promise<RunResult> {
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
        console.error(`Elapsed Time: ${elapsed.toFixed(2)}ms`);
    }
    return lintResult;

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

        const configErrorCount = countConfigErrors(configInfo, processFileOptions);
        if (configErrorCount && cfg.options.exitCode !== false && !cfg.options.continueOnError) {
            return runResult({ errors: configErrorCount });
        }

        // Get Exclusions from the config files.
        const { root } = cfg;

        try {
            const cacheSettings = await calcCacheSettings(configInfo.config, { ...cfg.options, version }, root);
            const files = await determineFilesToCheck(configInfo, cfg, reporter, globInfo);

            const processFilesOptions: ProcessFilesOptions = {
                chalk,
                configInfo,
                cfg,
                verboseLevel,
                useColor,
                configErrors,
                userSettings: configInfo.config,
                lintReporter: reporter,
                cacheSettings,
            };

            const result = await processFiles(files, processFilesOptions);
            if (configErrorCount && cfg.options.exitCode !== false) {
                result.errors ||= configErrorCount;
            }
            debugStats && console.error('stats: %o', getDefaultConfigLoader().getStats());
            return result;
        } catch (e) {
            const err = toApplicationError(e);
            reporter.error('Linter', err);
            return runResult({ errors: 1 });
        }
    }

    function header(files: string[], cliExcludes: string[]): void {
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
            userSettings: configInfo.config,
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

function checkGlobs(globs: string[], reporter: FinalizedReporter): void {
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

async function* filesToProcessAsync(filenames: AsyncIterable<string>): AsyncIterable<FileToProcess> {
    let sequence = 0;
    for await (const filename of filenames) {
        yield { filename, sequence: sequence++ };
    }
}

function filesToProcess(files: Iterable<string>): FileToProcess[] {
    const filenames = [...files];
    const sequenceSize = filenames.length;
    return filenames.map((filename, sequence) => ({ filename, sequence, sequenceSize }));
}

async function determineFilesToCheck(
    configInfo: ConfigInfo,
    cfg: LintRequest,
    reporter: FinalizedReporter,
    globInfo: AppGlobInfo,
): Promise<FileToProcess[] | AsyncIterable<FileToProcess>> {
    async function _determineFilesToCheck(): Promise<FileToProcess[] | AsyncIterable<FileToProcess>> {
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
            ? pipeAsync(filtered, opFilterExcludedFiles, filesToProcessAsync)
            : filesToProcess(pipe(filtered, opFilterExcludedFiles));
        return files;
    }

    function isExcluded(filename: string, globMatcherExclude: GlobMatcher): boolean {
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

interface GlobAndSource {
    glob: string;
    source: string | undefined;
}

function extractGlobSource(g: GlobPatternWithRoot | GlobPatternNormalized): GlobAndSource {
    const { glob, rawGlob, source } = <GlobPatternNormalized>g;
    return {
        glob: rawGlob || glob,
        source,
    };
}

function yesNo(value: boolean): 'Yes' | 'No' {
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

async function generateGitIgnore(roots: string | string[] | undefined): Promise<GitIgnore> {
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

function createIncludeFileFilterFn(
    includeGlobPatterns: Glob[] | undefined,
    root: string,
    dot: boolean | undefined,
): (file: string) => boolean {
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

async function writeDictionaryLog(): Promise<void> {
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

function globPattern(g: Glob): string {
    return typeof g === 'string' ? g : g.glob;
}

function calcVerboseLevel(options: LintRequest['options']): number {
    return options.verboseLevel ?? (options.verbose ? 1 : 0);
}
