import { Command } from 'commander';
import * as App from './application';
import { checkText } from './application';
import { BaseOptions } from './options';
import { CheckFailed } from './util/errors';
import chalk = require('chalk');

export function commandCheck(prog: Command): Command {
    type CheckCommandOptions = BaseOptions;

    return prog
        .command('check <files...>')
        .description('Spell check file(s) and display the result. The full file is displayed in color.')
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.'
        )
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color')
        .action(async (files: string[], options: CheckCommandOptions) => {
            let issueCount = 0;
            for (const filename of files) {
                console.log(chalk.yellowBright(`Check file: ${filename}`));
                console.log();
                try {
                    const result = await checkText(filename, options);
                    for (const item of result.items) {
                        const fn =
                            item.flagIE === App.IncludeExcludeFlag.EXCLUDE
                                ? chalk.gray
                                : item.isError
                                ? chalk.red
                                : chalk.whiteBright;
                        const t = fn(item.text);
                        process.stdout.write(t);
                        issueCount += item.isError ? 1 : 0;
                    }
                    console.log();
                } catch (e) {
                    console.error(`File not found "${filename}"`);
                    throw new CheckFailed('File not found', 1);
                }
                console.log();
            }
            if (issueCount) {
                throw new CheckFailed('Issues found', 1);
            }
        });
}
