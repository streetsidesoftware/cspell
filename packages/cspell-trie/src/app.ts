#!/usr/bin/env node --max_old_space_size=8192

// cSpell:ignore findup
import * as commander from 'commander';
import * as fs from 'fs';
import {lineReaderRx as lineReader} from 'cspell-lib';
import {rxToStream} from 'rxjs-stream';
import {mkdirp} from 'fs-extra';
import * as path from 'path';
import * as Trie from './lib';
import {observableFromIterable} from 'rxjs-from-iterable';

const packageInfo = require('../package.json');
const version = packageInfo['version'];
commander
    .version(version);

commander
    .command('create <file.txt>')
    .option('-o, --output <file>', 'output file - defaults to stdout')
    .option('-l, --lower_case', 'output in lower case')
    .option('-b, --base <number>', 'Use base n for reference ids.  Defaults to 32. Common values are 10, 16, 32. Max of 36')
    .description('Generate a file for use with cspell')
    .action((filename, options) => {
        const {
            output: outputFile,
            lower_case: lowerCase = false,
            base = 32,
        } = options;
        notify('Create Trie', !!outputFile);
        const pOutputStream = createWriteStream(outputFile);
        notify(`Generating...`, !!outputFile);
        const rxReader = lineReader(filename, 'utf8');
        const toLower = lowerCase ? (a: string) => a.toLowerCase() : (a: string) => a;

        const wordsRx = rxReader
            .map(toLower)
            .map(a => a.trim())
            .filter(a => !!a);

        const trieRx = wordsRx
            .reduce((node, word) => Trie.insert(word, node), {} as Trie.TrieNode)
            .do(() => notify('Processing Trie'))
            .do(() => notify('Export Trie'))
            .map(root => Trie.serializeTrie(root, (base - 0) || 32))
            .flatMap(seq => observableFromIterable(seq));

        pOutputStream.then(writeStream => {
            rxToStream(trieRx.bufferCount(1024).map(words => words.join(''))).pipe(writeStream);
        });

    });

commander
    .command('reader <file.trie>')
    .option('-o, --output <file>', 'output file - defaults to stdout')
    .description('Read a cspell trie file and output the list of words.')
    .action((filename, options) => {
        const {
            output: outputFile,
        } = options;
        notify('Reading Trie', !!outputFile);
        const pOutputStream = createWriteStream(outputFile);
        const rxReader = lineReader(filename, 'utf8');
        const wordsRx = Trie.importTrieRx(rxReader)
            .map(root => Trie.iteratorTrieWords(root))
            .flatMap(seq => observableFromIterable(seq))
            .map(word => word + '\n');

        pOutputStream.then(writeStream => {
            rxToStream(wordsRx.bufferCount(1024).map(words => words.join(''))).pipe(writeStream);
        });

    });

commander.parse(process.argv);

if (!commander.args.length) {
    commander.help();
}

function createWriteStream(filename?: string): Promise<NodeJS.WritableStream> {
    return !filename
        ? Promise.resolve(process.stdout)
        : mkdirp(path.dirname(filename)).then(() => fs.createWriteStream(filename));
}

function notify(message: any, useStdOut = true) {
    if (useStdOut) {
        console.log(message);
    } else {
        console.error(message);
    }
}

