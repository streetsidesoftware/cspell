import os from 'os';
import { createCommand } from 'commander';
import * as commander from 'commander';

import { check } from './check';
import type { ListRepositoryOptions } from './repositoryHelper';
import { addRepository, listRepositories } from './repositoryHelper';

const defaultParallel = Math.max(os.cpus().length / 2, 1);

function processParallelArg(value: string): number {
    const v = parseInt(value, 10);
    return v < 1 ? defaultParallel : v;
}

function validateParallelArg(value: string) {
    // parseInt takes a string and a radix
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue < 1) {
        throw new commander.InvalidArgumentError('Must be a number >= 1');
    }
    return value;
}

function run(program: commander.Command) {
    program
        .command('check')
        .argument('[patterns...]', 'Only check repositories whose name contain the pattern.')
        .option('--update-repositories', 'Update Repositories and Snapshots', false)
        .option('-u, --update-snapshots', 'Update Snapshots', false)
        .option('-f, --fail', 'Fail on first error.', false)
        .option('-x, --exclude <exclusions...>', 'Exclusions patterns.')
        .option('-t, --githubToken <token>', 'GitHub Personal Access Token')
        .option(
            '-p, --parallelLimit <number>',
            'Max number of parallel checks.',
            validateParallelArg,
            `${defaultParallel}`
        )
        .description('Run the integration tests, checking the spelling results against the various repositories')
        .action(
            (
                patterns: string[],
                options: {
                    updateRepositories?: boolean;
                    updateSnapshots?: boolean;
                    fail?: boolean;
                    exclude?: string[];
                    parallelLimit: string;
                    githubToken?: string | undefined;
                }
            ) => {
                const {
                    updateRepositories: update = false,
                    fail = false,
                    exclude = [],
                    updateSnapshots = false,
                } = options;
                const parallelLimit = processParallelArg(options.parallelLimit);
                registerToken(options.githubToken);
                return check(patterns || [], { update, updateSnapshots, fail, exclude, parallelLimit });
            }
        );

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
                '  Note: to adjust the arguments, the configuration is found in `config/config.json`'
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
`);
run(cmd);
