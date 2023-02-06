import { program } from 'commander';

import { getCommand as getDictInfoCommand } from './commandDictInfo';
import { getCommand as commandWords } from './commandWords';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageInfo = require('../package.json');
const version = packageInfo['version'];

program.version(version);

program.addCommand(commandWords());
program.addCommand(getDictInfoCommand());
program.showHelpAfterError();

program.parseAsync(process.argv);
