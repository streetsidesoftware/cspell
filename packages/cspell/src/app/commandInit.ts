import type { Command } from 'commander';

import { createInit } from './application.mjs';
import { collect, crOpt } from './commandHelpers.js';
import type { InitOptions } from './config/index.js';

export function commandInit(prog: Command): Command {
    const command = prog
        .command('init')
        .description('Initialize a CSpell configuration file.')
        .option('-o, --output <path>', 'Define where to write file.')
        .addOption(
            crOpt('--format <format>', 'Define the format of the file.')
                .choices(['yaml', 'json', 'jsonc'])
                .default('yaml'),
        )
        .option('--import <path|package>', 'Import a configuration file or dictionary package.', collect)
        .option('--locale <locale>', 'Define the locale to use when spell checking (e.g., en, en-US, de).')
        .addOption(crOpt('--dictionary <dictionary>', 'Enable a dictionary.', collect).default(undefined))
        .addOption(crOpt('--comments', 'Add comments to the config file.').default(undefined).hideHelp())
        .option('--no-comments', 'Do not add comments to the config file.')
        .option('--no-schema', 'Do not add the schema reference to the config file.')
        .action((options: InitOptions) => {
            return createInit(options);
        });

    return command;
}
