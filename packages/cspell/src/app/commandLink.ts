import type { Command } from 'commander';

import {
    addPathsToGlobalImports,
    addPathsToGlobalImportsResultToTable,
    listGlobalImports,
    listGlobalImportsResultToTable,
    removePathsFromGlobalImports,
} from './link.js';
import { CheckFailed } from './util/errors.js';
import { tableToLines } from './util/table.js';

export function commandLink(prog: Command): Command {
    const linkCommand = prog
        .command('link')
        .description('Link dictionaries and other settings to the cspell global config.');

    linkCommand
        .command('list', { isDefault: true })
        .alias('ls')
        .description('List currently linked configurations.')
        .action(async () => {
            const imports = await listGlobalImports();
            const table = listGlobalImportsResultToTable(imports.list);
            tableToLines(table).forEach((line) => console.log(line));
            return;
        });

    linkCommand
        .command('add <dictionaries...>')
        .alias('a')
        .description('Add dictionaries any other settings to the cspell global config.')
        .action(async (dictionaries: string[]) => {
            const r = await addPathsToGlobalImports(dictionaries);
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
        .action(async (dictionaries: string[]) => {
            const r = await removePathsFromGlobalImports(dictionaries);
            console.log('Removing:');
            if (r.error) {
                throw new CheckFailed(r.error, 1);
            }
            r.removed.map((f) => console.log(f));
            return;
        });

    return linkCommand;
}
