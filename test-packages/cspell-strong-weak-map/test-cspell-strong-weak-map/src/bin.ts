import assert from 'node:assert';

import { run } from './index.js';

assert(typeof run === 'function');
assert(run());
console.log('done.');
