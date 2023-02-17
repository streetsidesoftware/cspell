import { promises as fs } from 'fs';
import { describe, expect, test } from 'vitest';

import { processFile } from './processFile.js';
import { resolveFixture } from './test.util.js';

const ff = resolveFixture;

const oc = (obj: unknown) => expect.objectContaining(obj);

describe('processFile', () => {
    test.each`
        file                           | root                | expected
        ${ff('sample/lib/index.js')}   | ${ff('sample/lib')} | ${oc({ filename: ff('sample/lib/index.mjs'), linesChanged: 1 })}
        ${ff('sample/lib/index.d.ts')} | ${ff('sample/lib')} | ${oc({ filename: ff('sample/lib/index.d.mts'), linesChanged: 3 })}
    `('processFile', async ({ file, root, expected }) => {
        const content = await fs.readFile(file, 'utf8');
        const result = processFile(file, content, root);
        expect(result).toEqual(expected);
        expect(result.content).toMatchSnapshot();
    });

    test.each`
        file                          | root                | expected
        ${ff('sample/lib/image.css')} | ${ff('sample/lib')} | ${{ filename: ff('sample/lib/image.css'), content: '', skipped: true }}
        ${ff('sample/src/index.js')}  | ${ff('sample/lib')} | ${{ filename: ff('sample/src/index.js'), content: '', skipped: true }}
    `('processFile skipped', async ({ file, root, expected }) => {
        const content = '';
        const result = processFile(file, content, root);
        expect(result).toEqual(expected);
    });
});
