#!/usr/bin/env node
"use strict";
const commander = require("commander");
const HunspellReader_1 = require("./HunspellReader");
const findup = require('findup-sync');
const fs = require("fs");
const fileReader_1 = require("./fileReader");
const trieCompact_1 = require("./trieCompact");
const patternModeler_1 = require("./patternModeler");
const cspell_tools_1 = require("cspell-tools");
const fs_promise_1 = require("fs-promise");
const Rx = require("rxjs/Rx");
const path = require("path");
const packageInfo = require(findup('package.json'));
const version = packageInfo['version'];
commander
    .version(version);
commander
    .command('words <hunspell_dic_file>')
    .option('-o, --output <file>', 'output file - defaults to stdout')
    .option('-s, --sort', 'sort the list of words')
    .option('-u, --unique', 'make sure the words are unique.')
    .option('-i, --ignore_case', 'used with --unique and --sort')
    .option('-l, --lower_case', 'output in lower case')
    .description('Output all the words in the <hunspell.dic> file.')
    .action((hunspellDicFilename, options) => {
    const { sort = false, unique = false, ignore_case: ignoreCase = false, output: outputFile, lower_case: lowerCase = false, } = options;
    notify('Write words', !!outputFile);
    notify(`Sort: ${yesNo(sort)}`, !!outputFile);
    notify(`Unique: ${yesNo(unique)}`, !!outputFile);
    notify(`Ignore Case: ${yesNo(ignoreCase)}`, !!outputFile);
    const pOutputStream = createWriteStream(outputFile);
    const baseFile = hunspellDicFilename.replace(/(\.dic)?$/, '');
    const dicFile = baseFile + '.dic';
    const affFile = baseFile + '.aff';
    notify(`Dic file: ${dicFile}`, !!outputFile);
    notify(`Aff file: ${affFile}`, !!outputFile);
    notify(`Generating Words`, !!outputFile);
    const reader = new HunspellReader_1.HunspellReader(affFile, dicFile);
    const wordsRx = Rx.Observable.of(reader.readWords().map(a => a.trim()).filter(a => !!a))
        .map(wordsRx => unique ? makeUnique(wordsRx, ignoreCase) : wordsRx)
        .map(wordsRx => sort ? sortWordList(wordsRx, ignoreCase) : wordsRx)
        .map(wordsRx => lowerCase ? wordsRx.map(a => a.toLowerCase()) : wordsRx)
        .flatMap(words => words)
        .map(word => word + '\n');
    pOutputStream.then(writeStream => {
        cspell_tools_1.observableToStream(wordsRx).pipe(writeStream);
    });
});
commander
    .command('compact <sorted_word_list_file>')
    .option('-o, --output <file>', 'output file')
    .description('compacts the file into an experimental format.')
    .action((sortedWordListFilename, options) => {
    const outputFile = options.output;
    const pOutputStream = createWriteStream(outputFile);
    const lines = fileReader_1.lineReader(sortedWordListFilename);
    const compactStream = trieCompact_1.trieCompactSortedWordList(lines);
    pOutputStream.then(writeStream => {
        cspell_tools_1.observableToStream(compactStream).pipe(writeStream);
    });
});
commander
    .command('test_pattern_modeler <sorted_word_list_file>')
    .description('This is an experimental command used for experimenting with patterns in the text.')
    .action((sortedWordListFilename, options) => {
    const lines = fileReader_1.lineReader(sortedWordListFilename);
    const compactStream = trieCompact_1.trieCompactSortedWordList(lines);
    let x;
    patternModeler_1.patternModeler(compactStream).subscribe(node => {
        x = node;
        const stopHere = node;
    }, () => { }, () => {
        const stopHere = x;
    });
});
commander.parse(process.argv);
if (!commander.args.length) {
    commander.help();
}
function createWriteStream(filename) {
    return !filename
        ? Promise.resolve(process.stdout)
        : fs_promise_1.mkdirp(path.dirname(filename)).then(() => fs.createWriteStream(filename));
}
function sortWordList(words, ignoreCase) {
    const compStr = (a, b) => a < b ? -1 : (a > b ? 1 : 0);
    const fnComp = ignoreCase
        ? ((a, b) => compStr(a.toLowerCase(), b.toLowerCase()))
        : compStr;
    return words
        .toArray()
        .concatMap(a => a.sort(fnComp));
}
function makeUnique(words, ignoreCase) {
    const found = new Set();
    const normalize = ignoreCase ? (a => a.toLowerCase()) : (a => a);
    return words
        .filter(w => !found.has(normalize(w)))
        .do(w => found.add(normalize(w)));
}
function notify(message, useStdOut = true) {
    if (useStdOut) {
        console.log(message);
    }
    else {
        console.error(message);
    }
}
function yesNo(value) {
    return value ? 'Yes' : 'No';
}
//# sourceMappingURL=app.js.map