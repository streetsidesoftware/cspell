// cSpell:ignore findup
import { Command } from 'commander';

import { parseAffFile } from './affReader.js';
import { affToDicInfo } from './affToDicInfo.js';
import { escapeUnicodeCode } from './textUtils.js';

export function getCommand(): Command {
    const commander = new Command('cspell-dict-info');

    commander
        .arguments('<hunspell_aff_file> <locale>')
        .description('Display the CSpell Dictionary Information')
        .action(action);

    return commander;
}

async function action(hunspellFile: string, locale: string): Promise<void> {
    const baseFile = hunspellFile.replace(/\.(dic|aff)$/, '');
    const affFile = baseFile + '.aff';

    const aff = await parseAffFile(affFile);

    const info = affToDicInfo(aff, locale);

    const rawJson = JSON.stringify(info, null, 2);
    console.log(escapeUnicodeCode(rawJson));
}
