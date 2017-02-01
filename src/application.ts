import * as Rx from 'rxjs/Rx';
import * as glob from 'glob';
import * as minimatch from 'minimatch';
import * as cspell from './index';
import * as fsp from 'fs-promise';
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
}

export interface AppError extends NodeJS.ErrnoException {};

export interface RunResult {
    files: number;
    filesWithIssues: Set<string>;
    issues: number;
}

export interface Issue extends cspell.TextDocumentOffset {};

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

export class CSpellApplication {

    readonly info: (message?: any, ...args: any[]) => void;
    readonly debug: (message?: any, ...args: any[]) => void;
    readonly logIssue: (issue: Issue) => void;
    readonly uniqueFilter: (issue: Issue) => boolean;
    private configGlob = '{cspell.json,.cspell.json}';
    private configGlobOptions: minimatch.IOptions = { nocase: true };
    private static defaultExcludeGlobs = [
        'node_modules/**'
    ];
    private excludes: GlobSrcInfo[];

    constructor(
        readonly files: string[],
        readonly options: CSpellApplicationOptions,
        readonly emitters: Emitters
    ) {
        this.info              = emitters.info;
        this.debug             = emitters.debug;
        this.configGlob        = options.config || this.configGlob;
        this.configGlobOptions = options.config ? {} : this.configGlobOptions;
        this.excludes          = this.calcExcludeGlobInfo(options.exclude);
        this.logIssue          = emitters.issue;
        this.uniqueFilter      = options.unique
            ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text)
            : () => true;
    }

    run(): Promise<RunResult> {

        this.header();

        const configRx = globRx(this.configGlob, this.configGlobOptions)
            .map(util.unique)
            .do(configFiles => this.info(`Config Files Found:\n    ${configFiles.join('\n    ')}\n`))
            .map(filenames => ({filename: filenames.join(' || '), config: cspell.readSettingsFiles(filenames)}))
            .share()
            ;

        interface FileInfo {
            filename: string;
            text: string;
        }

        // Get Exclusions from the config files.
        const exclusionGlobs = configRx
            .map(({filename, config}) => CSpellApplication.extractGlobExcludesFromConfig(filename, config))
            .flatMap(a => a)
            .toArray()
            .map(a => a.concat(this.excludes))
            .toPromise();



        const filesRx: Rx.Observable<FileInfo> = this.filterFiles(CSpellApplication.findFiles(this.files), exclusionGlobs)
            .flatMap(filename => {
                return fsp.readFile(filename).then(
                    text => ({text: text.toString(), filename}),
                    error => {
                        return error.code === 'EISDIR'
                            ? Promise.resolve()
                            : Promise.reject({...error, message: `Error reading file: "${filename}"`});
                    });
            })
            .filter(a => !!a);

        const status: RunResult = {
            files: 0,
            filesWithIssues: new Set<string>(),
            issues: 0,
        };

        const r = Rx.Observable.combineLatest(
                configRx,
                filesRx,
                (config, fileInfo) => ({ config, text: fileInfo.text, filename: fileInfo.filename })
            )
            .do(() => status.files += 1)
            .flatMap(({config, filename, text}) => {
                const ext = path.extname(filename);
                const languageIds = cspell.getLanguagesForExt(ext);
                const settings = cspell.mergeSettings(cspell.getDefaultSettings(), config);
                const fileSettings = cspell.constructSettingsForText(settings, text, languageIds);
                this.debug(`Filename: ${filename}, Extension: ${ext}, LanguageIds: ${languageIds.toString()}`);
                this.debug(commentJson.stringify(fileSettings, undefined, 2));
                return cspell.validateText(text, fileSettings)
                    .then(wordOffsets => {
                        return {
                            filename,
                            issues: cspell.Text.calculateTextDocumentOffsets(filename, text, wordOffsets)
                        };
                    });
            })
            .do(info => {
                const {filename, issues} = info;
                this.info(`Checking: ${filename} ... Issues: ${issues.length}`);
                issues
                    .filter(this.uniqueFilter)
                    .forEach((issue) => this.logIssue(issue));
            })
            .filter(info => !!info.issues.length)
            .do(issue => status.filesWithIssues.add(issue.filename))
            .reduce((status, info) => ({...status, issues: status.issues + info.issues.length}), status)
            .toPromise();
        return r;
    }

    static createInit(_: CSpellApplicationOptions): Promise<void> {
        return Promise.resolve();
    }

    protected header() {
        this.info(`
cspell;
Date: ${(new Date()).toUTCString()}
Options:
    verbose:   ${yesNo(!!this.options.verbose)}
    config:    ${this.configGlob}
    exclude:   ${this.excludes.map(a => a.glob).join('\n             ')}
    files:     ${this.files}
    wordsOnly: ${yesNo(!!this.options.wordsOnly)}
    unique:    ${yesNo(!!this.options.unique)}
`);
    }


    protected isExcluded(filename: string, globs: GlobSrcInfo[]) {
        const cwd = process.cwd();
        const relFilename = (filename.slice(0, cwd.length) === cwd) ? filename.slice(cwd.length) : filename;

        for (const glob of globs) {
            if (glob.regex.test(relFilename)) {
                this.info(`Excluded File: ${filename}; Excluded by ${glob.glob} from ${glob.source}`);
                return true;
            }
        }
        return false;
    }

    static findFiles(globPatterns: string[]): Rx.Observable<string> {
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

    protected filterFiles(files: Rx.Observable<string>, excludeGlobs: Promise<GlobSrcInfo[]>): Rx.Observable<string> {

        excludeGlobs.then(excludeGlobs => {
            const excludeInfo = excludeGlobs.map(g => `Glob: ${g.glob} from ${g.source}`);
            this.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`);
        });
        return Rx.Observable.combineLatest(
            files,
            excludeGlobs,
            (filename, globs) => ({filename, globs})
        )
        .filter(({filename, globs}) => !this.isExcluded(filename, globs))
        .map(({filename}) => filename);
    }

    protected calcExcludeGlobInfo(commandLineExclude: string | undefined): GlobSrcInfo[] {
        const excludes = commandLineExclude && commandLineExclude.split(/\s+/g).map(glob => ({glob, source: 'arguments'}))
            || CSpellApplication.defaultExcludeGlobs.map(glob => ({glob, source: 'default'}));
        return excludes.map(({source, glob}) => ({source, glob, regex: minimatch.makeRe(glob)}));
    }

    private static extractGlobExcludesFromConfig(filename: string, config: cspell.CSpellUserSettings): GlobSrcInfo[] {
        return (config.ignorePaths || []).map(glob => ({ source: filename, glob, regex: minimatch.makeRe(glob)}));
    }
}

type GlobRx = (filename: string, options?: minimatch.IOptions) => Rx.Observable<string[]>;


function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}

const globRx: GlobRx = Rx.Observable.bindNodeCallback<string, string[]>(glob);
