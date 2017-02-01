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

export type Issue = cspell.TextDocumentOffset;

export class CSpellApplication {

    readonly info: (message?: any, ...args: any[]) => void;
    readonly debug: (message?: any, ...args: any[]) => void;
    readonly logIssue: (issue: Issue) => void;
    readonly uniqueFilter: (issue: Issue) => boolean;
    private configGlob = 'cspell.json';
    private configGlobOptions: minimatch.IOptions = { nocase: true };
    private excludeGlobs = [
        'node_modules/**'
    ];
    private excludes: RegExp[];

    constructor(readonly files: string[], readonly options: CSpellApplicationOptions, readonly log: (message?: any, ...args: any[]) => void) {
        this.info              = options.verbose ? log : () => {};
        this.debug             = options.debug ? log : () => {};
        this.configGlob        = options.config || this.configGlob;
        this.configGlobOptions = options.config ? {} : this.configGlobOptions;
        const excludes         = options.exclude && options.exclude.split(/\s+/g);
        this.excludeGlobs      = excludes || this.excludeGlobs;
        this.excludes          = this.excludeGlobs.map(glob => minimatch.makeRe(glob));
        this.logIssue          = options.wordsOnly
            ? (issue: Issue) => this.log(issue.text)
            : ({uri, row, col, text}) => this.log(`${uri}[${row}, ${col}]: Unknown word: ${text}`);
        this.uniqueFilter      = options.unique
            ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text)
            : () => true;
    }

    run(): Promise<RunResult> {

        this.header();
        const globRx: GlobRx = Rx.Observable.bindNodeCallback<string, string[]>(glob);

        const processed = new Set<string>();

        const configRx = globRx(this.configGlob, this.configGlobOptions)
            .do(configFiles => this.info(`Config Files Found:\n    ${configFiles.join('')}\n`))
            .map(filenames => cspell.readSettingsFiles(filenames));

        interface FileInfo {
            filename: string;
            text: string;
        }

        const filesRx: Rx.Observable<FileInfo> = Rx.Observable.from(this.files)
            .flatMap(pattern => globRx(pattern)
                .catch((error: AppError) => {
                    return new Promise<string[]>((resolve) => resolve(Promise.reject({...error, message: 'Error with glob search.'})));
            }))
            .flatMap(a => a)
            .filter(filename => !processed.has(filename))
            .do(filename => processed.add(filename))
            .filter(filename => !this.isExcluded(filename))
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
    exclude:   ${this.excludeGlobs.join('\n             ')}
    files:     ${this.files}
    wordsOnly: ${yesNo(!!this.options.wordsOnly)}
    unique:    ${yesNo(!!this.options.unique)}
`);
    }


    protected isExcluded(filename: string) {
        const cwd = process.cwd();
        const relFilename = (filename.slice(0, cwd.length) === cwd) ? filename.slice(cwd.length) : filename;

        for (const reg of this.excludes) {
            if (reg.test(relFilename)) {
                return true;
            }
        }
        return false;
    }
}

type GlobRx = (filename: string, options?: minimatch.IOptions) => Rx.Observable<string[]>;


function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}
