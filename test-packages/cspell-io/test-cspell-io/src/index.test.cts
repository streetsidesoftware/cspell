import { describe, expect, test } from 'vitest';

import { run } from './index.js';

describe('index', () => {
    test('run', async () => {
        expect(await run(__filename)).toEqual(expect.stringContaining('this bit of text'));
    });
});
