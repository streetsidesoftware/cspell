#!/usr/bin/env node

'use strict';

import { run } from './dist/app';
import program, { CommanderError } from 'commander';

run(program, process.argv).catch(e => {
    if (!(e instanceof CommanderError)) {
        console.log(e);
    }
    process.exit(1);
});
