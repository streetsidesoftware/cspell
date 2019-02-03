import { Observable, bindNodeCallback, from, combineLatest } from 'rxjs';
import { map, share, tap, flatMap, filter, catchError, first, toArray, reduce } from 'rxjs/operators';
import * as glob from 'glob';
import * as minimatch from 'minimatch';
import * as cspell from './index';
import * as fsp from 'fs-extra';
import * as path from 'path';
import * as commentJson from 'comment-json';
import * as util from './util/util';
import { traceWords, TraceResult } from './index';
import { CheckTextInfo } from './validator';
import * as Validator from './validator';

// cspell:word nocase

const UTF8: BufferEncoding = 'utf8';

export { TraceResult, IncludeExcludeFlag } from './index';

export interface CSpellApplicationOptions extends BaseOptions {
    verbose?: boolean;
    debug?: boolean;
    exclude?: string;
    wordsOnly?: boolean;
    unique?: boolean;
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

export interface MessageEmitter {
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
    debug: MessageEmitter;
    error: ErrorEmitter;
}

const matchBase = { matchBase: true };
const defaultMinimatchOptions: minimatch.IOptions = { nocase: true };

const defaultConfigGlob: string = '{cspell.json,.cspell.json}';
const defaultConfigGlobOptions: minimatch.IOptions = defaultMinimatchOptions;

export class CSpellApplicationConfiguration {
    readonly info: (message?: any, ...args: any[]) => void;
    readonly debug: (message?: any, ...args: any[]) => void;
    readonly logIssue: (issue: Issue) => void;
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
        this.info              = emitters.info || this.info;
        this.debug             = emitters.debug || this.debug;
        this.configGlob        = options.config || this.configGlob;
        this.configGlobOptions = options.config ? {} : this.configGlobOptions;
        this.excludes          = calcExcludeGlobInfo(options.exclude);
        this.logIssue          = emitters.issue || this.logIssue;
        this.local             = options.local || '';
        this.uniqueFilter      = options.unique
            ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text)
            : () => true;
    }
}

interface ConfigInfo { filename: string; config: cspell.CSpellUserSettings; }
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

    function run(): Promise<RunResult> {

        header();

        const settingsFromCommandLine = util.clean({
            languageId: cfg.options.languageId || undefined,
            language: cfg.local || undefined,
        });

        interface ResultInfo { filename: string; issues: cspell.TextDocumentOffset[]; config: cspell.CSpellUserSettings; }

        const configRx = globRx(cfg.configGlob, cfg.configGlobOptions).pipe(
            map(util.unique),
            tap(configFiles => cfg.info(`Config Files Found:\n    ${configFiles.join('\n    ')}\n`)),
            map((filenames): ConfigInfo => ({filename: filenames.join(' || '), config: cspell.readSettingsFiles(filenames)})),
            share(),
            );

        interface FileInfo {
            filename: string;
            text: string;
        }

        // Get Exclusions from the config files.
        const exclusionGlobs = configRx.pipe(
            map(({filename, config}) => extractGlobExcludesFromConfig(filename, config)),
            flatMap(a => a),
            toArray(),
            map(a => a.concat(cfg.excludes)),
        ).toPromise();



        const filesRx: Observable<FileInfo> = filterFiles(findFiles(cfg.files), exclusionGlobs).pipe(
            flatMap(filename => {
                return fsp.readFile(filename).then(
                    text => ({text: text.toString(), filename}),
                    error => {
                        return error.code === 'EISDIR'
                            ? Promise.resolve(undefined)
                            : Promise.reject({...error, message: `Error reading file: "${filename}"`});
                    });
            }),
            filter(a => !!a),
            map(a => a!),
        );

        const status: RunResult = {
            files: 0,
            filesWithIssues: new Set<string>(),
            issues: 0,
        };

        const r = combineLatest(
                configRx,
                filesRx,
                (configInfo, fileInfo) => ({ configInfo, text: fileInfo.text, filename: fileInfo.filename })
        ).pipe(
            map(({configInfo, filename, text}): FileConfigInfo => {
                const info = calcFinalConfigInfo(configInfo, settingsFromCommandLine, filename, text);
                cfg.debug(`Filename: ${filename}, Extension: ${path.extname(filename)}, LanguageIds: ${info.languageIds.toString()}`);
                return info;
            }),
            filter(info => info.configInfo.config.enabled !== false),
            tap(() => status.files += 1),
            flatMap((info) => {
                const {configInfo, filename, text} = info;
                const debugCfg = { config: {...configInfo.config, source: null}, filename: configInfo.filename };
                cfg.debug(commentJson.stringify(debugCfg, undefined, 2));
                return cspell.validateText(text, configInfo.config)
                    .then(wordOffsets => {
                        return {
                            filename,
                            issues: cspell.Text.calculateTextDocumentOffsets(filename, text, wordOffsets),
                            config: configInfo.config,
                        };
                    });
            }),
            tap(info => {
                const {filename, issues, config} = info;
                const dictionaries = (config.dictionaries || []);
                cfg.info(`Checking: ${filename}, File type: ${config.languageId}, Language: ${config.language} ... Issues: ${issues.length}`);
                cfg.info(`Dictionaries Used: ${dictionaries.join(', ')}`);
                issues
                    .filter(cfg.uniqueFilter)
                    .forEach((issue) => cfg.logIssue(issue));
            }),
            filter(info => !!info.issues.length),
            tap(issue => status.filesWithIssues.add(issue.filename)),
            reduce((status: RunResult, info: ResultInfo) => ({...status, issues: status.issues + info.issues.length}), status),
        ).toPromise();
        return r;
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
`);
    }


    function isExcluded(filename: string, globs: GlobSrcInfo[]) {
        const cwd = process.cwd();
        const relFilename = (filename.slice(0, cwd.length) === cwd) ? filename.slice(cwd.length) : filename;

        for (const glob of globs) {
            if (glob.regex.test(relFilename)) {
                cfg.info(`Excluded File: ${filename}; Excluded by ${glob.glob} from ${glob.source}`);
                return true;
            }
        }
        return false;
    }

    function filterFiles(files: Observable < string >, excludeGlobs: Promise<GlobSrcInfo[]>): Observable < string > {

        excludeGlobs.then(excludeGlobs => {
            const excludeInfo = excludeGlobs.map(g => `Glob: ${g.glob} from ${g.source}`);
            cfg.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`);
        });
        return combineLatest(
            files,
            excludeGlobs,
            (filename, globs) => ({ filename, globs })
        ).pipe(
            filter(({ filename, globs }) => !isExcluded(filename, globs)),
            map(({ filename }) => filename),
        );
    }
}


export async function trace(words: string[], options: TraceOptions): Promise<TraceResult[]> {
    const configGlob = options.config || defaultConfigGlob;
    const configGlobOptions = options.config ? {} : defaultConfigGlobOptions;

    const results = await globRx(configGlob, configGlobOptions).pipe(
        map(util.unique),
        map(filenames => ({filename: filenames.join(' || '), config: cspell.readSettingsFiles(filenames)})),
        map(({filename, config}) => ({filename, config: cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), config)})),
        flatMap(config => traceWords(words, config.config)),
        toArray(),
    ).toPromise();

    return results;
}

export interface CheckTextResult extends CheckTextInfo {}

export async function checkText(filename: string, options: BaseOptions): Promise<CheckTextResult> {
    const configGlob = options.config || defaultConfigGlob;
    const configGlobOptions = options.config ? {} : defaultConfigGlobOptions;
    const pSettings = globRx(configGlob, configGlobOptions).pipe(
        first(),
        map(util.unique),
        map(filenames => ({filename: filenames[0], config: cspell.readSettingsFiles(filenames)})),
    ).toPromise();
    const pBuffer = fsp.readFile(filename);
    const [foundSettings, buffer] = await Promise.all([pSettings, pBuffer]);

    const text = buffer.toString(UTF8);
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

function findFiles(globPatterns: string[]): Observable<string> {
    const processed = new Set<string>();

    return from(globPatterns).pipe(
        flatMap(pattern => globRx(pattern)
            .pipe(catchError((error: AppError) => {
                return new Promise<string[]>((resolve) => resolve(Promise.reject({...error, message: 'Error with glob search.'})));
            }))
        ),
        flatMap(a => a),
        filter(filename => !processed.has(filename)),
        tap(filename => processed.add(filename)),
    );
}


function calcExcludeGlobInfo(commandLineExclude: string | undefined): GlobSrcInfo[] {
    const excludes = commandLineExclude && commandLineExclude.split(/\s+/g).map(glob => ({glob, source: 'arguments'}))
        || defaultExcludeGlobs.map(glob => ({glob, source: 'default'}));
    return excludes.map(({source, glob}) => ({source, glob, regex: minimatch.makeRe(glob, matchBase)}));
}

function extractGlobExcludesFromConfig(filename: string, config: cspell.CSpellUserSettings): GlobSrcInfo[] {
    return (config.ignorePaths || []).map(glob => ({ source: filename, glob, regex: minimatch.makeRe(glob, matchBase)}));
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

type GlobRx = (filename: string, options?: minimatch.IOptions) => Observable<string[]>;


function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}

const globRx: GlobRx = bindNodeCallback<string, string[]>(glob);
