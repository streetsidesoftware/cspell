import * as glob from 'glob';
import * as minimatch from 'minimatch';
import * as cspell from 'cspell-lib';
import * as fsp from 'fs-extra';
import * as path from 'path';
import * as commentJson from 'comment-json';
import * as util from './util/util';
import { traceWords, TraceResult, CheckTextInfo } from 'cspell-lib';
import * as Validator from 'cspell-lib';
import getStdin = require('get-stdin');
export { TraceResult, IncludeExcludeFlag } from 'cspell-lib';

// cspell:word nocase

const UTF8: BufferEncoding = 'utf8';
const STDIN = 'stdin';


export interface CSpellApplicationOptions extends BaseOptions {
    verbose?: boolean;
    debug?: boolean;
    exclude?: string;
    wordsOnly?: boolean;
    unique?: boolean;
    stdin?: boolean;
}

export interface TraceOptions extends BaseOptions {
}

export interface BaseOptions {
    config?: string;
    languageId?: string;
    local?: string;
}

export interface AppError extends NodeJS.ErrnoException {}

export interface RunResult {
    files: number;
    filesWithIssues: Set<string>;
    issues: number;
}

export interface Issue extends cspell.TextDocumentOffset {}

export interface GlobSrcInfo {
    glob: string;
    regex: RegExp;
    source: string;
}

export type MessageType = 'Debug' | 'Info' | 'Progress';

export type MessageTypeLookup = {
    [key in MessageType]: key;
};

export const MessageTypes: MessageTypeLookup = {
    Debug: 'Debug',
    Info: 'Info',
    Progress: 'Progress',
};

export interface MessageEmitter {
    (message: string, msgType: MessageType): void;
}

export interface DebugEmitter {
    (message: string): void;
}

export interface ErrorEmitter {
    (message: string, error: Error): Promise<void>;
}

export interface SpellingErrorEmitter {
    (issue: Issue): void;
}

export interface Emitters {
    issue: SpellingErrorEmitter;
    info: MessageEmitter;
    debug: DebugEmitter;
    error: ErrorEmitter;
}

const matchBase = { matchBase: true };
const defaultMinimatchOptions: minimatch.IOptions = { nocase: true };

const defaultConfigGlob: string = '{cspell.json,.cspell.json}';
const defaultConfigGlobOptions: minimatch.IOptions = defaultMinimatchOptions;

const nullEmitter = () => {};

export class CSpellApplicationConfiguration {
    readonly info: MessageEmitter;
    readonly debug: DebugEmitter;
    readonly logIssue: SpellingErrorEmitter;
    readonly uniqueFilter: (issue: Issue) => boolean;
    readonly local: string;

    readonly configGlob: string = defaultConfigGlob;
    readonly configGlobOptions: minimatch.IOptions = defaultConfigGlobOptions;
    readonly excludes: GlobSrcInfo[];

    constructor(
        readonly files: string[],
        readonly options: CSpellApplicationOptions,
        readonly emitters: Emitters
    ) {
        this.info              = emitters.info || nullEmitter;
        this.debug             = emitters.debug || ((msg: string) => this.info(msg, MessageTypes.Debug));
        this.configGlob        = options.config || this.configGlob;
        this.configGlobOptions = options.config ? {} : this.configGlobOptions;
        this.excludes          = calcExcludeGlobInfo(options.exclude);
        this.logIssue          = emitters.issue || nullEmitter;
        this.local             = options.local || '';
        this.uniqueFilter      = options.unique
            ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text)
            : () => true;
    }
}

interface ConfigInfo { source: string; config: cspell.CSpellUserSettings; }
interface FileConfigInfo {
    configInfo: ConfigInfo;
    filename: string;
    text: string;
    languageIds: string[];
}

export function lint(
    files: string[],
    options: CSpellApplicationOptions,
    emitters: Emitters
) {
    const cfg = new CSpellApplicationConfiguration(files, options, emitters);
    return runLint(cfg);
}

function runLint(cfg: CSpellApplicationConfiguration) {
    return run();

    async function processFile(fileInfo: FileInfo, configInfo: ConfigInfo): Promise<number> {
        const settingsFromCommandLine = util.clean({
            languageId: cfg.options.languageId || undefined,
            language: cfg.local || undefined,
        });

        const { filename, text } = fileInfo;
        const info = calcFinalConfigInfo(configInfo, settingsFromCommandLine, filename, text);
        const config = info.configInfo.config;
        const source = info.configInfo.source;
        cfg.debug(`Filename: ${filename}, Extension: ${path.extname(filename)}, LanguageIds: ${info.languageIds.toString()}`);

        if (!info.configInfo.config.enabled) return 0;

        const debugCfg = { config: {...config, source: null}, source };
        cfg.debug(commentJson.stringify(debugCfg, undefined, 2));
        const wordOffsets = await cspell.validateText(text, info.configInfo.config);
        const issues = cspell.Text.calculateTextDocumentOffsets(filename, text, wordOffsets);
        const dictionaries = config.dictionaries || [];
        cfg.info(`Checking: ${filename}, File type: ${config.languageId}, Language: ${config.language} ... Issues: ${issues.length}`, MessageTypes.Info);
        cfg.info(`Dictionaries Used: ${dictionaries.join(', ')}`, MessageTypes.Info);
        issues
            .filter(cfg.uniqueFilter)
            .forEach((issue) => cfg.logIssue(issue));
        return issues.length;
    }

    /**
     * The file loader is written this way to cause files to be loaded in parallel while the previous one is being processed.
     * @param fileNames names of files to load one at a time.
     */
    function *fileLoader(fileNames: string[]) {
        for (const filename of fileNames) {
            // console.log(`${Date.now()} Start reading       ${filename}`);
            const file = readFileInfo(filename)
                // .then(f => (console.log(`${Date.now()} Loaded              ${filename} (${f.text.length / 1024}K)`), f))
            ;
            // console.log(`${Date.now()} Waiting for request ${filename}`);
            yield file;
            // console.log(`${Date.now()} Yield               ${filename}`);
        }
    }

    async function processFiles(files: Iterable<Promise<FileInfo>>, configInfo: ConfigInfo): Promise<RunResult> {
        const status: RunResult = {
            files: 0,
            filesWithIssues: new Set<string>(),
            issues: 0,
        };

        for (const fileP of files) {
            const file = await fileP;
            if (!file || !file.text) {
                continue;
            }
            const r = await processFile(file, configInfo);
            status.files += 1;
            if (r) {
                status.filesWithIssues.add(file.filename);
                status.issues += r;
            }
        }

        return status;
    }

    async function run(): Promise<RunResult> {

        header();

        const configFiles = (await globP(cfg.configGlob, cfg.configGlobOptions)).filter(util.uniqueFn());
        cfg.info(`Config Files Found:\n    ${configFiles.join('\n    ')}\n`, MessageTypes.Info);
        const config = cspell.readSettingsFiles(configFiles);
        const configInfo: ConfigInfo = { source: configFiles.join(' || '), config };
        // Get Exclusions from the config files.
        const exclusionGlobs = extractGlobExcludesFromConfig(configInfo.source, configInfo.config);
        const files = filterFiles(await findFiles(cfg.files), exclusionGlobs);

        return processFiles(fileLoader(files), configInfo);
    }

    function header() {
        cfg.info(`
cspell;
Date: ${(new Date()).toUTCString()}
Options:
    verbose:   ${yesNo(!!cfg.options.verbose)}
    config:    ${cfg.configGlob}
    exclude:   ${cfg.excludes.map(a => a.glob).join('\n             ')}
    files:     ${cfg.files}
    wordsOnly: ${yesNo(!!cfg.options.wordsOnly)}
    unique:    ${yesNo(!!cfg.options.unique)}
`, MessageTypes.Info);
    }


    function isExcluded(filename: string, globs: GlobSrcInfo[]) {
        const cwd = process.cwd();
        const relFilename = (filename.slice(0, cwd.length) === cwd) ? filename.slice(cwd.length) : filename;

        for (const glob of globs) {
            if (glob.regex.test(relFilename)) {
                cfg.info(`Excluded File: ${filename}; Excluded by ${glob.glob} from ${glob.source}`, MessageTypes.Info);
                return true;
            }
        }
        return false;
    }

    function filterFiles(files: string[], excludeGlobs: GlobSrcInfo[]): string[] {
        const excludeInfo = excludeGlobs.map(g => `Glob: ${g.glob} from ${g.source}`);
        cfg.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`, MessageTypes.Info);
        const result = files.filter(filename => !isExcluded(filename, excludeGlobs));
        return result;
    }
}


export async function trace(words: string[], options: TraceOptions): Promise<TraceResult[]> {
    const configGlob = options.config || defaultConfigGlob;
    const configGlobOptions = options.config ? {} : defaultConfigGlobOptions;

    const configFiles = (await globP(configGlob, configGlobOptions)).filter(util.uniqueFn());
    const config = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), cspell.readSettingsFiles(configFiles));
    const results = await traceWords(words, config);
    return results;
}

export interface CheckTextResult extends CheckTextInfo {}

export async function checkText(filename: string, options: BaseOptions): Promise<CheckTextResult> {
    const configGlob = options.config || defaultConfigGlob;
    const configGlobOptions = options.config ? {} : defaultConfigGlobOptions;
    const pSettings = globP(configGlob, configGlobOptions).then(filenames => ({source: filenames[0], config: cspell.readSettingsFiles(filenames)}));
    const [foundSettings, text] = await Promise.all([pSettings, readFile(filename)]);
    const settingsFromCommandLine = util.clean({
        languageId: options.languageId || undefined,
        local: options.local || undefined,
    });
    const info = calcFinalConfigInfo(foundSettings, settingsFromCommandLine, filename, text);
    return Validator.checkText(text, info.configInfo.config);
}

export function createInit(_: CSpellApplicationOptions): Promise<void> {
    return Promise.resolve();
}

const defaultExcludeGlobs = [
    'node_modules/**'
];

interface FileInfo {
    filename: string;
    text: string;
}

function readFileInfo(filename: string, encoding: string = UTF8): Promise<FileInfo> {
    const pText = filename === STDIN ? getStdin() : fsp.readFile(filename, encoding);
    return pText.then(
        text => ({text, filename}),
        error => {
            return error.code === 'EISDIR'
                ? Promise.resolve({ text: '', filename })
                : Promise.reject({...error, message: `Error reading file: "${filename}"`});
        });
}

function readFile(filename: string, encoding: string = UTF8): Promise<string> {
    return readFileInfo(filename, encoding).then(info => info.text);
}

/**
 * Looks for matching glob patterns or stdin
 * @param globPatterns patterns or stdin
 */
async function findFiles(globPatterns: string[]): Promise<string[]> {
    const globPats = globPatterns.filter(filename => filename !== STDIN);
    const stdin = globPats.length < globPatterns.length ? [ STDIN ] : [];
    const globs = globPats.length ? (await globP(globPats)) : [];
    return stdin.concat(globs);
}


function calcExcludeGlobInfo(commandLineExclude: string | undefined): GlobSrcInfo[] {
    const excludes = commandLineExclude && commandLineExclude.split(/\s+/g).map(glob => ({glob, source: 'arguments'}))
        || defaultExcludeGlobs.map(glob => ({glob, source: 'default'}));
    return excludes.map(({source, glob}) => ({source, glob, regex: minimatch.makeRe(glob, matchBase)}));
}

function extractGlobExcludesFromConfig(source: string, config: cspell.CSpellUserSettings): GlobSrcInfo[] {
    return (config.ignorePaths || []).map(glob => ({ source, glob, regex: minimatch.makeRe(glob, matchBase)}));
}


function calcFinalConfigInfo(
    configInfo: ConfigInfo,
    settingsFromCommandLine: cspell.CSpellUserSettings,
    filename: string,
    text: string
): FileConfigInfo {
    const ext = path.extname(filename);
    const fileSettings = cspell.calcOverrideSettings(configInfo.config, path.resolve(filename));
    const settings = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), fileSettings, settingsFromCommandLine);
    const languageIds = settings.languageId ? [settings.languageId] : cspell.getLanguagesForExt(ext);
    const config = cspell.constructSettingsForText(settings, text, languageIds);
    return {configInfo: {...configInfo, config}, filename, text, languageIds};
}

function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}

function globP(pattern: string | string[], options?: minimatch.IOptions): Promise<string[]> {
    const globPattern = typeof pattern === 'string'
        ? pattern
        : pattern.length > 1
        ? `{${pattern.join(',')}}`
        : (pattern[0] || '');
    if (!globPattern) {
        return Promise.resolve([]);
    }
    return new Promise<string[]>((resolve, reject) => {
        const cb = (err: Error, matches: string[]) => {
            if (err) {
                reject(err);
            }
            resolve(matches);
        };
        if (options) {
            glob(globPattern, options, cb);
        } else {
            glob(globPattern, cb);
        }
    });
}

