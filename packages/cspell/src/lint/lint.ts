import { isAsyncIterable, operators, opFilter, pipeAsync, pipeSync } from '@cspell/cspell-pipe';
import type { CSpellReporter, CSpellSettings, Glob, Issue, RunResult, TextDocumentOffset } from '@cspell/cspell-types';
import { MessageTypes } from '@cspell/cspell-types';
import { findRepoRoot, GitIgnore } from 'cspell-gitignore';
import { GlobMatcher, type GlobMatchOptions, type GlobPatternNormalized, type GlobPatternWithRoot } from 'cspell-glob';
import type { Logger, ValidationIssue } from 'cspell-lib';
import * as cspell from 'cspell-lib';
import * as path from 'path';
import { format } from 'util';
import { URI } from 'vscode-uri';
import type { CSpellLintResultCache, CreateCacheSettings } from '../util/cache';
import { calcCacheSettings, createCache } from '../util/cache';
import { CheckFailed, toApplicationError, toError } from '../util/errors';
import type { ConfigInfo, FileResult } from '../util/fileHelper';
import {
    fileInfoToDocument,
    findFiles,
    isNotDir,
    readConfig,
    readFileInfo,
    readFileListFiles,
} from '../util/fileHelper';
import type { GlobOptions } from '../util/glob';
import { buildGlobMatcher, extractGlobsFromMatcher, extractPatterns, normalizeGlobsToRoot } from '../util/glob';
import { loadReporters, mergeReporters } from '../util/reporters';
import { getTimeMeasurer } from '../util/timer';
import * as util from '../util/util';
import type { LintRequest } from './LintRequest';
import chalk from 'chalk';
import { getFeatureFlags } from '../featureFlags';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require('../../package.json');
const version = npmPackage.version;

const { opFilterAsync } = operators;

export async function runLint(cfg: LintRequest): Promise<RunResult> {
    let { reporter } = cfg;
    cspell.setLogger(getLoggerFromReporter(reporter));
    const configErrors = new Set<string>();

    const timer = getTimeMeasurer();

    const lintResult = await run();
    await reporter.result(lintResult);
    const elapsed = timer();
    if (getFeatureFlags().getFlag('timer')) {
        console.log(`Elapsed Time: ${elapsed.toFixed(2)}ms`);
    }
    return lintResult;

    async function processFile(
        filename: string,
        configInfo: ConfigInfo,
        cache: CSpellLintResultCache
    ): Promise<FileResult> {
        const getElapsedTimeMs = getTimeMeasurer();
        const cachedResult = await cache.getCachedLintResults(filename);
        if (cachedResult) {
            reporter.debug(`Filename: ${filename}, using cache`);
            return { ...cachedResult, elapsedTimeMs: getElapsedTimeMs() };
        }

        const result: FileResult = {
            fileInfo: {
                filename,
            },
            issues: [],
            processed: false,
            errors: 0,
            configErrors: 0,
            elapsedTimeMs: 0,
        };

        const fileInfo = await readFileInfo(filename, undefined, true);
        if (fileInfo.errorCode) {
            if (fileInfo.errorCode !== 'EISDIR' && cfg.options.mustFindFiles) {
                const err = toError(`File not found: "${filename}"`);
                reporter.error('Linter:', err);
                result.errors += 1;
            }
            return result;
        }

        const doc = fileInfoToDocument(fileInfo, cfg.options.languageId, cfg.locale);
        const { text } = fileInfo;
        result.fileInfo = fileInfo;

        let spellResult: Partial<cspell.SpellCheckFileResult> = {};
        reporter.info(
            `Checking: ${filename}, File type: ${doc.languageId ?? 'auto'}, Language: ${doc.locale ?? 'default'}`,
            MessageTypes.Info
        );
        try {
            const { showSuggestions: generateSuggestions, validateDirectives } = cfg.options;
            const validateOptions = { generateSuggestions, numSuggestions: 5, validateDirectives };
            const r = await cspell.spellCheckDocument(doc, validateOptions, configInfo.config);
            spellResult = r;
            result.processed = r.checked;
            result.issues = cspell.Text.calculateTextDocumentOffsets(doc.uri, text, r.issues).map(mapIssue);
        } catch (e) {
            reporter.error(`Failed to process "${filename}"`, toError(e));
            result.errors += 1;
        }
        result.elapsedTimeMs = getElapsedTimeMs();

        const config = spellResult.settingsUsed ?? {};

        result.configErrors += await reportConfigurationErrors(config);

        const elapsed = result.elapsedTimeMs / 1000.0;
        const dictionaries = config.dictionaries || [];
        reporter.info(
            `Checked: ${filename}, File type: ${config.languageId}, Language: ${config.language} ... Issues: ${result.issues.length} ${elapsed}S`,
            MessageTypes.Info
        );
        reporter.info(`Config file Used: ${spellResult.localConfigFilepath || configInfo.source}`, MessageTypes.Info);
        reporter.info(`Dictionaries Used: ${dictionaries.join(', ')}`, MessageTypes.Info);

        if (cfg.options.debug) {
            const { id: _id, name: _name, __imports, __importRef, ...cfg } = config;
            const debugCfg = {
                filename,
                languageId: doc.languageId ?? cfg.languageId ?? 'default',
                config: { ...cfg, source: null },
                source: spellResult.localConfigFilepath,
            };
            reporter.debug(JSON.stringify(debugCfg, undefined, 2));
        }

        const dep = calcDependencies(config);

        cache.setCachedLintResults(result, dep.files);
        return result;
    }

    function mapIssue({ doc: _, ...tdo }: TextDocumentOffset & ValidationIssue): Issue {
        const context = cfg.showContext
            ? extractContext(tdo, cfg.showContext)
            : { text: tdo.line.text.trimEnd(), offset: tdo.line.offset };
        return { ...tdo, context };
    }

    async function processFiles(
        files: string[] | AsyncIterable<string>,
        configInfo: ConfigInfo,
        cacheSettings: CreateCacheSettings
    ): Promise<RunResult> {
        const fileCount = files instanceof Array ? files.length : undefined;
        const status: RunResult = runResult();
        const cache = createCache(cacheSettings);
        const failFast = cfg.options.failFast ?? configInfo.config.failFast ?? false;

        const emitProgressBegin = (filename: string, fileNum: number, fileCount: number) =>
            reporter.progress({
                type: 'ProgressFileBegin',
                fileNum,
                fileCount,
                filename,
            });

        const emitProgressComplete = (filename: string, fileNum: number, fileCount: number, result: FileResult) =>
            reporter.progress({
                type: 'ProgressFileComplete',
                fileNum,
                fileCount,
                filename,
                elapsedTimeMs: result?.elapsedTimeMs,
                processed: result?.processed,
                numErrors: result?.issues.length || result?.errors,
                cached: result?.cached,
            });

        async function* loadAndProcessFiles() {
            let i = 0;
            for await (const filename of files) {
                ++i;
                emitProgressBegin(filename, i, fileCount ?? i);
                const result = await processFile(filename, configInfo, cache);
                yield { filename, fileNum: i, result };
            }
        }

        for await (const fileP of loadAndProcessFiles()) {
            const { filename, fileNum, result } = await fileP;
            status.files += 1;
            status.cachedFiles = (status.cachedFiles || 0) + (result.cached ? 1 : 0);
            emitProgressComplete(filename, fileNum, fileCount ?? fileNum, result);
            // Show the spelling errors after emitting the progress.
            result.issues.filter(cfg.uniqueFilter).forEach((issue) => reporter.issue(issue));
            if (result.issues.length || result.errors) {
                status.filesWithIssues.add(filename);
                status.issues += result.issues.length;
                status.errors += result.errors;
                if (failFast) {
                    return status;
                }
            }
            status.errors += result.configErrors;
        }

        cache.reconcile();
        return status;
    }

    interface ConfigDependencies {
        files: string[];
    }

    function calcDependencies(config: CSpellSettings): ConfigDependencies {
        const { configFiles, dictionaryFiles } = cspell.extractDependencies(config);

        return { files: configFiles.concat(dictionaryFiles) };
    }

    async function reportConfigurationErrors(config: CSpellSettings): Promise<number> {
        const errors = cspell.extractImportErrors(config);
        let count = 0;
        errors.forEach((ref) => {
            const key = ref.error.toString();
            if (configErrors.has(key)) return;
            configErrors.add(key);
            count += 1;
            reporter.error('Configuration', ref.error);
        });

        const dictCollection = await cspell.getDictionary(config);
        dictCollection.dictionaries.forEach((dict) => {
            const dictErrors = dict.getErrors?.() || [];
            const msg = `Dictionary Error with (${dict.name})`;
            dictErrors.forEach((error) => {
                const key = msg + error.toString();
                if (configErrors.has(key)) return;
                configErrors.add(key);
                count += 1;
                reporter.error(msg, error);
            });
        });

        return count;
    }

    function countConfigErrors(configInfo: ConfigInfo): Promise<number> {
        return reportConfigurationErrors(configInfo.config);
    }

    async function run(): Promise<RunResult> {
        if (cfg.options.root) {
            process.env[cspell.ENV_CSPELL_GLOB_ROOT] = cfg.root;
        }

        const configInfo: ConfigInfo = await readConfig(cfg.configFile, cfg.root);
        if (cfg.options.defaultConfiguration !== undefined) {
            configInfo.config.loadDefaultConfiguration = cfg.options.defaultConfiguration;
        }
        reporter = mergeReporters(cfg.reporter, ...loadReporters(configInfo.config));
        cspell.setLogger(getLoggerFromReporter(reporter));

        const globInfo = await determineGlobs(configInfo, cfg);
        const { fileGlobs, excludeGlobs } = globInfo;
        const hasFileLists = !!cfg.fileLists.length;
        if (!fileGlobs.length && !hasFileLists) {
            // Nothing to do.
            return runResult();
        }
        header(fileGlobs, excludeGlobs);

        checkGlobs(cfg.fileGlobs, reporter);

        reporter.info(`Config Files Found:\n    ${configInfo.source}\n`, MessageTypes.Info);

        const configErrors = await countConfigErrors(configInfo);
        if (configErrors) return runResult({ errors: configErrors });

        // Get Exclusions from the config files.
        const { root } = cfg;

        try {
            const cacheSettings = await calcCacheSettings(configInfo.config, { ...cfg.options, version }, root);
            const files = await determineFilesToCheck(configInfo, cfg, reporter, globInfo);

            return await processFiles(files, configInfo, cacheSettings);
        } catch (e) {
            const err = toApplicationError(e);
            reporter.error('Linter', err);
            return runResult({ errors: 1 });
        }
    }

    function header(files: string[], cliExcludes: string[]) {
        const formattedFiles = files.length > 100 ? files.slice(0, 100).concat(['...']) : files;

        reporter.info(
            `
cspell;
Date: ${new Date().toUTCString()}
Options:
    verbose:   ${yesNo(!!cfg.options.verbose)}
    config:    ${cfg.configFile || 'default'}
    exclude:   ${cliExcludes.join('\n               ')}
    files:     ${formattedFiles}
    wordsOnly: ${yesNo(!!cfg.options.wordsOnly)}
    unique:    ${yesNo(!!cfg.options.unique)}
`,
            MessageTypes.Info
        );
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

function checkGlobs(globs: string[], reporter: CSpellReporter) {
    globs
        .filter((g) => g.startsWith("'") || g.endsWith("'"))
        .map((glob) => chalk.yellow(glob))
        .forEach((glob) =>
            reporter.error(
                'Linter',
                new CheckFailed(
                    `Glob starting or ending with ' (single quote) is not likely to match any files: ${glob}.`
                )
            )
        );
}

async function determineGlobs(configInfo: ConfigInfo, cfg: LintRequest): Promise<AppGlobInfo> {
    const useGitignore = cfg.options.gitignore ?? configInfo.config.useGitignore ?? false;
    const gitignoreRoots = cfg.options.gitignoreRoot ?? configInfo.config.gitignoreRoot;
    const gitIgnore = useGitignore ? await generateGitIgnore(gitignoreRoots) : undefined;

    const cliGlobs: Glob[] = cfg.fileGlobs;
    const allGlobs: Glob[] = cliGlobs.length ? cliGlobs : configInfo.config.files || [];
    const combinedGlobs = normalizeGlobsToRoot(allGlobs, cfg.root, false);
    const cliExcludeGlobs = extractPatterns(cfg.excludes).map((p) => p.glob);
    const normalizedExcludes = normalizeGlobsToRoot(cliExcludeGlobs, cfg.root, true);
    const includeGlobs = combinedGlobs.filter((g) => !g.startsWith('!'));
    const excludeGlobs = combinedGlobs.filter((g) => g.startsWith('!')).concat(normalizedExcludes);
    const fileGlobs: string[] = includeGlobs;

    return { allGlobs, gitIgnore, fileGlobs, excludeGlobs, normalizedExcludes };
}

async function determineFilesToCheck(
    configInfo: ConfigInfo,
    cfg: LintRequest,
    reporter: CSpellReporter,
    globInfo: AppGlobInfo
): Promise<string[] | AsyncIterable<string>> {
    async function _determineFilesToCheck(): Promise<string[] | AsyncIterable<string>> {
        const { fileLists } = cfg;
        const hasFileLists = !!fileLists.length;
        const { allGlobs, gitIgnore, fileGlobs, excludeGlobs, normalizedExcludes } = globInfo;

        // Get Exclusions from the config files.
        const { root } = cfg;
        const globsToExclude = (configInfo.config.ignorePaths || []).concat(excludeGlobs);
        const globMatcher = buildGlobMatcher(globsToExclude, root, true);
        const ignoreGlobs = extractGlobsFromMatcher(globMatcher);
        // cspell:word nodir
        const globOptions: GlobOptions = {
            root,
            cwd: root,
            ignore: ignoreGlobs.concat(normalizedExcludes),
            nodir: true,
        };
        const enableGlobDot = cfg.enableGlobDot ?? configInfo.config.enableGlobDot;
        if (enableGlobDot !== undefined) {
            globOptions.dot = enableGlobDot;
        }

        const filterFiles = opFilter(filterFilesFn(globMatcher));
        const foundFiles = await (hasFileLists
            ? useFileLists(fileLists, allGlobs, root, enableGlobDot)
            : findFiles(fileGlobs, globOptions));
        const filtered = gitIgnore ? await gitIgnore.filterOutIgnored(foundFiles) : foundFiles;
        const files = isAsyncIterable(filtered)
            ? pipeAsync(filtered, filterFiles)
            : [...pipeSync(filtered, filterFiles)];
        return files;
    }

    function isExcluded(filename: string, globMatcherExclude: GlobMatcher) {
        if (cspell.isBinaryFile(URI.file(filename))) {
            return true;
        }
        const { root } = cfg;
        const absFilename = path.resolve(root, filename);
        const r = globMatcherExclude.matchEx(absFilename);

        if (r.matched) {
            const { glob, source } = extractGlobSource(r.pattern);
            reporter.info(
                `Excluded File: ${path.relative(root, absFilename)}; Excluded by ${glob} from ${source}`,
                MessageTypes.Info
            );
        }

        return r.matched;
    }

    function filterFilesFn(globMatcherExclude: GlobMatcher): (file: string) => boolean {
        const patterns = globMatcherExclude.patterns;
        const excludeInfo = patterns
            .map(extractGlobSource)
            .map(({ glob, source }) => `Glob: ${glob} from ${source}`)
            .filter(util.uniqueFn());
        reporter.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`, MessageTypes.Info);
        return (filename: string): boolean => !isExcluded(filename, globMatcherExclude);
    }

    return _determineFilesToCheck();
}

function extractContext(
    tdo: Pick<cspell.TextDocumentOffset, 'line' | 'offset' | 'text'>,
    contextRange: number
): cspell.TextOffset {
    const { line, offset } = tdo;
    const textOffsetInLine = offset - line.offset;
    let left = Math.max(textOffsetInLine - contextRange, 0);
    let right = Math.min(line.text.length, textOffsetInLine + contextRange + tdo.text.length);
    const lineText = line.text;

    const isLetter = /^[a-z]$/i;
    const isSpace = /^\s$/;

    for (let n = contextRange / 2; n > 0 && left > 0; n--, left--) {
        if (!isLetter.test(lineText[left - 1])) {
            break;
        }
    }

    for (let n = contextRange / 2; n > 0 && right < lineText.length; n--, right++) {
        if (!isLetter.test(lineText[right])) {
            break;
        }
    }

    // remove leading space
    for (; left < textOffsetInLine && isSpace.test(lineText[left]); left++) {
        /* do nothing */
    }

    const context = {
        text: line.text.slice(left, right).trimEnd(),
        offset: left + line.offset,
    };
    return context;
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

function getLoggerFromReporter(reporter: CSpellReporter): Logger {
    const log: Logger['log'] = (...params) => {
        const msg = format(...params);
        reporter.info(msg, 'Info');
    };

    const error: Logger['error'] = (...params) => {
        const msg = format(...params);
        const err = { message: '', name: 'error', toString: () => '' };
        reporter.error(msg, err);
    };
    const warn: Logger['warn'] = (...params) => {
        const msg = format(...params);
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
    includeGlobPatterns: Glob[],
    root: string,
    dot: boolean | undefined
): Promise<string[] | AsyncIterable<string>> {
    includeGlobPatterns = includeGlobPatterns.length ? includeGlobPatterns : ['**'];
    const options: GlobMatchOptions = { root, mode: 'include' };
    if (dot !== undefined) {
        options.dot = dot;
    }
    const globMatcher = new GlobMatcher(includeGlobPatterns, options);

    const filterFiles = (file: string) => globMatcher.match(file);
    const files = readFileListFiles(fileListFiles);
    return pipeAsync(files, opFilter(filterFiles), opFilterAsync(isNotDir));
}
