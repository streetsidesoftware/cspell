import chalk from 'chalk';
import type { Command } from 'commander';
import { Option as CommanderOption } from 'commander';

import * as App from './application.mjs';
import { checkText } from './application.mjs';
import { console } from './console.js';
import type { BaseOptions } from './options.js';
import { CheckFailed } from './util/errors.js';

type CheckCommandOptions = BaseOptions & { json: boolean };

export function commandCheck(prog: Command): Command {
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
        .option('--json', 'Output results in JSON format.')
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
            const issueCount = options.json
                ? await processRequestJSON(files, options)
                : await processRequestAnsi(files, options);
            if (issueCount) {
                const exitCode = (useExitCode ?? true) ? 1 : 0;
                throw new CheckFailed('Issues found', exitCode);
            }
        });
}

async function processRequestAnsi(files: string[], options: CheckCommandOptions): Promise<number> {
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
            const message = isErrNoEnt(e) ? 'File not found' : String(e);
            console.error(`${message} "${filename}"`);
            throw new CheckFailed(message, 1);
        }
        console.log();
    }
    return issueCount;
}

interface FileResult {
    filename: string;
    items?: App.CheckTextResult['items'];
    error?: string;
}

async function processRequestJSON(files: string[], options: CheckCommandOptions): Promise<number> {
    let issueCount = 0;

    const results: FileResult[] = [];

    for (const filename of files) {
        try {
            const result = await checkText(filename, options);
            results.push({
                filename,
                items: result.items,
            });
            for (const item of result.items) {
                issueCount += item.isError ? 1 : 0;
            }
        } catch (e) {
            const message = isErrNoEnt(e) ? 'File not found' : String(e);
            results.push({ filename, error: message });
            console.log(JSON.stringify(results, undefined, 2));
            throw new CheckFailed(message, 1);
        }
    }

    console.log(JSON.stringify(results, undefined, 2));
    return issueCount;
}

function isErrNoEnt(error: unknown): boolean {
    return (error as NodeJS.ErrnoException)?.code === 'ENOENT';
}
