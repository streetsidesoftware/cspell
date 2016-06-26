import * as commander from 'commander';
import { HunspellReader } from './HunspellReader';
const findup = require('findup-sync');

const packageInfo = require(findup('package.json'));
const version = packageInfo['version'];
commander
    .version(version);

commander
    .command('words <hunspell_dic_file>')
    .description('list all the words in the <hunspell.dic> file.')
    .action(hunspellDicFilename => {
        const baseFile = hunspellDicFilename.replace(/(\.dic)?$/, '');
        const dicFile = baseFile + '.dic';
        const affFile = baseFile + '.aff';
        const reader = new HunspellReader(affFile, dicFile);
        reader
            .readWords()
            .subscribe(
                word => console.log(word),
                error => console.log(error)
            );
    });

commander.parse(process.argv);

if (!commander.args.length) {
    commander.help();
}