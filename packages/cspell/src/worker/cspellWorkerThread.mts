import assert from 'node:assert';
import { isMainThread, parentPort } from 'node:worker_threads';

import { spellCheckDocument } from 'cspell-lib';

import { RPCServer } from '../rpc/index.js';
import type { CSpellWorkerAPI } from './api.js';

assert(!isMainThread, 'cspellWorker should not be run in the main thread.');
assert(parentPort, 'cspellWorker requires a parent port to communicate.');

const api: CSpellWorkerAPI = {
    spellCheckDocument,
};

new RPCServer<CSpellWorkerAPI>(parentPort, api);
