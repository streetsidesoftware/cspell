import type { AddHelpTextContext, Command } from 'commander';
import { program } from 'commander';
import { satisfies as semverSatisfies } from 'semver';

import { commandCheck } from './commandCheck.js';
import { commandDictionaries } from './commandDictionaries.js';
import { commandInit } from './commandInit.js';
import { commandLink } from './commandLink.js';
import { commandLint } from './commandLint.js';
import { commandSuggestion } from './commandSuggestion.js';
import { commandTrace } from './commandTrace.js';
import { addGlobalOptionsAndHooks, addGlobalOptionsToAction } from './globalOptions.js';
import { npmPackage } from './pkgInfo.js';
import { ApplicationError } from './util/errors.js';
import { getOutputWidth } from './util/outputWidth.js';

export type { LinterCliOptions as Options } from './options.js';
export { ApplicationError, CheckFailed } from './util/errors.js';

export async function run(command?: Command, argv?: string[]): Promise<void> {
    const prog = command || program;
    const args = argv || process.argv;

    prog.exitOverride();
    prog.configureOutput({
        getOutHelpWidth: () => getOutputWidth(process.stdout) ?? 80,
        getErrHelpWidth: () => getOutputWidth(process.stderr) ?? 80,
    });
    // Commander stops wrapping when the description column is under 40 wide; that is too wide for narrow output.
    prog.configureHelp({ minWidthToWrap: 20 });

    prog.version(npmPackage.version).description('Spelling Checker for Code').name('cspell');

    if (!semverSatisfies(process.versions.node, npmPackage.engines.node)) {
        throw new ApplicationError(
            `Unsupported NodeJS version (${process.versions.node}); ${npmPackage.engines.node} is required`,
        );
    }

    const lintCommand = addGlobalOptionsToAction(commandLint(prog, { isDefault: true }));
    prog.addHelpText('after', (context) => defaultCommandOptionsHelp(context, lintCommand));
    addGlobalOptionsToAction(commandTrace(prog));
    addGlobalOptionsToAction(commandCheck(prog));
    addGlobalOptionsToAction(commandSuggestion(prog));
    addGlobalOptionsToAction(commandInit(prog));
    commandLink(prog);
    addGlobalOptionsToAction(commandDictionaries(prog));

    addGlobalOptionsAndHooks(prog);

    prog.exitOverride();
    await prog.parseAsync(args);
}

/**
 * `cspell --help` is answered by the program, not the default command,
 * so list the default command's options here.
 */
function defaultCommandOptionsHelp(context: AddHelpTextContext, defaultCommand: Command): string {
    const helper = defaultCommand.createHelp();
    helper.prepareContext({ helpWidth: getOutputWidth(context.error ? process.stderr : process.stdout) ?? 80 });
    const termWidth = helper.longestOptionTermLength(defaultCommand, helper);
    const items = helper
        .visibleOptions(defaultCommand)
        .filter((option) => option.long !== '--help')
        .map((option) =>
            helper.formatItem(
                helper.styleOptionTerm(helper.optionTerm(option)),
                termWidth,
                helper.styleOptionDescription(helper.optionDescription(option)),
                helper,
            ),
        );
    const heading = `Options for "${defaultCommand.name()}" (the default command):`;
    return '\n' + helper.formatItemList(heading, items, helper).join('\n');
}
