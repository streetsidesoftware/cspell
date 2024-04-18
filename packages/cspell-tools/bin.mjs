#!/usr/bin/env node

import { CommanderError, program } from 'commander';

import { run } from './dist/app.js';

run(program, process.argv).catch((e) => {
    if (!(e instanceof CommanderError)) {
        console.log(e);
    } else {
        console.log(e.message);
    }
    process.exitCode = 1;
});
