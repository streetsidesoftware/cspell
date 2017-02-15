#!/usr/bin/env node --max_old_space_size=8192

// cSpell:ignore findup
import * as commander from 'commander';
import { HunspellReader } from './HunspellReader';
import * as fs from 'fs';
import {lineReader} from './fileReader';
import {trieCompactSortedWordList} from './trieCompact';
import {patternModeler} from './patternModeler';
import {rxToStream} from 'rxjs-stream';
import {mkdirp} from 'fs-promise';
import * as Rx from 'rxjs/Rx';
import * as path from 'path';
// import * as monitor from './monitor';
import * as Trie from './trie';
import {observableFromIterable} from 'rxjs-from-iterable';

const packageInfo = require('../package.json');
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
    .option('-T, --no-transform', 'Do not apply the prefix and suffix transforms.  Root words only.')
    .description('Output all the words in the <hunspell.dic> file.')
    .action((hunspellDicFilename, options) => {
        const {
            sort = false,
            unique = false,
            ignore_case: ignoreCase = false,
            output: outputFile,
            lower_case: lowerCase = false,
            transform = true,
        } = options;
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
        const pReader = HunspellReader.createFromFiles(affFile, dicFile);
        const pWordReader = transform ? pReader.then(reader => reader.readWords()) : pReader.then(reader => reader.readRootWords());

        const wordsRx = Rx.Observable.from(pWordReader)
            .map(words => words
                .map(a => a.trim())
                .filter(a => !!a)
            )
            .map(wordsRx => unique ? makeUnique(wordsRx, ignoreCase) : wordsRx)
            .map(wordsRx => sort ? sortWordList(wordsRx, ignoreCase) : wordsRx)
            .map(wordsRx => lowerCase ? wordsRx.map(a => a.toLowerCase()) : wordsRx)
            .flatMap(words => words)
            .map(word => word + '\n');

        pOutputStream.then(writeStream => {
            rxToStream(wordsRx.bufferCount(1024).map(words => words.join(''))).pipe(writeStream);
        });
    });

commander
    .command('compact <sorted_word_list_file>')
    .option('-o, --output <file>', 'output file')
    .description('compacts the file into an experimental format.')
    .action((sortedWordListFilename, options) => {
        const outputFile = options.output;
        const pOutputStream = createWriteStream(outputFile);
        const lines = lineReader(sortedWordListFilename);
        const compactStream = trieCompactSortedWordList(lines);
        pOutputStream.then(writeStream => {
            rxToStream(compactStream).pipe(writeStream);
        });
    });

commander
    .command('test_pattern_modeler <sorted_word_list_file>')
    .description('This is an experimental command used for experimenting with patterns in the text.')
    .action((sortedWordListFilename, _options) => {
        const lines = lineReader(sortedWordListFilename);
        const compactStream = trieCompactSortedWordList(lines);
        let x: any;
        patternModeler(compactStream).subscribe(
            node => {
                x = node;
            },
            () => {},
            () => {
                x = x;
            }
        );
    });

commander
    .command('test_trie <hunspell_dic_file>')
    .option('-o, --output <file>', 'output file - defaults to stdout')
    .option('-l, --lower_case', 'output in lower case')
    .option('-T, --no-transform', 'Do not apply the prefix and suffix transforms.  Root words only.')
    .option('-b, --base <number>', 'Use base n for reference ids.  Defaults to 32. Common values are 10, 16, 32')
    .description('Experimental Trie file format')
    .action((hunspellDicFilename, options) => {
        const {
            output: outputFile,
            transform = true,
            lower_case: lowerCase = false,
            base = 32,
        } = options;
        notify('Write words', !!outputFile);
        const pOutputStream = createWriteStream(outputFile);
        const baseFile = hunspellDicFilename.replace(/(\.dic)?$/, '');
        const dicFile = baseFile + '.dic';
        const affFile = baseFile + '.aff';
        notify(`Dic file: ${dicFile}`, !!outputFile);
        notify(`Aff file: ${affFile}`, !!outputFile);
        notify(`Generating Words`, !!outputFile);
        const pReader = HunspellReader.createFromFiles(affFile, dicFile);
        const pWordReader = transform ? pReader.then(reader => reader.readWords()) : pReader.then(reader => reader.readRootWords());

        const wordsRx = Rx.Observable.from(pWordReader)
            .map(wordsRx => lowerCase ? wordsRx.map(a => a.toLowerCase()) : wordsRx)
            .flatMap(words => words)
            .map(a => a.trim())
            .filter(a => !!a);

        const trieRx = wordsRx
            .reduce((node, word) => Trie.insert(word, node), {} as Trie.TrieNode)
            .do(() => notify('Processing Trie'))
            .do(() => notify('Export Trie'))
            .map(root => Trie.exportTrie(root, (base - 0) || 32))
            .flatMap(seq => observableFromIterable(seq));

        pOutputStream.then(writeStream => {
            rxToStream(trieRx.bufferCount(1024).map(words => words.join(''))).pipe(writeStream);
        });

    });

commander.parse(process.argv);

if (!commander.args.length) {
    commander.help();
}

function createWriteStream(filename?: string): Promise<fs.WriteStream> {
    return !filename
        ? Promise.resolve(process.stdout)
        : mkdirp(path.dirname(filename)).then(() => fs.createWriteStream(filename));
}

function sortWordList(words: Rx.Observable<string>, ignoreCase: boolean) {
    const compStr = (a, b) => a < b ? -1 : (a > b ? 1 : 0);
    const fnComp: (a: string, b: string) => number = ignoreCase
        ? ((a, b) => compStr(a.toLowerCase(), b.toLowerCase()))
        : compStr;
    return words
        .toArray()
        .flatMap(a => a.sort(fnComp));
}

function makeUnique(words: Rx.Observable<string>, ignoreCase: boolean) {
    const found = new Set<string>();
    const normalize: (a: string) => string = ignoreCase ? (a => a.toLowerCase()) : (a => a);
    return words
        .filter(w => !found.has(normalize(w)))
        .do(w => found.add(normalize(w)));
}

function notify(message: any, useStdOut = true) {
    if (useStdOut) {
        console.log(message);
    } else {
        console.error(message);
    }
}

function yesNo(value: boolean) {
    return value ? 'Yes' : 'No';
}