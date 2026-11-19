import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { defaultConfigFilenames } from 'cspell-lib';
import { describe, expect, test } from 'vitest';

import { calcFileConfigSearchStops, nestedConfigFolders, resolveStopFolders } from './configSearchStops.js';

const projectRoot = path.resolve('/project');

describe('resolveStopFolders', () => {
    test.each`
        folders          | expected
        ${undefined}     | ${undefined}
        ${[]}            | ${undefined}
        ${['.']}         | ${[dirUrl(process.cwd())]}
        ${['./']}        | ${[dirUrl(process.cwd())]}
        ${['..', 'src']} | ${[dirUrl(path.resolve('..')), dirUrl(path.resolve('src'))]}
    `('resolveStopFolders $folders', ({ folders, expected }) => {
        expect(resolveStopFolders(folders)).toEqual(expected);
    });
});

describe('calcFileConfigSearchStops', () => {
    test.each`
        desc                                                       | given                           | namedConfig                           | expected
        ${'no stops without a named config or a stop'}             | ${undefined}                    | ${undefined}                          | ${undefined}
        ${'the given stops without a named config'}                | ${['src']}                      | ${undefined}                          | ${['src']}
        ${'the root once when the named config is in it'}          | ${undefined}                    | ${'cspell.custom.json'}               | ${['!.']}
        ${'the root and the named config folder'}                  | ${undefined}                    | ${'packages/foo/cspell.strict.json'}  | ${['!.', '!packages/foo']}
        ${'the folder above for a config in .vscode'}              | ${undefined}                    | ${'packages/foo/.vscode/cspell.json'} | ${['!.', '!packages/foo']}
        ${'the folder above for a config in .config'}              | ${undefined}                    | ${'.config/cspell.json'}              | ${['!.']}
        ${'a folder outside the root for a config outside'}        | ${undefined}                    | ${'../configs/cspell.json'}           | ${['!.', '!../configs']}
        ${'a given stop at the root replaces the root'}            | ${['.']}                        | ${'cspell.custom.json'}               | ${['.']}
        ${'a given stop above the root replaces both'}             | ${['..']}                       | ${'packages/foo/cspell.strict.json'}  | ${['..']}
        ${'a given stop between replaces the named config folder'} | ${['packages']}                 | ${'packages/foo/cspell.strict.json'}  | ${['packages', '!.']}
        ${'a given stop below both replaces neither'}              | ${['packages/foo/src']}         | ${'packages/foo/cspell.strict.json'}  | ${['packages/foo/src', '!.', '!packages/foo']}
        ${'a sibling folder is not a parent'}                      | ${['packages/fo']}              | ${'packages/foo/cspell.strict.json'}  | ${['packages/fo', '!.', '!packages/foo']}
        ${'several given stops'}                                   | ${['packages/a', 'packages/b']} | ${'cspell.ci.json'}                   | ${['packages/a', 'packages/b', '!.']}
    `('calcFileConfigSearchStops $desc', ({ given, namedConfig, expected }) => {
        const givenStops = given?.map((folder: string) => dirUrl(path.resolve(projectRoot, folder)));
        const namedConfigUrl = namedConfig ? pathToFileURL(path.resolve(projectRoot, namedConfig)) : undefined;
        const stops = calcFileConfigSearchStops(givenStops, dirUrl(projectRoot), namedConfigUrl);
        expect(stops?.map(toShortStop)).toEqual(expected);
    });
});

describe('Validate cspell-lib assumptions', () => {
    test('every folder in the config search places is a nested config folder', () => {
        const folders = new Set(
            defaultConfigFilenames.filter((name) => name.includes('/')).map((name) => name.replace(/[^/]*$/, '')),
        );
        expect(folders.size).toBeGreaterThan(0);
        expect([...folders].filter((folder) => !nestedConfigFolders.has(folder))).toEqual([]);
    });
});

function dirUrl(folder: string): URL {
    return pathToFileURL(folder + path.sep);
}

/**
 * Write a stop relative to the project root, with `!` in front of an exclusive one.
 */
function toShortStop(stop: URL | { url: URL; exclusive?: boolean | undefined }): string {
    const url = stop instanceof URL ? stop : stop.url;
    const prefix = stop instanceof URL || !stop.exclusive ? '' : '!';
    const relative = path.relative(projectRoot, fileURLToPath(url));
    return prefix + (relative.split(path.sep).join('/') || '.');
}
