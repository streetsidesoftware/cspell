import { check, CheckOptions } from './check';
import { addRepository, listRepositories } from './repositoryHelper';
import { createCommand } from 'commander';
import * as commander from 'commander';

function run(program: commander.Command) {

    program.command('check [patterns...]')
        .option('-u, --update', 'Update snapshot', false)
        .option('-f, --fail', 'Fail on first error.', false)
        .option('-x, --exclude <exclusions...>', 'Exclusions patterns.')
        .description('Run the integration tests, checking the spelling results against the various repositories', {
            pattern: 'Only check repositories whose name contain the pattern.'
        })
        .action((patterns: string[], options: { update?: boolean, fail?: boolean, exclude?: string[] }) => {
            const { update = false, fail = false, exclude = [] } = options;
            check(patterns || [], { update, fail, exclude })
        })

    program.command('list [patterns...]')
        .option('-x, --exclude <exclusions...>', 'Exclusions patterns.')
        .description('List configured repositories.', {
            pattern: 'GitHub Url'
        })
        .action((patterns: string[] = [], options: { exclude?: string[] }) => {
            const opts = {
                patterns,
                exclude: options?.exclude || []
            }
            listRepositories(opts);
        })

    program.command('add <url>')
        .description('Add a repository to be checked. Example: add "https://github.com/streetsidesoftware/cspell.git". Note: to adjust the arguments, the configuration is found in `config/config.json`', {
            url: 'GitHub Url'
        })
        .action((url: string) => {
            addRepository(url);
        })

    program.parse(process.argv)
}

run(createCommand('tester'));
