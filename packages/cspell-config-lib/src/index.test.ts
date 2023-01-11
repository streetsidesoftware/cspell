import { promises as fs } from 'fs';
import { URI } from 'vscode-uri';

import { fixtures } from './test-helpers/fixtures';
import { copyFile, tempPath } from './test-helpers/util';
import * as index from './index';
import { createReaderWriter } from './index';

describe('index', () => {
    test('index', () => {
        expect(index).toBeDefined();
    });
    test.each`
        value                        | expected
        ${typeof createReaderWriter} | ${'function'}
    `('exports', ({ value, expected }) => {
        expect(value).toEqual(expected);
    });
});

describe('cspell-config', () => {
    test.each`
        fixture                                 | addWords
        ${'package/with-value/package.json'}    | ${['apple']}
        ${'package/without-value/package.json'} | ${['apple']}
        ${'cspell.jsonc'}                       | ${['apple', 'cache']}
        ${'cspell.yaml'}                        | ${['apple', 'cache']}
    `('edit config', async ({ fixture, addWords }) => {
        const fixtureFile = fixtures(fixture);
        const tempFile = tempPath(fixture);
        await copyFile(fixtureFile, tempFile);
        const rw = createReaderWriter();
        const uri = URI.file(tempFile).toString();
        const cfg = await rw.readConfig(uri);
        cfg.addWords(addWords);
        await rw.writeConfig(cfg);
        expect(await fs.readFile(tempFile, 'utf-8')).toMatchSnapshot();
    });
});
