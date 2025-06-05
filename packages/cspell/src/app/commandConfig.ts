import type { Command } from 'commander';

import { collect, crOpt } from './commandHelpers.js';
import { UpdateConfigOptions } from './config/options.js';
import { updateConfig } from './config/updateConfig.js';

export function commandInit(prog: Command): Command {
    const command = prog
        .command('config')
        .description('Update a CSpell configuration file.')
        .option('-c, --config <path>', 'Path to the CSpell configuration file.')
        .option('--import <path|package>', 'Import a configuration file or dictionary package.', collect)
        .option('--locale <locale>', 'Define the locale to use when spell checking (e.g., en, en-US, de).')
        .addOption(crOpt('--dictionary <dictionary>', 'Enable a dictionary.', collect).default(undefined))
        .addOption(crOpt('--comments', 'Add comments to the config file.').default(undefined).hideHelp())
        .option('--no-comments', 'Do not add comments to the config file.')
        .action((options: UpdateConfigOptions) => {
            return updateConfig(options);
        });

    return command;
}
