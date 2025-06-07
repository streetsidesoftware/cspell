import type { Command } from 'commander';

import * as App from './application.mjs';
import { crOpt } from './commandHelpers.js';
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
            crOpt('--path-format <format>', 'Configure how to display the dictionary path.')
                .choices(['hide', 'short', 'long', 'full'])
                .default('long', 'Display most of the path.'),
        )
        .addOption(crOpt('--enabled', 'Show only enabled dictionaries.').default(undefined))
        .addOption(crOpt('--no-enabled', 'Do not show enabled dictionaries.'))
        .option(
            '--locale <locale>',
            'Set language locales. i.e. "en,fr" for English and French, or "en-GB" for British English.',
        )
        .option('--file-type <fileType>', 'File type to use. i.e. "html", "golang", or "javascript".')
        .option('--no-show-location', 'Do not show the location of the dictionary.')
        .option('--show-file-types', 'Show the file types supported by the dictionary.', false)
        .addOption(crOpt('--no-show-file-types', 'Do not show the file types supported by the dictionary.').hideHelp())
        .option('--show-locales', 'Show the language locales supported by the dictionary.', false)
        .addOption(crOpt('--no-show-locales', 'Do not show the locales supported by the dictionary.').hideHelp())
        .addOption(crOpt('--color', 'Force color.').default(undefined))
        .addOption(crOpt('--no-color', 'Turn off color.').default(undefined))
        .addOption(crOpt('--default-configuration', 'Load the default configuration and dictionaries.').hideHelp())
        .addOption(crOpt('--no-default-configuration', 'Do not load the default configuration and dictionaries.'))
        .action(async (options: DictionariesOptions) => {
            const dictionaryPathFormat = isDictionaryPathFormat(options.pathFormat) ? options.pathFormat : 'long';

            const useColor = canUseColor(options.color);
            const listResult = await App.listDictionaries(options);
            emitListDictionariesResults(listResult, {
                cwd: process.cwd(),
                dictionaryPathFormat,
                color: useColor,
                options,
            });
        });
}
