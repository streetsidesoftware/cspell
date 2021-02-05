import {
    globP,
    GlobOptions,
    GlobSrcInfo,
    calcExcludeGlobInfo,
    extractGlobExcludesFromConfig,
    extractPatterns,
} from './util/glob';
import * as cspell from 'cspell-lib';
import * as fsp from 'fs-extra';
import * as path from 'path';
import * as commentJson from 'comment-json';
import * as util from './util/util';
import { traceWords, TraceResult, CheckTextInfo, getDictionary } from 'cspell-lib';
import getStdin from 'get-stdin';
export { TraceResult, IncludeExcludeFlag } from 'cspell-lib';
import { IOptions } from './util/IOptions';
import { measurePromise } from './util/timer';
import {
    DebugEmitter,
    Emitters,
    MessageEmitter,
    MessageTypes,
    ProgressEmitter,
    SpellingErrorEmitter,
    Issue,
} from './emitters';

// cspell:word nocase

const UTF8: BufferEncoding = 'utf8';
const STDIN = 'stdin';
const defaultContextRange = 20;
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
     * a globs to exclude files from being checked.
     */
    exclude?: string[] | string;
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
    /**
     * Show part of a line where an issue is found.
     * if true, it will show the default number of characters on either side.
     * if a number, it will shat number of characters on either side.
     */
    showContext?: boolean | number;
    /**
     * Show suggestions for spelling errors.
     */
    showSuggestions?: boolean;
}

export type TraceOptions = BaseOptions;

export interface BaseOptions {
    config?: string;
    languageId?: string;
    locale?: string;
    local?: string; // deprecated
}

export type AppError = NodeJS.ErrnoException;

export interface RunResult {
    files: number;
    filesWithIssues: Set<string>;
    issues: number;
    errors: number;
}

const defaultMinimatchOptions: IOptions = { nocase: true };
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
    readonly locale: string;

    readonly configFile: string | undefined;
    readonly configGlobOptions: IOptions = defaultConfigGlobOptions;
    readonly excludes: GlobSrcInfo[];
    readonly root: string;
    readonly showContext: number;

    constructor(readonly files: string[], readonly options: CSpellApplicationOptions, readonly emitters: Emitters) {
        this.root = path.resolve(options.root || process.cwd());
        this.info = emitters.info || nullEmitter;
        this.debug = emitters.debug || ((msg: string) => this.info(msg, MessageTypes.Debug));
        this.configFile = options.config;
        this.excludes = calcExcludeGlobInfo(this.root, options.exclude);
        this.logIssue = emitters.issue || nullEmitter;
        this.locale = options.locale || options.local || '';
        this.uniqueFilter = options.unique ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text) : () => true;
        this.progress = emitters.progress || nullEmitter;
        this.showContext =
            options.showContext === true ? defaultContextRange : options.showContext ? options.showContext : 0;
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
    issues: Issue[];
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
            language: cfg.locale || undefined,
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
        result.configErrors += await reportConfigurationErrors(info.configInfo.config);

        const debugCfg = { config: { ...config, source: null }, source };
        cfg.debug(commentJson.stringify(debugCfg, undefined, 2));
        const startTime = Date.now();
        try {
            const validateOptions = { generateSuggestions: cfg.options.showSuggestions, numSuggestions: 5 };
            const wordOffsets = await cspell.validateText(text, info.configInfo.config, validateOptions);
            result.processed = true;
            result.issues = cspell.Text.calculateTextDocumentOffsets(filename, text, wordOffsets).map(mapIssue);
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

    function mapIssue(tdo: cspell.TextDocumentOffset): Issue {
        const context = cfg.showContext
            ? extractContext(tdo, cfg.showContext)
            : { text: tdo.line.text.trimEnd(), offset: tdo.line.offset };
        return { ...tdo, context };
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
            const emitProgress = (elapsedTimeMs?: number) =>
                cfg.progress({
                    type: 'ProgressFileComplete',
                    fileNum: n,
                    fileCount,
                    filename: file.filename,
                    elapsedTimeMs,
                });
            if (!file.text) {
                emitProgress();
                continue;
            }
            const p = processFile(file, configInfo);
            const { elapsedTimeMs } = await measurePromise(p);
            emitProgress(elapsedTimeMs);
            const r = await p;
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

    async function reportConfigurationErrors(config: cspell.CSpellSettings): Promise<number> {
        const errors = cspell.extractImportErrors(config);
        let count = 0;
        errors.forEach((ref) => {
            const key = ref.error.toString();
            if (configErrors.has(key)) return;
            configErrors.add(key);
            count += 1;
            cfg.emitters.error('Configuration', ref.error);
        });

        const dictCollection = await getDictionary(config);
        dictCollection.dictionaries.forEach((dict) => {
            const dictErrors = dict.getErrors?.() || [];
            const msg = `Dictionary Error with (${dict.name})`;
            dictErrors.forEach((error) => {
                const key = msg + error.toString();
                if (configErrors.has(key)) return;
                configErrors.add(key);
                count += 1;
                cfg.emitters.error(msg, error);
            });
        });

        return count;
    }

    function countConfigErrors(configInfo: ConfigInfo): Promise<number> {
        return reportConfigurationErrors(configInfo.config);
    }

    async function run(): Promise<RunResult> {
        header();

        const configInfo: ConfigInfo = await readConfig(cfg.configFile);
        cfg.info(`Config Files Found:\n    ${configInfo.source}\n`, MessageTypes.Info);

        const configErrors = await countConfigErrors(configInfo);
        if (configErrors) return runResult({ errors: configErrors });

        // Get Exclusions from the config files.
        const { root } = cfg;
        const globOptions = { root, cwd: root, ignore: configInfo.config.ignorePaths };
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
    config:    ${cfg.configFile || 'default'}
    exclude:   ${extractPatterns(cfg.excludes)
        .map((a) => a.glob.glob)
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
        const excludeInfo = extractPatterns(excludeGlobs).map((g) => `Glob: ${g.glob.glob} from ${g.source}`);
        cfg.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`, MessageTypes.Info);
        const result = files.filter(util.uniqueFn()).filter((filename) => !isExcluded(filename, excludeGlobs));
        return result;
    }
}

async function readConfig(configFile: string | undefined): Promise<ConfigInfo> {
    if (configFile) {
        const config = (await cspell.loadConfig(configFile)) || {};
        return { source: configFile, config };
    }
    const config = await cspell.searchForConfig();
    return { source: config?.__importRef?.filename || 'not found', config: config || {} };
}

function runResult(init: Partial<RunResult> = {}): RunResult {
    const { files = 0, filesWithIssues = new Set<string>(), issues = 0, errors = 0 } = init;
    return { files, filesWithIssues, issues, errors };
}

export async function trace(words: string[], options: TraceOptions): Promise<TraceResult[]> {
    const configFile = await readConfig(options.config);
    const config = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), configFile.config);
    const results = await traceWords(words, config);
    return results;
}

export type CheckTextResult = CheckTextInfo;

export async function checkText(filename: string, options: BaseOptions): Promise<CheckTextResult> {
    const pSettings = readConfig(options.config);
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

function extractContext(tdo: cspell.TextDocumentOffset, contextRange: number): cspell.TextOffset {
    const { line, offset } = tdo;
    const textOffsetInLine = offset - line.offset;
    let left = Math.max(textOffsetInLine - contextRange, 0);
    let right = Math.min(line.text.length, textOffsetInLine + contextRange + tdo.text.length);
    const lineText = line.text;

    const isLetter = /^[a-z]$/i;
    const isSpace = /^\s$/;

    for (let n = contextRange / 2; n > 0 && left > 0 && isLetter.test(lineText[left - 1]); n--, left--) {
        /* do nothing */
    }

    for (let n = contextRange / 2; n > 0 && right < lineText.length && isLetter.test(lineText[right]); n--, right++) {
        /* do nothing */
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

function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}

export const _testing_ = {
    findFiles,
};
