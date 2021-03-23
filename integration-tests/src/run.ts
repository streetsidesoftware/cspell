import { check } from './check';
import { addRepository, listRepositories } from './repositoryHelper';
import { createCommand } from 'commander';
import * as commander from 'commander';
import os from 'os';

const defaultParallel = Math.max(os.cpus().length / 2, 1);

function processParallelArg(value: string): number {
    const v = parseInt(value, 10);
    return v < 1 ? defaultParallel : v;
}

function run(program: commander.Command) {
    program
        .command('check [patterns...]')
        .option('-u, --update', 'Update snapshot', false)
        .option('-f, --fail', 'Fail on first error.', false)
        .option('-x, --exclude <exclusions...>', 'Exclusions patterns.')
        .option('-p, --parallelLimit <number>', 'Max number of parallel checks.', /^[1-9][0-9]?$/, `${defaultParallel}`)
        .description('Run the integration tests, checking the spelling results against the various repositories', {
            pattern: 'Only check repositories whose name contain the pattern.',
        })
        .action(
            (
                patterns: string[],
                options: {
                    update?: boolean;
                    fail?: boolean;
                    exclude?: string[];
                    parallelLimit: string;
                }
            ) => {
                const { update = false, fail = false, exclude = [] } = options;
                const parallelLimit = processParallelArg(options.parallelLimit);
                return check(patterns || [], { update, fail, exclude, parallelLimit });
            }
        );

    program
        .command('list [patterns...]')
        .option('-x, --exclude <exclusions...>', 'Exclusions patterns.')
        .description('List configured repositories.', {
            pattern: 'GitHub Url',
        })
        .action((patterns: string[] = [], options: { exclude?: string[] }) => {
            const opts = {
                patterns,
                exclude: options?.exclude || [],
            };
            return listRepositories(opts);
        });

    program
        .command('add <url>')
        .description(
            'Add a repository to be checked. Example: add "https://github.com/streetsidesoftware/cspell.git". Note: to adjust the arguments, the configuration is found in `config/config.json`',
            {
                url: 'GitHub Url',
            }
        )
        .action(async (url: string) => {
            await addRepository(console, url);
        });

    program.parseAsync(process.argv);
}

run(createCommand('tester'));
