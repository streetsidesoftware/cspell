#!/usr/bin/env node --max_old_space_size=8192

// cSpell:ignore findup
import * as commander from 'commander';
import { IterableHunspellReader } from './IterableHunspellReader';
import * as fs from 'fs';
import { uniqueFilter, batch } from './util';
import { genSequence } from 'gensequence';
// import * as monitor from './monitor';

const uniqueHistorySize = 50000;

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
    .action(async (hunspellDicFilename, options) => {
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
        const baseFile = hunspellDicFilename.replace(/(\.dic)?$/, '');
        const dicFile = baseFile + '.dic';
        const affFile = baseFile + '.aff';
        notify(`Dic file: ${dicFile}`, !!outputFile);
        notify(`Aff file: ${affFile}`, !!outputFile);
        notify(`Generating Words`, !!outputFile);
        const reader = await IterableHunspellReader.createFromFiles(affFile, dicFile);
        const seqWords = transform ? reader.seqWords() : reader.seqRootWords();

        const normalize = lowerCase ? (a: string) => a.toLowerCase() : (a: string) => a;
        const filterUnique = unique ? uniqueFilter(uniqueHistorySize) : (_: string) => true;

        const fd = outputFile ? fs.openSync(outputFile, 'w') : 1;

        const words = seqWords
            .map(a => a.trim())
            .filter(a => !!a)
            .map(normalize)
            .map(a => a + '\n')
            .filter(filterUnique)

        if (sort) {
            const data = words.toArray().sort().join('');
            fs.writeSync(fd, data);
        } else {
            genSequence(batch(words, 1000)).forEach(w => fs.writeSync(fd, w.join('')));
        }

        fs.closeSync(fd);
    });

commander.parse(process.argv);

if (!commander.args.length) {
    commander.help();
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