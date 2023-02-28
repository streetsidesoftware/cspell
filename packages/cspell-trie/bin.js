#!/usr/bin/env node

import * as app from './dist/app.js';
import { program } from 'commander';

try {
    app.run(program, process.argv);
} catch (e) {
    if (!(e instanceof program.CommanderError)) {
        console.log(e);
    }
    process.exitCode = 1;
}
