import type { Command } from 'commander';
import { Option as CommanderOption, program } from 'commander';
import { satisfies as semverSatisfies } from 'semver';

import { commandCheck } from './commandCheck.js';
import { commandDictionaries } from './commandDictionaries.js';
import { commandInit } from './commandInit.js';
import { commandLink } from './commandLink.js';
import { commandLint } from './commandLint.js';
import { commandSuggestion } from './commandSuggestion.js';
import { commandTrace } from './commandTrace.js';
import { npmPackage } from './pkgInfo.js';
import { ApplicationError } from './util/errors.js';

export type { LinterCliOptions as Options } from './options.js';
export { ApplicationError, CheckFailed } from './util/errors.js';

export async function run(command?: Command, argv?: string[]): Promise<void> {
    const prog = command || program;
    const args = argv || process.argv;

    prog.exitOverride();

    prog.version(npmPackage.version).description('Spelling Checker for Code').name('cspell');

    if (!semverSatisfies(process.versions.node, npmPackage.engines.node)) {
        throw new ApplicationError(
            `Unsupported NodeJS version (${process.versions.node}); ${npmPackage.engines.node} is required`,
        );
    }

    const optionFlags = new CommanderOption('-f,--flag <flag:value>', 'Declare an execution flag value')
        .hideHelp()
        .argParser((value: string, prev: undefined | string[]) => prev?.concat(value) || [value]);

    commandLint(prog).addOption(optionFlags);
    commandTrace(prog).addOption(optionFlags);
    commandCheck(prog).addOption(optionFlags);
    commandSuggestion(prog).addOption(optionFlags);
    commandInit(prog).addOption(optionFlags);
    commandLink(prog);
    commandDictionaries(prog);

    prog.exitOverride();
    await prog.parseAsync(args);
}
