import { describe, expect, test } from 'vitest';

import { run } from './index.js';

describe('index', () => {
    test('run', async () => {
        expect(await run(import.meta.url)).toEqual(expect.stringContaining('this bit of text'));
    });
});
