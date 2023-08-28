import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type * as helloWorld from '../../fixtures/hello_world.js';
import { callDynamicImport as dynamicImport, test as testHello } from './helper.js';

const __root = path.join(__dirname, '../..');
const __fixtures = path.join(__root, 'fixtures');

const __fixtures_relative = path.relative(__dirname, __fixtures);

function oc(obj: unknown) {
    return expect.objectContaining(obj);
}

describe('index', () => {
    test.each`
        moduleName                                                      | parents
        ${path.join(__fixtures_relative, 'hello_world.mjs')}            | ${undefined}
        ${'./hello_world.mjs'}                                          | ${[__fixtures]}
        ${'./hello_world.mjs'}                                          | ${__fixtures}
        ${'./hello_world.mjs'}                                          | ${pathToFileURL(__fixtures + '/')}
        ${'./hello_world.mjs'}                                          | ${[__dirname, __fixtures]}
        ${path.join(__root, 'fixtures/hello_world.mjs')}                | ${undefined}
        ${pathToFileURL(path.join(__root, 'fixtures/hello_world.mjs'))} | ${undefined}
    `('dynamicImportFrom $moduleName $parents', async ({ moduleName, parents }) => {
        const pModule = dynamicImport<typeof helloWorld>(moduleName, parents);
        const m = await pModule;
        expect(m.sayHello).toBeTypeOf('function');
    });

    test.each`
        moduleName             | parents        | expected
        ${'./hello_world.mjs'} | ${undefined}   | ${oc({ message: expect.stringMatching(/^Failed to load url/) })}
        ${'./hello_world.mjs'} | ${[__dirname]} | ${oc({ message: expect.stringMatching(/^Cannot find module/), code: 'ERR_MODULE_NOT_FOUND' })}
    `('dynamicImportFrom NOT FOUND $moduleName $parents', async ({ moduleName, parents, expected }) => {
        const pModule = dynamicImport<typeof helloWorld>(moduleName, parents);
        await expect(pModule).rejects.toBeInstanceOf(Error);
        await expect(pModule).rejects.toEqual(expected);
    });

    test('testHello', () => {
        expect(testHello()).resolves.toEqual(expect.arrayContaining(['Hello Bob.']));
    });
});
