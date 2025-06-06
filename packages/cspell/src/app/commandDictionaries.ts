import type { Command } from 'commander';
import { Option as CommanderOption } from 'commander';

import * as App from './application.mjs';
import { emitListDictionariesResults } from './emitters/dictionaryListEmitter.js';
import { isDictionaryPathFormat } from './emitters/DictionaryPathFormat.js';
import type { DictionariesOptions } from './options.js';
import { canUseColor } from './util/canUseColor.js';

// interface InitOptions extends Options {}

export function commandDictionaries(prog: Command): Command {
    return prog
        .command('dictionaries')
        .description(`List dictionaries`)
        .option(
            '-c, --config <cspell.json>',
            'Configuration file to use.  By default cspell looks for cspell.json in the current directory.',
        )
        .addOption(
            new CommanderOption('--path-format <format>', 'Configure how to display the dictionary path.')
                .choices(['hide', 'short', 'long', 'full'])
                .default('long', 'Display most of the path.'),
        )
        .addOption(new CommanderOption('--color', 'Force color.').default(undefined))
        .addOption(new CommanderOption('--no-color', 'Turn off color.').default(undefined))
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
        .action(async (options: DictionariesOptions) => {
            const dictionaryPathFormat = isDictionaryPathFormat(options.pathFormat) ? options.pathFormat : 'long';

            const useColor = canUseColor(options.color);
            const listResult = await App.listDictionaries(options);
            emitListDictionariesResults(listResult, {
                cwd: process.cwd(),
                dictionaryPathFormat,
                color: useColor,
            });
        });
}
