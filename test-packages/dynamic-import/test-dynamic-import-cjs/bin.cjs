#!/usr/bin/env node

const assert = require('node:assert');
const { getPipes } = require('./dist/index');

async function t() {
    const pipes = await getPipes();

    assert(typeof pipes.opFirst === 'function');
}

t();
