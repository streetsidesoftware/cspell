#!/usr/bin/env node

import assert from 'node:assert';

import { getPipes } from './dist/index.js';

async function t() {
    const pipes = await getPipes();

    assert(typeof pipes.opFirst === 'function');
}

t();
