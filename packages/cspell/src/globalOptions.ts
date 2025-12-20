import type { Command } from 'commander';
import { Option as CommanderOption } from 'commander';

import { parseApplicationFeatureFlags } from './application.mjs';
import { collect } from './commandHelpers.js';
import type { BaseOptions } from './options.js';

export function addGlobalOptionsToAction(command: Command): Command {
    command = command.addOption(
        new CommanderOption('-f,--flag <flag:value>', 'Declare an execution flag value').hideHelp().argParser(collect),
    );

    return command;
}

export function addGlobalOptionsAndHooks(command: Command): Command {
    addGlobalOptionsToAction(command);
    command.hook('preAction', (thisCommand, _actionCommand) => {
        const options = thisCommand.opts<BaseOptions>();
        processGlobalOptions(options);
    });
    return command;
}

export function processGlobalOptions(options: BaseOptions): void {
    parseApplicationFeatureFlags(options.flag);
}
