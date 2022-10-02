// For large dictionaries, it is necessary to increase the memory limit.

import { Logger } from './compiler';
import * as compiler from './compiler';
import * as path from 'path';
import * as program from 'commander';
import glob from 'glob';
import { processCompileAction } from './processCompileAction';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const npmPackage = require(path.join(__dirname, '..', 'package.json'));

export function globP(pattern: string): Promise<string[]> {
    // Convert windows separators.
    pattern = pattern.replace(/\\/g, '/');
    return new Promise((resolve, reject) => {
        glob(pattern, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
}

export interface CompileCommonOptions {
    output?: string;
    compress: boolean;
    max_depth?: string;
    merge?: string;
    experimental: string[];
    split?: boolean;
    sort?: boolean;
    keepRawCase?: boolean;
    trie?: boolean;
    trie3?: boolean;
    trie4?: boolean;
    trieBase?: string;
    useLegacySplitter?: boolean;
}

interface CompileOptions extends CompileCommonOptions {
    sort: boolean;
    keepRawCase: boolean;
}

interface CompileTrieOptions extends CompileCommonOptions {
    trie3: boolean;
    trie4: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log: Logger = (message?: any, ...optionalParams: any[]) => {
    console.log(`${new Date().toISOString()} ${message}`, ...optionalParams);
};

compiler.setLogger(log);

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

export function run(program: program.Command, argv: string[]): Promise<void> {
    program.exitOverride();

    return new Promise((resolve, reject) => {
        program.version(npmPackage.version);

        addCompileOptions(
            program.command('compile <src...>').description('Compile words into a cspell dictionary files.')
        )
            .option('--trie', 'Compile into a trie file.', false)
            .option('--no-sort', 'Do not sort the result')
            .action((src: string[], options: CompileOptions) => {
                const result = processCompileAction(src, options);
                resolve(result);
            });

        addCompileOptions(
            program
                .command('compile-trie <src...>')
                .description(
                    'Compile words lists or Hunspell dictionary into trie files used by cspell.\nAlias of `compile --trie`'
                )
        ).action((src: string[], options: CompileTrieOptions) => {
            const result = processCompileAction(src, { ...options, trie: true });
            resolve(result);
        });

        try {
            program.parse(argv);
            if (!argv.slice(2).length) {
                program.help();
            }
        } catch (e) {
            reject(e);
        }

        resolve();
    });
}
