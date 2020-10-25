import { check, CheckOptions } from './check';
import { addRepository, listRepositories } from './repositoryHelper';
import { program, Command } from 'commander';

function run(program: Command) {

    program.command('check [pattern]')
        .option('-u, --update', 'Update snapshot', false)
        .option('-f, --fail', 'Fail on first error.', false)
        .description('Run the integration tests, checking the spelling results against the various repositories', {
            pattern: 'Only check repositories whose name contain the pattern.'
        })
        .action((pattern: string | undefined, options: CheckOptions) => {
            check(pattern || '', options)
        })

    program.command('list [pattern]')
        .description('List configured repositories.', {
            pattern: 'GitHub Url'
        })
        .action((pattern?: string) => {
            listRepositories(pattern);
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

run(program as Command);
