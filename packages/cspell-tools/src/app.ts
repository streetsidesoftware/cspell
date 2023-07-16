// For large dictionaries, it is necessary to increase the memory limit.

import type * as program from 'commander';
import { CommanderError, Option } from 'commander';
import { readFileSync } from 'fs';

import type { CompileAppOptions, CompileTrieAppOptions } from './AppOptions.js';
import { build } from './build.js';
import { processCompileAction } from './compile.js';
import * as compiler from './compiler/index.js';
import { logWithTimestamp } from './compiler/logWithTimestamp.js';
import type { FeatureFlags } from './FeatureFlags/index.js';
import { gzip } from './gzip/index.js';
import { reportCheckChecksumFile, reportChecksumForFiles, updateChecksumForFiles } from './shasum/shasum.js';
import { toError } from './util/errors.js';

const npmPackageRaw = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const npmPackage = JSON.parse(npmPackageRaw);

compiler.setLogger(logWithTimestamp);

function collect(value: string, previous: string[]) {
    return previous.concat([value]);
}

function addCompileOptions(compileCommand: program.Command): program.Command {
    return compileCommand
        .option(
            '-o, --output <path>',
            'Specify the output directory, otherwise files are written back to the same location.',
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
            [],
        )
        .option('--trie3', 'Use file format trie3', false)
        .option('--trie4', 'Use file format trie4', false)
        .option('--trie-base <number>', 'Advanced: Set the trie base number. A value between 10 and 36')
        .option(
            '--list-file <filename...>',
            'Path to a file that contains the list of files to compile. A list file contains one file per line.',
        )
        .option(
            '--init',
            'Create a build command `cspell-tools.config.yaml` file based upon the options given instead of building.',
        );
}

interface ShasumOptions {
    check?: string | undefined;
    update?: string | undefined;
    root?: string | undefined;
    listFile?: string[] | undefined;
}

export async function run(program: program.Command, argv: string[], flags?: FeatureFlags): Promise<void> {
    async function handleGzip(files: string[]): Promise<void> {
        try {
            await gzip(files);
        } catch (error) {
            const err = toError(error);
            program.error(err.message);
        }
    }

    async function shasum(files: string[], options: ShasumOptions): Promise<void> {
        const report = options.check
            ? await reportCheckChecksumFile(options.check, files, options)
            : options.update
            ? await updateChecksumForFiles(options.update, files, options)
            : await reportChecksumForFiles(files, options);
        console.log('%s', report.report);

        if (!report.passed) {
            throw new CommanderError(1, 'Failed Checksum', 'One or more files had issues.');
        }
    }

    program.exitOverride();

    program.version(npmPackage.version);

    addCompileOptions(program.command('compile [src...]').description('Compile words into a cspell dictionary files.'))
        .option('--trie', 'Compile into a trie file.', false)
        .option('--no-sort', 'Do not sort the result')
        .action((src: string[], options: CompileAppOptions) => {
            return processCompileAction(src, options, flags);
        });

    addCompileOptions(
        program
            .command('compile-trie [src...]')
            .description(
                'Compile words lists or Hunspell dictionary into trie files used by cspell.\nAlias of `compile --trie`',
            ),
    ).action((src: string[], options: CompileTrieAppOptions) => {
        return processCompileAction(src, { ...options, trie: true }, flags);
    });

    program
        .command('build [targets...]')
        .description('Build the targets defined in the run configuration.')
        .option('-c, --config <path to run configuration>', 'Specify the run configuration file.')
        .option('-r, --root <directory>', 'Specify the run directory')
        .action(build);

    program.command('gzip <files...>').description('GZip files while keeping the original.').action(handleGzip);

    program
        .command('shasum [files...]')
        .description('Calculate the checksum for files.')
        .option('--list-file <list-file.txt...>', 'Specify one or more files that contain paths of files to check.')
        .option(
            '-c, --check <checksum.txt>',
            'Verify the checksum of files against those stored in the checksum.txt file.',
        )
        .addOption(
            new Option('-u, --update <checksum.txt>', 'Update checksums found in the file.').conflicts('--check'),
        )
        .option(
            '-r, --root <root>',
            'Specify the root to use for relative paths. The current working directory is used by default.',
        )
        .action(shasum);

    await program.parseAsync(argv);
}
