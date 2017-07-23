import * as Rx from 'rxjs/Rx';
import * as glob from 'glob';
import * as minimatch from 'minimatch';
import * as cspell from './index';
import * as fsp from 'fs-extra';
import * as path from 'path';
import * as commentJson from 'comment-json';
import * as util from './util/util';

// cspell:word nocase

export interface CSpellApplicationOptions {
    verbose?: boolean;
    debug?: boolean;
    config?: string;
    exclude?: string;
    wordsOnly?: boolean;
    unique?: boolean;
    local?: string;
}

export interface TraceOptions {
    config?: string;
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

export class CSpellApplicationConfiguration {
    readonly info: (message?: any, ...args: any[]) => void;
    readonly debug: (message?: any, ...args: any[]) => void;
    readonly logIssue: (issue: Issue) => void;
    readonly uniqueFilter: (issue: Issue) => boolean;
    readonly local: string;

    readonly configGlob: string = '{cspell.json,.cspell.json}';
    readonly configGlobOptions: minimatch.IOptions = defaultMinimatchOptions;
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

        const configRx = globRx(cfg.configGlob, cfg.configGlobOptions)
            .map(util.unique)
            .do(configFiles => cfg.info(`Config Files Found:\n    ${configFiles.join('\n    ')}\n`))
            .map(filenames => ({filename: filenames.join(' || '), config: cspell.readSettingsFiles(filenames)}))
            .map(config => {
                if (cfg.local) {
                    config.config.language = cfg.local;
                }
                return config;
            })
            .share()
            ;

        interface FileInfo {
            filename: string;
            text: string;
        }

        // Get Exclusions from the config files.
        const exclusionGlobs = configRx
            .map(({filename, config}) => extractGlobExcludesFromConfig(filename, config))
            .flatMap(a => a)
            .toArray()
            .map(a => a.concat(cfg.excludes))
            .toPromise();



        const filesRx: Rx.Observable<FileInfo> = filterFiles(findFiles(cfg.files), exclusionGlobs)
            .flatMap(filename => {
                return fsp.readFile(filename).then(
                    text => ({text: text.toString(), filename}),
                    error => {
                        return error.code === 'EISDIR'
                            ? Promise.resolve()
                            : Promise.reject({...error, message: `Error reading file: "${filename}"`});
                    });
            })
            .filter(a => !!a)
            .map(a => a!);

        const status: RunResult = {
            files: 0,
            filesWithIssues: new Set<string>(),
            issues: 0,
        };

        const r = Rx.Observable.combineLatest(
                configRx,
                filesRx,
                (configInfo, fileInfo) => ({ configInfo, text: fileInfo.text, filename: fileInfo.filename })
            )
            .map(({configInfo, filename, text}) => {
                const ext = path.extname(filename);
                const fileSettings = cspell.calcOverrideSettings(configInfo.config, path.resolve(filename));
                const settings = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), fileSettings);
                const languageIds = settings.languageId ? [settings.languageId] : cspell.getLanguagesForExt(ext);
                const config = cspell.constructSettingsForText(settings, text, languageIds);
                cfg.debug(`Filename: ${filename}, Extension: ${ext}, LanguageIds: ${languageIds.toString()}`);
                return {configInfo: {...configInfo, config}, filename, text};
            })
            .filter(info => info.configInfo.config.enabled !== false)
            .do(() => status.files += 1)
            .flatMap(({configInfo, filename, text}) => {
                cfg.debug(commentJson.stringify(configInfo, undefined, 2));
                return cspell.validateText(text, configInfo.config)
                    .then(wordOffsets => {
                        return {
                            filename,
                            issues: cspell.Text.calculateTextDocumentOffsets(filename, text, wordOffsets)
                        };
                    });
            })
            .do(info => {
                const {filename, issues} = info;
                cfg.info(`Checking: ${filename} ... Issues: ${issues.length}`);
                issues
                    .filter(cfg.uniqueFilter)
                    .forEach((issue) => cfg.logIssue(issue));
            })
            .filter(info => !!info.issues.length)
            .do(issue => status.filesWithIssues.add(issue.filename))
            .reduce((status, info) => ({...status, issues: status.issues + info.issues.length}), status)
            .toPromise();
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

    function filterFiles(files: Rx.Observable < string >, excludeGlobs: Promise<GlobSrcInfo[]>): Rx.Observable < string > {

        excludeGlobs.then(excludeGlobs => {
            const excludeInfo = excludeGlobs.map(g => `Glob: ${g.glob} from ${g.source}`);
            cfg.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`);
        });
        return Rx.Observable.combineLatest(
            files,
            excludeGlobs,
            (filename, globs) => ({ filename, globs })
        )
            .filter(({ filename, globs }) => !isExcluded(filename, globs))
            .map(({ filename }) => filename);
    }
}


export function trace(_words: string[], _options: TraceOptions): Promise<void> {
    return Promise.resolve();
}

export function createInit(_: CSpellApplicationOptions): Promise<void> {
    return Promise.resolve();
}

const defaultExcludeGlobs = [
    'node_modules/**'
];

function findFiles(globPatterns: string[]): Rx.Observable<string> {
    const processed = new Set<string>();

    return Rx.Observable.from(globPatterns)
        .flatMap(pattern => globRx(pattern)
            .catch((error: AppError) => {
                return new Promise<string[]>((resolve) => resolve(Promise.reject({...error, message: 'Error with glob search.'})));
        }))
        .flatMap(a => a)
        .filter(filename => !processed.has(filename))
        .do(filename => processed.add(filename));
}


function calcExcludeGlobInfo(commandLineExclude: string | undefined): GlobSrcInfo[] {
    const excludes = commandLineExclude && commandLineExclude.split(/\s+/g).map(glob => ({glob, source: 'arguments'}))
        || defaultExcludeGlobs.map(glob => ({glob, source: 'default'}));
    return excludes.map(({source, glob}) => ({source, glob, regex: minimatch.makeRe(glob, matchBase)}));
}

function extractGlobExcludesFromConfig(filename: string, config: cspell.CSpellUserSettings): GlobSrcInfo[] {
    return (config.ignorePaths || []).map(glob => ({ source: filename, glob, regex: minimatch.makeRe(glob, matchBase)}));
}


type GlobRx = (filename: string, options?: minimatch.IOptions) => Rx.Observable<string[]>;


function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}

const globRx: GlobRx = Rx.Observable.bindNodeCallback<string, string[]>(glob);
