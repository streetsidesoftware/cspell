import { dynamicImport } from '../cjs/index.js';
import { pathToFileURL, fileURLToPath } from 'url';
import * as path from 'path';

const fixtures = pathToFileURL('./fixtures/');

interface Hello {
    sayHello(name: string, showLog?: boolean): string;
}

async function callHello(file: string | URL, paths?: string | URL | (string | URL)[]) {
    // console.log('%o %o', file.toString(), paths?.toString());
    return (await dynamicImport<Hello>(file, paths)).sayHello('Bob.');
}

export function test() {
    return Promise.all([
        callHello(pathToFileURL('./fixtures/hello_world.mjs')),
        callHello(path.resolve('./fixtures/hello_world.mjs')),
        callHello('./hello_world.mjs', [fixtures]),
        callHello('./hello_world.mjs', [fileURLToPath(fixtures)]),
        callHello(pathToFileURL('./fixtures/hello_world.mjs'), [fileURLToPath(fixtures)]),
    ]);
}

export async function callDynamicImport<Module>(
    file: string | URL,
    paths?: string | URL | (string | URL)[]
): Promise<Module> {
    return await dynamicImport<Module>(file, paths);
}
