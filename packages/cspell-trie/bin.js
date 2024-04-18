#!/usr/bin/env node

import { CommanderError, program } from 'commander';

import * as app from './dist/app.js';

try {
    app.run(program, process.argv);
} catch (e) {
    if (!(e instanceof CommanderError)) {
        console.log(e);
    }
    process.exitCode = 1;
}
