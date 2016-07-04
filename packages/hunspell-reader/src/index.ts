import * as commander from 'commander';
import { HunspellReader } from './HunspellReader';
const findup = require('findup-sync');
import * as fs from 'fs';
import * as RxNode from 'rx-node';
import {lineReader} from './fileReader';
import {trieCompactSortedWordList} from './trieCompact';

const packageInfo = require(findup('package.json'));
const version = packageInfo['version'];
commander
    .version(version);

commander
    .command('words <hunspell_dic_file>')
    .option('-o, --output <file>', 'output file')
    .description('list all the words in the <hunspell.dic> file.')
    .action((hunspellDicFilename, options) => {
        const outputFile = options.output;
        const outputStream = createWriteStream(outputFile);
        const baseFile = hunspellDicFilename.replace(/(\.dic)?$/, '');
        const dicFile = baseFile + '.dic';
        const affFile = baseFile + '.aff';
        const reader = new HunspellReader(affFile, dicFile);
        const wordsRx = reader.readWords().map(word => word + '\n');
        RxNode.writeToStream(wordsRx, outputStream, 'UTF-8');
    });

commander
    .command('compact <sorted_word_list_file>')
    .option('-o, --output <file>', 'output file')
    .description('compacts the file')
    .action((sortedWordListFilename, options) => {
        const outputFile = options.output;
        const outputStream = createWriteStream(outputFile);
        const lines = lineReader(sortedWordListFilename);
        RxNode.writeToStream(trieCompactSortedWordList(lines), outputStream, 'UTF-8');
    });

commander.parse(process.argv);

if (!commander.args.length) {
    commander.help();
}

function createWriteStream(filename?: string) {
    return filename ? fs.createWriteStream(filename) : process.stdout;
}