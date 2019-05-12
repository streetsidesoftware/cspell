#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const program = require("commander");
const npmPackage = require(path.join(__dirname, '..', 'package.json'));
const application_1 = require("./application");
const App = require("./application");
const chalk_1 = require("chalk");
// interface InitOptions extends Options {}
const templateIssue = `${chalk_1.default.green('${uri}')}:${chalk_1.default.yellow('${row}:${col}')} - Unknown word (${chalk_1.default.red('${text}')})`;
const templateIssueLegacy = `${chalk_1.default.green('${uri}')}[\${row}, \${col}]: Unknown word: ${chalk_1.default.red('${text}')}`;
const templateIssueWordsOnly = '${text}';
function genIssueEmitter(template) {
    return function issueEmitter(issue) {
        console.log(formatIssue(template, issue));
    };
}
function errorEmitter(message, error) {
    console.error(chalk_1.default.red(message), error);
    return Promise.resolve();
}
function infoEmitter(message) {
    console.info(chalk_1.default.yellow(message));
}
function debugEmitter(message) {
    console.info(chalk_1.default.cyan(message));
}
function nullEmitter(_) { }
let showHelp = true;
program
    .version(npmPackage.version)
    .description('Spelling Checker for Code');
program
    .option('-c, --config <cspell.json>', 'Configuration file to use.  By default cspell looks for cspell.json in the current directory.')
    .option('-v, --verbose', 'display more information about the files being checked and the configuration')
    .option('--local <local>', 'Set language locals. i.e. "en,fr" for English and French, or "en-GB" for British English.')
    .option('--legacy', 'Legacy output')
    .option('--languageId <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
    .option('--wordsOnly', 'Only output the words not found in the dictionaries.')
    .option('-u, --unique', 'Only output the first instance of a word not found in the dictionaries.')
    .option('--debug', 'Output information useful for debugging cspell.json files.')
    .option('-e, --exclude <glob>', 'Exclude files matching the glob pattern')
    .option('--no-color', 'Turn off color.')
    .option('--color', 'Force color')
    .option('--no-summary', 'Turn off summary message in console')
    // The following options are planned features
    // .option('-w, --watch', 'Watch for any changes to the matching files and report any errors')
    // .option('--force', 'Force the exit value to always be 0')
    .arguments('<files...>')
    .action((files, options) => {
    const issueTemplate = options.wordsOnly
        ? templateIssueWordsOnly
        : options.legacy ? templateIssueLegacy : templateIssue;
    const emitters = {
        issue: genIssueEmitter(issueTemplate),
        error: errorEmitter,
        info: options.verbose ? infoEmitter : nullEmitter,
        debug: options.debug ? debugEmitter : nullEmitter,
    };
    showHelp = false;
    App.lint(files, options, emitters).then(result => {
        if (options.summary) {
            console.error('CSpell: Files checked: %d, Issues found: %d in %d files', result.files, result.issues, result.filesWithIssues.size);
        }
        process.exit(result.issues ? 1 : 0);
    }, (error) => {
        console.error(error.message);
        process.exit(1);
    });
});
program
    .command('trace')
    .description('Trace words')
    .option('-c, --config <cspell.json>', 'Configuration file to use.  By default cspell looks for cspell.json in the current directory.')
    .option('--local <local>', 'Set language locals. i.e. "en,fr" for English and French, or "en-GB" for British English.')
    .option('--languageId <language>', 'Force programming language for unknown extensions. i.e. "php" or "scala"')
    .option('--no-color', 'Turn off color.')
    .option('--color', 'Force color')
    .arguments('<words...>')
    .action((words, options) => {
    showHelp = false;
    App.trace(words, options.parent).then(result => {
        result.forEach(emitTraceResult);
        process.exit(0);
    }, (error) => {
        console.error(error.message);
        process.exit(1);
    });
});
program
    .command('check <files...>')
    .description('Spell check file(s) and display the result. The full file is displayed in color.')
    .option('-c, --config <cspell.json>', 'Configuration file to use.  By default cspell looks for cspell.json in the current directory.')
    .option('--no-color', 'Turn off color.')
    .option('--color', 'Force color')
    .action(async (files, options) => {
    showHelp = false;
    for (const filename of files) {
        console.log(chalk_1.default.yellowBright(`Check file: ${filename}`));
        console.log();
        try {
            const result = await application_1.checkText(filename, options.parent);
            for (const item of result.items) {
                const fn = item.flagIE === App.IncludeExcludeFlag.EXCLUDE
                    ? chalk_1.default.gray
                    : item.isError ? chalk_1.default.red : chalk_1.default.whiteBright;
                const t = fn(item.text);
                process.stdout.write(t);
            }
            console.log();
        }
        catch (e) {
            console.error(`Failed to read "${filename}"`);
        }
        console.log();
    }
    process.exit(0);
});
/*
program
    .command('init')
    .description('(Alpha) Initialize a cspell.json file.')
    .option('-o, --output <cspell.json>', 'define where to write file.')
    .option('--extends <cspell.json>', 'extend an existing cspell.json file.')
    .action((options: InitOptions) => {
        showHelp = false;
        CSpellApplication.createInit(options).then(
            () => process.exit(0),
            () => process.exit(1)
        );
        console.log('Init');
    });
*/
program.parse(process.argv);
if (showHelp) {
    program.help();
}
function emitTraceResult(r) {
    const terminalWidth = process.stdout.columns || 120;
    const widthName = 20;
    const w = chalk_1.default.green(r.word);
    const f = r.found
        ? chalk_1.default.whiteBright('*')
        : chalk_1.default.dim('-');
    const n = chalk_1.default.yellowBright(pad(r.dictName, widthName));
    const used = [r.word.length, 1, widthName].reduce((a, b) => a + b, 3);
    const widthSrc = terminalWidth - used;
    const s = chalk_1.default.white(trimMid(r.dictSource, widthSrc));
    const line = [w, f, n, s].join(' ');
    console.log(line);
}
function pad(s, w) {
    return (s + ' '.repeat(w)).substr(0, w);
}
function trimMid(s, w) {
    if (s.length <= w) {
        return s;
    }
    const l = Math.floor((w - 3) / 2);
    const r = Math.ceil((w - 3) / 2);
    return s.substr(0, l) + '...' + s.substr(-r);
}
function formatIssue(template, issue) {
    const { uri = '', row, col, text } = issue;
    return template
        .replace(/\$\{uri\}/, uri)
        .replace(/\$\{row\}/, row.toString())
        .replace(/\$\{col\}/, col.toString())
        .replace(/\$\{text\}/, text);
}
//# sourceMappingURL=app.js.map