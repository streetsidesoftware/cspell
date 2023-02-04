import { dynamicImportFrom } from './lib/index.js';
import { pathToFileURL, fileURLToPath } from 'node:url';
import * as path from 'node:path';

const fixtures = pathToFileURL('./fixtures/');
callHello(pathToFileURL('./fixtures/hello_world.mjs'));
callHello(path.resolve('./fixtures/hello_world.mjs'));
callHello('./hello_world.mjs', [fixtures]);
callHello('./hello_world.mjs', [fileURLToPath(fixtures)]);
callHello(pathToFileURL('./fixtures/hello_world.mjs'), [fileURLToPath(fixtures)]);

async function callHello(file, paths) {
    console.log('%o %o', file.toString(), paths?.toString());
    (await dynamicImportFrom(file, paths)).sayHello('Bob.');
}
