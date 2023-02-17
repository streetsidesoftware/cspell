import chalk from 'chalk';
import type { Command } from 'commander';
import { program as defaultCommand } from 'commander';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { findFiles } from './findFiles.js';
import type { Options as ProcessFilesOptions } from './processFiles.js';
import { processFiles } from './processFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function version(): Promise<string> {
    const pathPackageJson = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(await fs.readFile(pathPackageJson, 'utf8'));
    return (typeof packageJson === 'object' && packageJson?.version) || '0.0.0';
}

interface CliOptions {
    mustFindFiles?: boolean;
    root?: string;
    output?: string;
    color?: boolean;
    keep?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
}

export async function app(program = defaultCommand): Promise<Command> {
    program
        .name('js2mjs')
        .description('Rename ESM .js files to .mjs')
        .argument('<files...>', 'The files to rename.')
        .option('-k, --keep', 'Keep the original files.')
        .option('-o, --output <dir>', 'The output directory.')
        .option('--root <dir>', 'The root directory.')
        .option('--no-must-find-files', 'No error if files are not found.')
        .option('--dry-run', 'Dry Run do not update files.')
        .option('--color', 'Force color.')
        .option('--no-color', 'Do not use color.')
        .option('-v, --verbose', 'Verbose mode')
        .version(await version())
        .action(async (globs: string[], optionsCli: CliOptions, _command: Command) => {
            // console.log('Options: %o', optionsCli);
            program.showHelpAfterError(false);
            if (optionsCli.color !== undefined) {
                chalk.level = optionsCli.color ? 3 : 0;
            }
            const files = await findFiles(globs, { cwd: optionsCli.root });
            if (!files.length && optionsCli.mustFindFiles) {
                program.error('No files found.');
            }
            function logger(msg: string) {
                if (optionsCli.dryRun || optionsCli.verbose) {
                    console.log(msg);
                }
            }
            const processOptions: ProcessFilesOptions = {
                keep: optionsCli.keep,
                output: optionsCli.output,
                root: optionsCli.root,
                progress: logger,
                dryRun: optionsCli.dryRun || false,
            };
            await processFiles(files, processOptions);
            logger(chalk.green('done.'));
        });

    program.showHelpAfterError();
    return program;
}

export async function run(argv?: string[], program?: Command): Promise<void> {
    const prog = await app(program);
    await prog.parseAsync(argv);
}
