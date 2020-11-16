#!/usr/bin/env node

'use strict';

const app = require('./dist/app');
const program = require('commander');

app.run(program, process.argv).catch((e) => {
    if (!(e instanceof program.CommanderError) && !(e instanceof app.CheckFailed)) {
        console.log(e);
    }
    process.exitCode = 1;
});
