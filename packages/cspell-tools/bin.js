#!/usr/bin/env node

'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require('./dist/app');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const program = require('commander');

app.run(program, process.argv).catch((e) => {
    if (!(e instanceof program.CommanderError)) {
        console.log(e);
    }
    process.exit(1);
});
