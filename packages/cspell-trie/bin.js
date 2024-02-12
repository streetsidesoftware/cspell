#!/usr/bin/env node

import * as app from './dist/app.js';
import { CommanderError, program } from 'commander';

try {
    app.run(program, process.argv);
} catch (e) {
    if (!(e instanceof CommanderError)) {
        console.log(e);
    }
    process.exitCode = 1;
}
