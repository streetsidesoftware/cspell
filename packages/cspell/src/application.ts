import glob from 'glob';
import * as cspell from 'cspell-lib';
import * as fsp from 'fs-extra';
import * as path from 'path';
import * as commentJson from 'comment-json';
import * as util from './util/util';
import { traceWords, TraceResult, CheckTextInfo } from 'cspell-lib';
import getStdin from 'get-stdin';
export { TraceResult, IncludeExcludeFlag } from 'cspell-lib';
import { GlobMatcher } from 'cspell-glob';
import { IOptions } from './IOptions';
import { measurePromiseExecution } from './util/timer';
import {
    DebugEmitter,
    Emitters,
    MessageEmitter,
    MessageTypes,
    ProgressEmitter,
    SpellingErrorEmitter,
} from './emitters';

// cspell:word nocase

const UTF8: BufferEncoding = 'utf8';
const STDIN = 'stdin';

export interface CSpellApplicationOptions extends BaseOptions {
    /**
     * Display verbose information
     */
    verbose?: boolean;
    /**
     * Show extensive output.
     */
    debug?: boolean;
    /**
     * a glob to exclude files from being checked.
     */
    exclude?: string;
    /**
     * Only report the words, no line numbers or file names.
     */
    wordsOnly?: boolean;
    /**
     * unique errors per file only.
     */
    unique?: boolean;
    /**
     * root directory, defaults to `cwd`
     */
    root?: string;
}

export type TraceOptions = BaseOptions;

export interface BaseOptions {
    config?: string;
    languageId?: string;
    local?: string;
}

export type AppError = NodeJS.ErrnoException;

export interface RunResult {
    files: number;
    filesWithIssues: Set<string>;
    issues: number;
    errors: number;
}

export type Issue = cspell.TextDocumentOffset;

export interface GlobSrcInfo {
    matcher: GlobMatcher;
    source: string;
}

interface GlobOptions extends IOptions {
    cwd?: string;
    root?: string;
}

const defaultMinimatchOptions: IOptions = { nocase: true };
const defaultConfigGlob = '{cspell.json,.cspell.json}';
const defaultConfigGlobOptions: IOptions = defaultMinimatchOptions;

const nullEmitter = () => {
    /* empty */
};

export class CSpellApplicationConfiguration {
    readonly info: MessageEmitter;
    readonly progress: ProgressEmitter;
    readonly debug: DebugEmitter;
    readonly logIssue: SpellingErrorEmitter;
    readonly uniqueFilter: (issue: Issue) => boolean;
    readonly local: string;

    readonly configFile: string | undefined;
    readonly configGlob: string = defaultConfigGlob;
    readonly configGlobOptions: IOptions = defaultConfigGlobOptions;
    readonly excludes: GlobSrcInfo[];
    readonly root: string;

    constructor(readonly files: string[], readonly options: CSpellApplicationOptions, readonly emitters: Emitters) {
        this.root = path.resolve(options.root || process.cwd());
        this.info = emitters.info || nullEmitter;
        this.debug = emitters.debug || ((msg: string) => this.info(msg, MessageTypes.Debug));
        this.configFile = options.config;
        this.excludes = calcExcludeGlobInfo(this.root, options.exclude);
        this.logIssue = emitters.issue || nullEmitter;
        this.local = options.local || '';
        this.uniqueFilter = options.unique ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text) : () => true;
        this.progress = emitters.progress || nullEmitter;
    }
}

interface ConfigInfo {
    source: string;
    config: cspell.CSpellUserSettings;
}
interface FileConfigInfo {
    configInfo: ConfigInfo;
    filename: string;
    text: string;
    languageIds: string[];
}

interface FileResult {
    fileInfo: FileInfo;
    processed: boolean;
    issues: cspell.TextDocumentOffset[];
    errors: number;
    configErrors: number;
    elapsedTimeMs: number;
}

export function lint(files: string[], options: CSpellApplicationOptions, emitters: Emitters): Promise<RunResult> {
    const cfg = new CSpellApplicationConfiguration(files, options, emitters);
    return runLint(cfg);
}

function runLint(cfg: CSpellApplicationConfiguration) {
    const configErrors = new Set<string>();

    return run();

    async function processFile(fileInfo: FileInfo, configInfo: ConfigInfo): Promise<FileResult> {
        const settingsFromCommandLine = util.clean({
            languageId: cfg.options.languageId || undefined,
            language: cfg.local || undefined,
        });

        const result: FileResult = {
            fileInfo,
            issues: [],
            processed: false,
            errors: 0,
            configErrors: 0,
            elapsedTimeMs: 0,
        };

        const { filename, text } = fileInfo;
        const info = calcFinalConfigInfo(configInfo, settingsFromCommandLine, filename, text);
        const config = info.configInfo.config;
        const source = info.configInfo.source;
        cfg.debug(
            `Filename: ${filename}, Extension: ${path.extname(filename)}, LanguageIds: ${info.languageIds.toString()}`
        );

        if (!info.configInfo.config.enabled) return result;
        result.configErrors += reportConfigurationErrors(info.configInfo.config);

        const debugCfg = { config: { ...config, source: null }, source };
        cfg.debug(commentJson.stringify(debugCfg, undefined, 2));
        const startTime = Date.now();
        try {
            const wordOffsets = await cspell.validateText(text, info.configInfo.config);
            result.processed = true;
            result.issues = cspell.Text.calculateTextDocumentOffsets(filename, text, wordOffsets);
        } catch (e) {
            cfg.emitters.error(`Failed to process "${filename}"`, e);
            result.errors += 1;
        }
        result.elapsedTimeMs = Date.now() - startTime;
        const elapsed = result.elapsedTimeMs / 1000.0;
        const dictionaries = config.dictionaries || [];
        cfg.info(
            `Checking: ${filename}, File type: ${config.languageId}, Language: ${config.language} ... Issues: ${result.issues.length} ${elapsed}S`,
            MessageTypes.Info
        );
        cfg.info(`Dictionaries Used: ${dictionaries.join(', ')}`, MessageTypes.Info);
        result.issues.filter(cfg.uniqueFilter).forEach((issue) => cfg.logIssue(issue));
        return result;
    }

    /**
     * The file loader is written this way to cause files to be loaded in parallel while the previous one is being processed.
     * @param fileNames names of files to load one at a time.
     */
    function* fileLoader(fileNames: string[]) {
        for (const filename of fileNames) {
            const file = readFileInfo(filename);
            yield file;
        }
    }

    async function processFiles(
        files: Iterable<Promise<FileInfo>>,
        configInfo: ConfigInfo,
        fileCount: number
    ): Promise<RunResult> {
        const status: RunResult = runResult();
        let n = 0;
        for (const fileP of files) {
            ++n;
            const file = await fileP;
            if (!file || !file.text) {
                continue;
            }
            const { r, elapsedTimeMs } = await measurePromiseExecution(() => processFile(file, configInfo));
            cfg.progress({
                type: 'ProgressFileComplete',
                fileNum: n,
                fileCount,
                filename: file.filename,
                elapsedTimeMs,
            });
            status.files += 1;
            if (r.issues.length || r.errors) {
                status.filesWithIssues.add(file.filename);
                status.issues += r.issues.length;
                status.errors += r.errors;
            }
            status.errors += r.configErrors;
        }

        return status;
    }

    function reportConfigurationErrors(config: cspell.CSpellSettings): number {
        const errors = cspell.extractImportErrors(config);
        let count = 0;
        errors.forEach((ref) => {
            const key = ref.error.toString();
            if (configErrors.has(key)) return;
            configErrors.add(key);
            count += 1;
            cfg.emitters.error('Configuration', ref.error);
        });
        return count;
    }

    async function readConfig(): Promise<ConfigInfo> {
        if (cfg.configFile) {
            const config = cspell.readSettings(cfg.configFile);
            return { source: cfg.configFile, config };
        }
        const configFiles = (await globP(cfg.configGlob, cfg.configGlobOptions)).filter(util.uniqueFn());
        cfg.info(`Config Files Found:\n    ${configFiles.join('\n    ')}\n`, MessageTypes.Info);
        const config = cspell.readSettingsFiles(configFiles);
        return { source: configFiles.join(' || '), config };
    }

    function countConfigErrors(configInfo: ConfigInfo): number {
        return reportConfigurationErrors(configInfo.config);
    }

    async function run(): Promise<RunResult> {
        header();

        const configInfo: ConfigInfo = await readConfig();

        const configErrors = countConfigErrors(configInfo);
        if (configErrors) return runResult({ errors: configErrors });

        // Get Exclusions from the config files.
        const { root } = cfg;
        const globOptions = { root, cwd: root };
        const exclusionGlobs = extractGlobExcludesFromConfig(root, configInfo.source, configInfo.config).concat(
            cfg.excludes
        );
        const files = filterFiles(await findFiles(cfg.files, globOptions), exclusionGlobs);

        return processFiles(fileLoader(files), configInfo, files.length);
    }

    function header() {
        cfg.info(
            `
cspell;
Date: ${new Date().toUTCString()}
Options:
    verbose:   ${yesNo(!!cfg.options.verbose)}
    config:    ${cfg.configGlob}
    exclude:   ${extractPatterns(cfg.excludes)
        .map((a) => a.glob)
        .join('\n             ')}
    files:     ${cfg.files}
    wordsOnly: ${yesNo(!!cfg.options.wordsOnly)}
    unique:    ${yesNo(!!cfg.options.unique)}
`,
            MessageTypes.Info
        );
    }

    function isExcluded(filename: string, globs: GlobSrcInfo[]) {
        const { root } = cfg;
        const absFilename = path.resolve(root, filename);
        for (const glob of globs) {
            const m = glob.matcher.matchEx(absFilename);
            if (m.matched) {
                cfg.info(
                    `Excluded File: ${path.relative(root, absFilename)}; Excluded by ${m.glob} from ${glob.source}`,
                    MessageTypes.Info
                );
                return true;
            }
        }
        return false;
    }

    function filterFiles(files: string[], excludeGlobs: GlobSrcInfo[]): string[] {
        const excludeInfo = extractPatterns(excludeGlobs).map((g) => `Glob: ${g.glob} from ${g.source}`);
        cfg.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`, MessageTypes.Info);
        const result = files.filter((filename) => !isExcluded(filename, excludeGlobs));
        return result;
    }
}

function runResult(init: Partial<RunResult> = {}): RunResult {
    const { files = 0, filesWithIssues = new Set<string>(), issues = 0, errors = 0 } = init;
    return { files, filesWithIssues, issues, errors };
}

interface ExtractPatternResult {
    glob: string;
    source: string;
}
function extractPatterns(globs: GlobSrcInfo[]): ExtractPatternResult[] {
    const r = globs.reduce((info: ExtractPatternResult[], g: GlobSrcInfo) => {
        const source = g.source;
        const patterns = typeof g.matcher.patterns === 'string' ? [g.matcher.patterns] : g.matcher.patterns;
        return info.concat(patterns.map((glob) => ({ glob, source })));
    }, []);

    return r;
}

export async function trace(words: string[], options: TraceOptions): Promise<TraceResult[]> {
    const configGlob = options.config || defaultConfigGlob;
    const configGlobOptions = options.config ? {} : defaultConfigGlobOptions;

    const configFiles = (await globP(configGlob, configGlobOptions)).filter(util.uniqueFn());
    const config = cspell.mergeSettings(
        cspell.getDefaultSettings(),
        cspell.getGlobalSettings(),
        cspell.readSettingsFiles(configFiles)
    );
    const results = await traceWords(words, config);
    return results;
}

export type CheckTextResult = CheckTextInfo;

export async function checkText(filename: string, options: BaseOptions): Promise<CheckTextResult> {
    const configGlob = options.config || defaultConfigGlob;
    const configGlobOptions = options.config ? {} : defaultConfigGlobOptions;
    const pSettings = globP(configGlob, configGlobOptions).then((filenames) => ({
        source: filenames[0],
        config: cspell.readSettingsFiles(filenames),
    }));
    const [foundSettings, text] = await Promise.all([pSettings, readFile(filename)]);
    const settingsFromCommandLine = util.clean({
        languageId: options.languageId || undefined,
        local: options.local || undefined,
    });
    const info = calcFinalConfigInfo(foundSettings, settingsFromCommandLine, filename, text);
    return cspell.checkText(text, info.configInfo.config);
}

export function createInit(): Promise<void> {
    return Promise.reject();
}

const defaultExcludeGlobs = ['node_modules/**'];

interface FileInfo {
    filename: string;
    text: string;
}

function readFileInfo(filename: string, encoding: string = UTF8): Promise<FileInfo> {
    const pText = filename === STDIN ? getStdin() : fsp.readFile(filename, encoding);
    return pText.then(
        (text) => ({ text, filename }),
        (error) => {
            return error.code === 'EISDIR'
                ? Promise.resolve({ text: '', filename })
                : Promise.reject({
                      ...error,
                      message: `Error reading file: "${filename}"`,
                  });
        }
    );
}

function readFile(filename: string, encoding: string = UTF8): Promise<string> {
    return readFileInfo(filename, encoding).then((info) => info.text);
}

/**
 * Looks for matching glob patterns or stdin
 * @param globPatterns patterns or stdin
 */
async function findFiles(globPatterns: string[], options: GlobOptions): Promise<string[]> {
    const globPats = globPatterns.filter((filename) => filename !== STDIN);
    const stdin = globPats.length < globPatterns.length ? [STDIN] : [];
    const globResults = globPats.length ? await globP(globPats, options) : [];
    const cwd = options.cwd || process.cwd();
    return stdin.concat(globResults.map((filename) => path.resolve(cwd, filename)));
}

function calcExcludeGlobInfo(root: string, commandLineExclude: string | undefined): GlobSrcInfo[] {
    const commandLineExcludes = {
        globs: commandLineExclude ? commandLineExclude.split(/\s+/g) : [],
        source: 'arguments',
    };
    const defaultExcludes = {
        globs: defaultExcludeGlobs,
        source: 'default',
    };

    const choice = commandLineExcludes.globs.length ? commandLineExcludes : defaultExcludes;
    const matcher = new GlobMatcher(choice.globs, root);
    return [
        {
            matcher,
            source: choice.source,
        },
    ];
}

function extractGlobExcludesFromConfig(root: string, source: string, config: cspell.CSpellUserSettings): GlobSrcInfo[] {
    if (!config.ignorePaths || !config.ignorePaths.length) {
        return [];
    }
    const matcher = new GlobMatcher(config.ignorePaths, root);
    return [{ source, matcher }];
}

function calcFinalConfigInfo(
    configInfo: ConfigInfo,
    settingsFromCommandLine: cspell.CSpellUserSettings,
    filename: string,
    text: string
): FileConfigInfo {
    const ext = path.extname(filename);
    const fileSettings = cspell.calcOverrideSettings(configInfo.config, path.resolve(filename));
    const settings = cspell.mergeSettings(
        cspell.getDefaultSettings(),
        cspell.getGlobalSettings(),
        fileSettings,
        settingsFromCommandLine
    );
    const languageIds = settings.languageId ? [settings.languageId] : cspell.getLanguagesForExt(ext);
    const config = cspell.constructSettingsForText(settings, text, languageIds);
    return {
        configInfo: { ...configInfo, config },
        filename,
        text,
        languageIds,
    };
}

function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}

interface PatternRoot {
    pattern: string;
    root: string;
}

function findBaseDir(pat: string) {
    const globChars = /[*@()?|[\]{},]/;
    while (globChars.test(pat)) {
        pat = path.dirname(pat);
    }
    return pat;
}

function exists(filename: string): boolean {
    try {
        fsp.accessSync(filename);
    } catch (e) {
        return false;
    }

    return true;
}

/**
 * Attempt to normalize a pattern based upon the root.
 * If the pattern is absolute, check to see if it exists and adjust the root, otherwise it is assumed to be based upon the current root.
 * If the pattern starts with a relative path, adjust the root to match.
 * The challenge is with the patterns that begin with `/`. Is is an absolute path or relative pattern?
 * @param pat glob pattern
 * @param root absolute path | empty
 * @returns the adjusted root and pattern.
 */
function normalizePattern(pat: string, root: string): PatternRoot {
    // Absolute pattern
    if (path.isAbsolute(pat)) {
        const dir = findBaseDir(pat);
        if (dir.length > 1 && exists(dir)) {
            // Assume it is an absolute path
            return {
                pattern: pat,
                root: path.sep,
            };
        }
    }
    // normal pattern
    if (!/^\.\./.test(pat)) {
        return {
            pattern: pat,
            root,
        };
    }
    // relative pattern
    pat = path.sep === '\\' ? pat.replace(/\\/g, '/') : pat;
    const patParts = pat.split('/');
    const rootParts = root.split(path.sep);
    let i = 0;
    for (; i < patParts.length && patParts[i] === '..'; ++i) {
        rootParts.pop();
    }
    return {
        pattern: patParts.slice(i).join('/'),
        root: rootParts.join(path.sep),
    };
}

async function globP(pattern: string | string[], options?: GlobOptions): Promise<string[]> {
    const root = options?.root || process.cwd();
    const opts = options || {};
    const rawPatterns = typeof pattern === 'string' ? [pattern] : pattern;
    const normPatterns = rawPatterns.map((pat) => normalizePattern(pat, root));
    const globResults = normPatterns.map(async (pat) => {
        const opt: GlobOptions = { ...opts, root: pat.root, cwd: pat.root };
        const absolutePaths = (await _globP(pat.pattern, opt)).map((filename) => path.resolve(pat.root, filename));
        const relativeToRoot = absolutePaths.map((absFilename) => path.relative(root, absFilename));
        return relativeToRoot;
    });
    const results = (await Promise.all(globResults)).reduce((prev, next) => prev.concat(next), []);
    return results;
}

function _globP(pattern: string, options: GlobOptions): Promise<string[]> {
    if (!pattern) {
        return Promise.resolve([]);
    }
    return new Promise<string[]>((resolve, reject) => {
        const cb = (err: Error, matches: string[]) => {
            if (err) {
                reject(err);
            }
            resolve(matches);
        };
        glob(pattern, options, cb);
    });
}

export const _testing_ = {
    _globP,
    findFiles,
    normalizePattern,
};
