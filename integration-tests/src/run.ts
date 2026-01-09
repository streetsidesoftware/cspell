import os from 'node:os';
import path from 'node:path';

import type { Command } from 'commander';
import { createCommand, InvalidArgumentError, Option } from 'commander';

import { check } from './check.js';
import type { ListRepositoryOptions } from './repositoryHelper.js';
import { addRepository, listRepositories } from './repositoryHelper.js';

const defaultParallel = Math.max(os.cpus().length / 2, 1);

function processParallelArg(value: number | string): number {
    value = typeof value === 'string' ? Number.parseInt(value, 10) : value;
    return value < 1 ? defaultParallel : value;
}

function validateParallelArg(value: string) {
    // parseInt takes a string and a radix
    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        throw new InvalidArgumentError('Must be a number >= 1');
    }
    return parsedValue;
}

export interface CliOptions {
    /** Only update the snapshot */
    updateSnapshots?: boolean;
    /** Update Repositories to the latest SHA */
    updateRepositories?: boolean;
    /** GitHub Personal Access Token */
    githubToken?: string | undefined;
    /** Exclusion patterns */
    exclude?: string[];
    /** Stop on first error */
    fail?: boolean;
    /** Max number of parallel processes */
    parallelLimit?: number;
    /** Turn on NodeJS --cpu-prof */
    cpuProf?: boolean;
    /** Check the results. */
    checkResults?: boolean;
    /** Show progress */
    progress?: boolean;
    /** Verbose output */
    verbose?: boolean;
}

function run(program: Command) {
    program
        .command('check')
        .argument('[patterns...]', 'Only check repositories whose name contain the pattern.')
        .option('--update-repositories', 'Update Repositories and Snapshots', false)
        .option('-u, --update-snapshots', 'Update Snapshots', false)
        .option('-f, --fail', 'Fail on first error.', false)
        .option('-x, --exclude <exclusions...>', 'Exclusions patterns.')
        .option('--no-check-results', 'Do not check the result against snapshot.')
        .addOption(
            new Option('--progress', 'Show progress during checking.').default(false).implies({ checkResults: false }),
        )
        .addOption(new Option('--verbose', 'Verbose output.').default(false).implies({ checkResults: false }))
        .option(
            '-t, --githubToken <token>',
            'GitHub Personal Access Token. Can also be set via the environment variable GITHUB_TOKEN. Example: -t $(gh auth token)',
        )
        .option('-p, --parallelLimit <number>', 'Max number of parallel checks.', validateParallelArg, defaultParallel)
        .option('--cpu-prof', 'Enable NodeJS CPU Profiling')
        .description('Run the integration tests, checking the spelling results against the various repositories')
        .action((patterns: string[], options: CliOptions) => {
            const {
                updateRepositories: update = false,
                fail = false,
                exclude = [],
                updateSnapshots = false,
                cpuProf = false,
                verbose = false,
                progress = false,
                checkResults = true,
            } = options;
            const parallelLimit = processParallelArg(options.parallelLimit || 0);
            registerToken(options.githubToken);
            return check(patterns || [], {
                update,
                updateSnapshots,
                fail,
                exclude,
                parallelLimit,
                cpuProf,
                verbose,
                progress,
                checkResults,
            });
        });

    interface ListOptions extends Omit<ListRepositoryOptions, 'exclude' | 'patterns'> {
        exclude?: string[];
        githubToken?: string | undefined;
    }

    program
        .command('list')
        .argument('[patterns...]', 'Only repositories whose name contain the pattern.')
        .option('-x, --exclude <exclusions...>', 'Exclusions patterns.')
        .option('-t, --githubToken <token>', 'GitHub Personal Access Token.')
        .option('--dirty', 'Only list dirty repositories.')
        .option('--no-show-is-dirty', 'Do not highlight dirty Repositories.')
        .option('--json', 'Write the output in JSON format.')
        .description('List configured repositories.')
        .action((patterns: string[] = [], options: ListOptions) => {
            const opts = {
                ...options,
                patterns,
                exclude: options?.exclude || [],
            };
            registerToken(options.githubToken);
            return listRepositories(opts);
        });

    program
        .command('add')
        .argument('<url>', 'GitHub Url')
        .option('-b, --branch <branch>', 'Optional branch to use.')
        .option('-t, --githubToken <token>', 'GitHub Personal Access Token')
        .description(
            'Add a repository to be checked.\n' +
                '  Example: add "https://github.com/streetsidesoftware/cspell.git".\n' +
                '  Note: to adjust the arguments, the configuration is found in `config/config.json`',
        )
        .action(async (url: string, options: { branch?: string; githubToken?: string | undefined }) => {
            registerToken(options.githubToken);
            await addRepository(console, url, options.branch);
        });

    program.parseAsync(process.argv);
}

function registerToken(token: string | undefined) {
    if (!token) return;
    process.env['GITHUB_TOKEN'] = token;
}

const cmd = createCommand('tester').description(`Validate CSpell results against various GitHub repositories.
Note: A GitHub Personal Access Token is needed.
  This can be supplied as a command line option or in the $GITHUB_TOKEN environment variable.
  \`gh\` can be used to supply the token:
  GITHUB_TOKEN=$(gh auth token) node ./${path.basename(process.argv[1])}
`);
run(cmd);
