"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const Rx = require("rxjs/Rx");
const glob = require("glob");
const minimatch = require("minimatch");
const cspell = require("./index");
const fsp = require("fs-promise");
const path = require("path");
;
class CSpellApplication {
    constructor(files, options, log) {
        this.files = files;
        this.options = options;
        this.log = log;
        this.configGlob = 'cspell.json';
        this.configGlobOptions = { nocase: true };
        this.excludeGlobs = [
            'node_modules/**'
        ];
        this.info = options.verbose ? log : () => { };
        this.configGlob = options.config || this.configGlob;
        this.configGlobOptions = options.config ? {} : this.configGlobOptions;
        const excludes = options.exclude && options.exclude.split(/\s+/g);
        this.excludeGlobs = excludes || this.excludeGlobs;
        this.excludes = this.excludeGlobs.map(glob => minimatch.makeRe(glob));
    }
    run() {
        this.header();
        const globRx = Rx.Observable.bindNodeCallback(glob);
        const processed = new Set();
        const configRx = globRx(this.configGlob, this.configGlobOptions)
            .do(configFiles => this.info(`Config Files Found:\n    ${configFiles.join('')}\n`))
            .map(filenames => cspell.readSettingsFiles(filenames));
        const filesRx = Rx.Observable.from(this.files)
            .flatMap(pattern => globRx(pattern)
            .catch((error) => {
            return new Promise((resolve) => resolve(Promise.reject(__assign({}, error, { message: 'Error with glob search.' }))));
        }))
            .flatMap(a => a)
            .filter(filename => !processed.has(filename))
            .do(filename => processed.add(filename))
            .filter(filename => !this.isExcluded(filename))
            .flatMap(filename => {
            return fsp.readFile(filename).then(text => ({ text: text.toString(), filename }), error => {
                return error.code === 'EISDIR'
                    ? Promise.resolve()
                    : Promise.reject(__assign({}, error, { message: `Error reading file: "${filename}"` }));
            });
        })
            .filter(a => !!a);
        const status = {
            files: 0,
            issues: 0,
        };
        const r = Rx.Observable.combineLatest(configRx, filesRx, (config, { text, filename }) => ({ config, text, filename }))
            .do(() => status.files += 1)
            .flatMap(({ config, filename, text }) => {
            const ext = path.extname(filename);
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = cspell.mergeSettings(cspell.getDefaultSettings(), config);
            const fileSettings = cspell.constructSettingsForText(settings, text, languageIds);
            return cspell.validateText(text, fileSettings)
                .then(wordOffsets => {
                return {
                    filename,
                    issues: cspell.Text.calculateTextDocumentOffsets(filename, text, wordOffsets)
                };
            });
        })
            .do(info => {
            const { filename, issues } = info;
            this.info(`Checking: ${filename} ... Issues: ${issues.length}`);
            issues
                .map(({ uri, row, col, word }) => `${uri}[${row}, ${col}]: Unknown word: ${word}`)
                .forEach(message => this.log(message));
        })
            .filter(info => !!info.issues.length)
            .reduce((status) => (__assign({}, status, { issues: status.issues + 1 })), status)
            .toPromise();
        return r;
    }
    header() {
        this.info(`
cspell;
Date: ${(new Date()).toUTCString()}
Options:
    verbose: ${yesNo(this.options.verbose)}
    config:  ${this.configGlob}
    exclude: ${this.excludeGlobs.join('\n             ')}
    files:   ${this.files}
`);
    }
    isExcluded(filename) {
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
exports.CSpellApplication = CSpellApplication;
function yesNo(value) {
    return value ? 'Yes' : 'No';
}
//# sourceMappingURL=application.js.map