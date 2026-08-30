import assert from 'node:assert';

import { defineConfig } from '@cspell/cspell-types';

assert(typeof defineConfig === 'function');

const sampleConfig = defineConfig({});
assert(defineConfig(sampleConfig) === sampleConfig);
