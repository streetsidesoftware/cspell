#!/usr/bin/env node

// cSpell:ignore findup
import * as commander from 'commander';
import { IterableHunspellReader } from './IterableHunspellReader';
import * as fs from 'fs';
import { uniqueFilter, batch } from './util';
import { genSequence } from 'gensequence';
import { AffWord } from './aff';

const uniqueHistorySize = 500000;

const packageInfo = require('../package.json');
const version = packageInfo['version'];

let displayHelp = true;

commander
    .version(version);

commander
    .command('words <hunspell_dic_file>')
    .option('-o, --output <file>', 'output file - defaults to stdout')
    .option('-s, --sort', 'sort the list of words')
    .option('-u, --unique', 'make sure the words are unique.')
    .option('-l, --lower_case', 'output in lower case')
    .option('-T, --no-transform', 'Do not apply the prefix and suffix transforms.  Root words only.')
    .option('-x, --infix', 'Return words with prefix / suffix breaks. ex: "un<do>ing"')
    .description('Output all the words in the <hunspell.dic> file.')
    .action(async function(hunspellDicFilename, options) {
        displayHelp = false;
        const {
            sort = false,
            unique = false,
            output: outputFile,
            lower_case: lowerCase = false,
            transform = true,
            infix = false,
        } = options;
        const log = (msg: string) => notify(msg, !!outputFile);
        log('Write words');
        log(`Sort: ${yesNo(sort)}`);
        log(`Unique: ${yesNo(unique)}`);
        const baseFile = hunspellDicFilename.replace(/\.(dic|aff)$/, '');
        const dicFile = baseFile + '.dic';
        const affFile = baseFile + '.aff';
        log(`Dic file: ${dicFile}`);
        log(`Aff file: ${affFile}`);
        log(`Generating Words...`);
        const reader = await IterableHunspellReader.createFromFiles(affFile, dicFile);
        const seqToWords = infix ? reader.seqAffWords().map(affWordToInfix) : reader.seqWords();
        const seqWords = transform ? seqToWords : reader.seqRootWords();
        const normalize = lowerCase ? (a: string) => a.toLowerCase() : (a: string) => a;
        const filterUnique = unique ? uniqueFilter(uniqueHistorySize) : (_: string) => true;
        const fd = outputFile ? fs.openSync(outputFile, 'w') : 1;

        const words = seqWords
            .map(a => a.trim())
            .filter(a => !!a)
            .map(normalize)
            .map(a => a + '\n')
            .filter(filterUnique);

        if (sort) {
            log('Sorting...');
            const data = words.toArray().sort().join('');
            fs.writeSync(fd, data);
        } else {
            genSequence(batch(words, 1000)).forEach(w => fs.writeSync(fd, w.join('')));
        }

        fs.closeSync(fd);
        log('Done.');
    });

commander.parse(process.argv);

if (displayHelp) {
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

function affWordToInfix(aff: AffWord): string {
    return aff.prefix + '<' + aff.base + '>' + aff.suffix;
}
