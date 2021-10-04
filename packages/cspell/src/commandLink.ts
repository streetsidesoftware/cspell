import { Command } from 'commander';
import {
    addPathsToGlobalImports,
    addPathsToGlobalImportsResultToTable,
    listGlobalImports,
    listGlobalImportsResultToTable,
    removePathsFromGlobalImports,
} from './link';
import { CheckFailed } from './util/errors';
import { tableToLines } from './util/table';

export function commandLink(prog: Command): Command {
    const linkCommand = prog
        .command('link')
        .description('Link dictionaries any other settings to the cspell global config.');

    linkCommand
        .command('list', { isDefault: true })
        .alias('ls')
        .description('List currently linked configurations.')
        .action(() => {
            const imports = listGlobalImports();
            const table = listGlobalImportsResultToTable(imports.list);
            tableToLines(table).forEach((line) => console.log(line));
            return;
        });

    linkCommand
        .command('add <dictionaries...>')
        .alias('a')
        .description('Add dictionaries any other settings to the cspell global config.')
        .action((dictionaries: string[]) => {
            const r = addPathsToGlobalImports(dictionaries);
            const table = addPathsToGlobalImportsResultToTable(r);
            console.log('Adding:');
            tableToLines(table).forEach((line) => console.log(line));
            if (r.error) {
                throw new CheckFailed(r.error, 1);
            }
            return;
        });

    linkCommand
        .command('remove <paths...>')
        .alias('r')
        .description('Remove matching paths / packages from the global config.')
        .action((dictionaries: string[]) => {
            const r = removePathsFromGlobalImports(dictionaries);
            console.log('Removing:');
            if (r.error) {
                throw new CheckFailed(r.error, 1);
            }
            r.removed.map((f) => console.log(f));
            return;
        });

    return linkCommand;
}
