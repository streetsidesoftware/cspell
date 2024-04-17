import chalk from 'chalk';
import type { Command } from 'commander';
import { Option as CommanderOption } from 'commander';

import * as App from './application.js';
import { checkText } from './application.js';
import type { BaseOptions } from './options.js';
import { CheckFailed } from './util/errors.js';

export function commandCheck(prog: Command): Command {
    type CheckCommandOptions = BaseOptions;

    return prog
        .command('check <files...>')
        .description('Spell check file(s) and display the result. The full file is displayed in color.')
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.',
        )
        .option('--validate-directives', 'Validate in-document CSpell directives.')
        .option('--no-validate-directives', 'Do not validate in-document CSpell directives.')
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color')
        .option('--no-exit-code', 'Do not return an exit code if issues are found.')
        .addOption(
            new CommanderOption(
                '--default-configuration',
                'Load the default configuration and dictionaries.',
            ).hideHelp(),
        )
        .addOption(
            new CommanderOption(
                '--no-default-configuration',
                'Do not load the default configuration and dictionaries.',
            ),
        )
        .action(async (files: string[], options: CheckCommandOptions) => {
            const useExitCode = options.exitCode ?? true;
            App.parseApplicationFeatureFlags(options.flag);
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
                } catch {
                    console.error(`File not found "${filename}"`);
                    throw new CheckFailed('File not found', 1);
                }
                console.log();
            }
            if (issueCount) {
                const exitCode = useExitCode ?? true ? 1 : 0;
                throw new CheckFailed('Issues found', exitCode);
            }
        });
}
