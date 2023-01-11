// For large dictionaries, it is necessary to increase the memory limit.

import type * as program from 'commander';
import * as path from 'path';
import type { CompileAppOptions, CompileTrieAppOptions } from './AppOptions';
import * as compiler from './compiler';
import { logWithTimestamp } from './compiler/logWithTimestamp';
import { processCompileAction } from './compile';
import type { FeatureFlags } from './FeatureFlags';
import { build } from './build';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require(path.join(__dirname, '..', 'package.json'));

compiler.setLogger(logWithTimestamp);

function collect(value: string, previous: string[]) {
    return previous.concat([value]);
}

function addCompileOptions(compileCommand: program.Command): program.Command {
    return compileCommand
        .option(
            '-o, --output <path>',
            'Specify the output directory, otherwise files are written back to the same location.'
        )
        .option('-n, --no-compress', 'By default the files are Gzipped, this will turn off GZ compression.')
        .option('-m, --max_depth <limit>', 'Maximum depth to apply suffix rules.')
        .option('-M, --merge <target>', 'Merge all files into a single target file (extensions are applied)')
        .option('--split', 'Split each line', undefined)
        .option('--no-split', 'Treat each line as a dictionary entry, do not split')
        .option('--use-legacy-splitter', 'Do not use legacy line splitter logic.')
        .option('--keep-raw-case', 'Do not normalize words before adding them to dictionary.')
        .option(
            '-x, --experimental <flag>',
            'Experimental flags, used for testing new concepts. Flags: compound',
            collect,
            []
        )
        .option('--trie3', 'Use file format trie3', false)
        .option('--trie4', 'Use file format trie4', false)
        .option('--trie-base <number>', 'Advanced: Set the trie base number. A value between 10 and 36');
}

export async function run(program: program.Command, argv: string[], flags?: FeatureFlags): Promise<void> {
    program.exitOverride();

    program.version(npmPackage.version);

    addCompileOptions(program.command('compile <src...>').description('Compile words into a cspell dictionary files.'))
        .option('--trie', 'Compile into a trie file.', false)
        .option('--no-sort', 'Do not sort the result')
        .action((src: string[], options: CompileAppOptions) => {
            return processCompileAction(src, options, flags);
        });

    addCompileOptions(
        program
            .command('compile-trie <src...>')
            .description(
                'Compile words lists or Hunspell dictionary into trie files used by cspell.\nAlias of `compile --trie`'
            )
    ).action((src: string[], options: CompileTrieAppOptions) => {
        return processCompileAction(src, { ...options, trie: true }, flags);
    });

    program
        .command('build [targets]')
        .description('Build the targets defined in the run configuration.')
        .option('-c, --config <path to run configuration>', 'Specify the run configuration file.')
        .option('-r, --root <directory>', 'Specify the run directory')
        .action(build);

    await program.parseAsync(argv);
}
