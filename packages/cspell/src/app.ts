import type { Command } from 'commander';
import { program } from 'commander';
import { satisfies as semverSatisfies } from 'semver';
import { commandCheck } from './commandCheck';
import { commandLink } from './commandLink';
import { commandLint } from './commandLint';
import { commandSuggestions } from './commandSuggestions';
import { commandTrace } from './commandTrace';
import { ApplicationError } from './util/errors';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require('../package.json');

export { LinterCliOptions as Options } from './options';
export { CheckFailed } from './util/errors';

export async function run(command?: Command, argv?: string[]): Promise<void> {
    const prog = command || program;
    const args = argv || process.argv;

    prog.exitOverride();

    prog.version(npmPackage.version).description('Spelling Checker for Code').name('cspell');

    if (!semverSatisfies(process.versions.node, npmPackage.engines.node)) {
        throw new ApplicationError(
            `Unsupported NodeJS version (${process.versions.node}); ${npmPackage.engines.node} is required`
        );
    }

    commandLint(prog);
    commandTrace(prog);
    commandCheck(prog);
    commandLink(prog);
    commandSuggestions(prog);

    /*
        program
            .command('init')
            .description('(Alpha) Initialize a cspell.json file.')
            .option('-o, --output <cspell.json>', 'define where to write file.')
            .option('--extends <cspell.json>', 'extend an existing cspell.json file.')
            .action((options: InitOptions) => {
                showHelp = false;
                CSpellApplication.createInit(options).then(
                    () => process.exit(0),
                    () => process.exit(1)
                );
                console.log('Init');
            });
    */
    prog.exitOverride();
    await prog.parseAsync(args);
}
