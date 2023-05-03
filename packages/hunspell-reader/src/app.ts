import { program } from 'commander';
import { readFileSync } from 'fs';

import { getCommand as getDictInfoCommand } from './commandDictInfo.js';
import { getCommand as commandWords } from './commandWords.js';

const pkgRaw = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

const packageInfo = JSON.parse(pkgRaw);
const version = packageInfo['version'];

program.version(version);

program.addCommand(commandWords());
program.addCommand(getDictInfoCommand());
program.showHelpAfterError();

program.parseAsync(process.argv);
