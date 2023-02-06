import { program } from 'commander';

import * as commandWords from './commandWords';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageInfo = require('../package.json');
const version = packageInfo['version'];

program.version(version);

program.addCommand(commandWords.getCommand());
program.showHelpAfterError();

program.parseAsync(process.argv);
