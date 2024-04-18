#!/usr/bin/env node

import assert from 'node:assert';

import { getPipes } from './dist/index.mjs';

async function t() {
    const pipes = await getPipes();

    assert(typeof pipes.opFirst === 'function');
}

t();
