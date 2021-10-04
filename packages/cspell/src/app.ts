import * as commander from 'commander';
import * as path from 'path';
import { commandCheck } from './commandCheck';
import { commandLink } from './commandLink';
import { commandLint } from './commandLint';
import { commandTrace } from './commandTrace';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require(path.join(__dirname, '..', 'package.json'));

export { Options } from './commandLint';
export { CheckFailed } from './util/errors';

export async function run(program?: commander.Command, argv?: string[]): Promise<void> {
    const prog = program || commander.program;
    const args = argv || process.argv;

    prog.exitOverride();

    prog.version(npmPackage.version)
        .description('Spelling Checker for Code')
        .name('cspell')
        .option('--no-color', 'Turn off color.')
        .option('--color', 'Force color');

    commandLint(prog);
    commandTrace(prog);
    commandCheck(prog);
    commandLink(prog);

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
