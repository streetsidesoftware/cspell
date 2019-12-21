#!/usr/bin/env node

'use strict';

const app = require('./dist/app');
const program = require('commander');

app.run(program, process.argv).catch(e => {
    if (!(e instanceof program.CommanderError)) {
        console.log(e);
    }
    process.exit(1);
});
