"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const glob = require("glob");
const minimatch = require("minimatch");
const cspell = require("./index");
const fsp = require("fs-extra");
const path = require("path");
const commentJson = require("comment-json");
const util = require("./util/util");
const index_1 = require("./index");
const Validator = require("./validator");
// cspell:word nocase
const UTF8 = 'utf8';
var index_2 = require("./index");
exports.IncludeExcludeFlag = index_2.IncludeExcludeFlag;
const matchBase = { matchBase: true };
const defaultMinimatchOptions = { nocase: true };
const defaultConfigGlob = '{cspell.json,.cspell.json}';
const defaultConfigGlobOptions = defaultMinimatchOptions;
class CSpellApplicationConfiguration {
    constructor(files, options, emitters) {
        this.files = files;
        this.options = options;
        this.emitters = emitters;
        this.configGlob = defaultConfigGlob;
        this.configGlobOptions = defaultConfigGlobOptions;
        this.info = emitters.info || this.info;
        this.debug = emitters.debug || this.debug;
        this.configGlob = options.config || this.configGlob;
        this.configGlobOptions = options.config ? {} : this.configGlobOptions;
        this.excludes = calcExcludeGlobInfo(options.exclude);
        this.logIssue = emitters.issue || this.logIssue;
        this.local = options.local || '';
        this.uniqueFilter = options.unique
            ? util.uniqueFilterFnGenerator((issue) => issue.text)
            : () => true;
    }
}
exports.CSpellApplicationConfiguration = CSpellApplicationConfiguration;
function lint(files, options, emitters) {
    const cfg = new CSpellApplicationConfiguration(files, options, emitters);
    return runLint(cfg);
}
exports.lint = lint;
function runLint(cfg) {
    return run();
    function run() {
        header();
        const settingsFromCommandLine = util.clean({
            languageId: cfg.options.languageId || undefined,
            language: cfg.local || undefined,
        });
        const configRx = globRx(cfg.configGlob, cfg.configGlobOptions).pipe(operators_1.map(util.unique), operators_1.tap(configFiles => cfg.info(`Config Files Found:\n    ${configFiles.join('\n    ')}\n`)), operators_1.map((filenames) => ({ filename: filenames.join(' || '), config: cspell.readSettingsFiles(filenames) })), operators_1.share());
        // Get Exclusions from the config files.
        const exclusionGlobs = configRx.pipe(operators_1.map(({ filename, config }) => extractGlobExcludesFromConfig(filename, config)), operators_1.flatMap(a => a), operators_1.toArray(), operators_1.map(a => a.concat(cfg.excludes))).toPromise();
        const filesRx = filterFiles(findFiles(cfg.files), exclusionGlobs).pipe(operators_1.flatMap(filename => {
            return fsp.readFile(filename).then(text => ({ text: text.toString(), filename }), error => {
                return error.code === 'EISDIR'
                    ? Promise.resolve(undefined)
                    : Promise.reject(Object.assign({}, error, { message: `Error reading file: "${filename}"` }));
            });
        }), operators_1.filter(a => !!a), operators_1.map(a => a));
        const status = {
            files: 0,
            filesWithIssues: new Set(),
            issues: 0,
        };
        const r = rxjs_1.combineLatest(configRx, filesRx, (configInfo, fileInfo) => ({ configInfo, text: fileInfo.text, filename: fileInfo.filename })).pipe(operators_1.map(({ configInfo, filename, text }) => {
            const info = calcFinalConfigInfo(configInfo, settingsFromCommandLine, filename, text);
            cfg.debug(`Filename: ${filename}, Extension: ${path.extname(filename)}, LanguageIds: ${info.languageIds.toString()}`);
            return info;
        }), operators_1.filter(info => info.configInfo.config.enabled !== false), operators_1.tap(() => status.files += 1), operators_1.flatMap((info) => {
            const { configInfo, filename, text } = info;
            const debugCfg = { config: Object.assign({}, configInfo.config, { source: null }), filename: configInfo.filename };
            cfg.debug(commentJson.stringify(debugCfg, undefined, 2));
            return cspell.validateText(text, configInfo.config)
                .then(wordOffsets => {
                return {
                    filename,
                    issues: cspell.Text.calculateTextDocumentOffsets(filename, text, wordOffsets),
                    config: configInfo.config,
                };
            });
        }), operators_1.tap(info => {
            const { filename, issues, config } = info;
            const dictionaries = (config.dictionaries || []);
            cfg.info(`Checking: ${filename}, File type: ${config.languageId}, Language: ${config.language} ... Issues: ${issues.length}`);
            cfg.info(`Dictionaries Used: ${dictionaries.join(', ')}`);
            issues
                .filter(cfg.uniqueFilter)
                .forEach((issue) => cfg.logIssue(issue));
        }), operators_1.filter(info => !!info.issues.length), operators_1.tap(issue => status.filesWithIssues.add(issue.filename)), operators_1.reduce((status, info) => (Object.assign({}, status, { issues: status.issues + info.issues.length })), status)).toPromise();
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
    function isExcluded(filename, globs) {
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
    function filterFiles(files, excludeGlobs) {
        excludeGlobs.then(excludeGlobs => {
            const excludeInfo = excludeGlobs.map(g => `Glob: ${g.glob} from ${g.source}`);
            cfg.info(`Exclusion Globs: \n    ${excludeInfo.join('\n    ')}\n`);
        });
        return rxjs_1.combineLatest(files, excludeGlobs, (filename, globs) => ({ filename, globs })).pipe(operators_1.filter(({ filename, globs }) => !isExcluded(filename, globs)), operators_1.map(({ filename }) => filename));
    }
}
async function trace(words, options) {
    const configGlob = options.config || defaultConfigGlob;
    const configGlobOptions = options.config ? {} : defaultConfigGlobOptions;
    const results = await globRx(configGlob, configGlobOptions).pipe(operators_1.map(util.unique), operators_1.map(filenames => ({ filename: filenames.join(' || '), config: cspell.readSettingsFiles(filenames) })), operators_1.map(({ filename, config }) => ({ filename, config: cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), config) })), operators_1.flatMap(config => index_1.traceWords(words, config.config)), operators_1.toArray()).toPromise();
    return results;
}
exports.trace = trace;
async function checkText(filename, options) {
    const configGlob = options.config || defaultConfigGlob;
    const configGlobOptions = options.config ? {} : defaultConfigGlobOptions;
    const pSettings = globRx(configGlob, configGlobOptions).pipe(operators_1.first(), operators_1.map(util.unique), operators_1.map(filenames => ({ filename: filenames[0], config: cspell.readSettingsFiles(filenames) }))).toPromise();
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
exports.checkText = checkText;
function createInit(_) {
    return Promise.resolve();
}
exports.createInit = createInit;
const defaultExcludeGlobs = [
    'node_modules/**'
];
function findFiles(globPatterns) {
    const processed = new Set();
    return rxjs_1.from(globPatterns).pipe(operators_1.flatMap(pattern => globRx(pattern)
        .pipe(operators_1.catchError((error) => {
        return new Promise((resolve) => resolve(Promise.reject(Object.assign({}, error, { message: 'Error with glob search.' }))));
    }))), operators_1.flatMap(a => a), operators_1.filter(filename => !processed.has(filename)), operators_1.tap(filename => processed.add(filename)));
}
function calcExcludeGlobInfo(commandLineExclude) {
    const excludes = commandLineExclude && commandLineExclude.split(/\s+/g).map(glob => ({ glob, source: 'arguments' }))
        || defaultExcludeGlobs.map(glob => ({ glob, source: 'default' }));
    return excludes.map(({ source, glob }) => ({ source, glob, regex: minimatch.makeRe(glob, matchBase) }));
}
function extractGlobExcludesFromConfig(filename, config) {
    return (config.ignorePaths || []).map(glob => ({ source: filename, glob, regex: minimatch.makeRe(glob, matchBase) }));
}
function calcFinalConfigInfo(configInfo, settingsFromCommandLine, filename, text) {
    const ext = path.extname(filename);
    const fileSettings = cspell.calcOverrideSettings(configInfo.config, path.resolve(filename));
    const settings = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.getGlobalSettings(), fileSettings, settingsFromCommandLine);
    const languageIds = settings.languageId ? [settings.languageId] : cspell.getLanguagesForExt(ext);
    const config = cspell.constructSettingsForText(settings, text, languageIds);
    return { configInfo: Object.assign({}, configInfo, { config }), filename, text, languageIds };
}
function yesNo(value) {
    return value ? 'Yes' : 'No';
}
const globRx = rxjs_1.bindNodeCallback(glob);
//# sourceMappingURL=application.js.map