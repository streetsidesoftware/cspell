import assert from 'assert';
import { getPipes } from './dist/index.mjs';

async function t() {
    const pipes = await getPipes();

    assert(typeof pipes.opFirst === 'function');
}

await t();
