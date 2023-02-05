import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import type * as helloWorld from '../fixtures/hello_world.mjs';
import { dynamicImport } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function oc(obj: unknown) {
    return expect.objectContaining(obj);
}

describe('index', () => {
    test.each`
        moduleName                                                            | parents
        ${'../fixtures/hello_world.mjs'}                                      | ${undefined}
        ${'./hello_world.mjs'}                                                | ${[path.join(__dirname, '../fixtures')]}
        ${'./hello_world.mjs'}                                                | ${path.join(__dirname, '../fixtures')}
        ${'./hello_world.mjs'}                                                | ${pathToFileURL(path.join(__dirname, '../fixtures/'))}
        ${'./hello_world.mjs'}                                                | ${[__dirname, path.join(__dirname, '../fixtures')]}
        ${path.join(__dirname, '../fixtures/hello_world.mjs')}                | ${undefined}
        ${pathToFileURL(path.join(__dirname, '../fixtures/hello_world.mjs'))} | ${undefined}
    `('dynamicImportFrom $moduleName $parents', async ({ moduleName, parents }) => {
        const pModule = dynamicImport<typeof helloWorld>(moduleName, parents);
        const m = await pModule;
        expect(m.sayHello).toBeTypeOf('function');
    });

    test.each`
        moduleName             | parents        | expected
        ${'./hello_world.mjs'} | ${undefined}   | ${oc({ message: expect.stringMatching(/^Failed to load url/), code: 'ERR_MODULE_NOT_FOUND' })}
        ${'./hello_world.mjs'} | ${[__dirname]} | ${oc({ message: expect.stringMatching(/^Cannot find module/), code: 'ERR_MODULE_NOT_FOUND' })}
    `('dynamicImportFrom NOT FOUND $moduleName $parents', async ({ moduleName, parents, expected }) => {
        const pModule = dynamicImport<typeof helloWorld>(moduleName, parents);
        await expect(pModule).rejects.toBeInstanceOf(Error);
        await expect(pModule).rejects.toEqual(expected);
    });
});
