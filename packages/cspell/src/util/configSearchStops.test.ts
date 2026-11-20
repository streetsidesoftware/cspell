import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { calcFileConfigSearchStops, resolveStopFolders } from './configSearchStops.js';

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
        desc                                               | given                           | named    | expected
        ${'no stops without a named config or a stop'}     | ${undefined}                    | ${false} | ${undefined}
        ${'the given stops without a named config'}        | ${['src']}                      | ${false} | ${['src']}
        ${'the root with a named config'}                  | ${undefined}                    | ${true}  | ${['!.']}
        ${'a given stop at the root replaces the root'}    | ${['.']}                        | ${true}  | ${['.']}
        ${'a given stop above the root replaces the root'} | ${['..']}                       | ${true}  | ${['..']}
        ${'a given stop below the root keeps the root'}    | ${['packages']}                 | ${true}  | ${['packages', '!.']}
        ${'a sibling folder is not a parent'}              | ${['../proj']}                  | ${true}  | ${['../proj', '!.']}
        ${'several given stops'}                           | ${['packages/a', 'packages/b']} | ${true}  | ${['packages/a', 'packages/b', '!.']}
    `('calcFileConfigSearchStops $desc', ({ given, named, expected }) => {
        const givenStops = given?.map((folder: string) => dirUrl(path.resolve(projectRoot, folder)));
        const stops = calcFileConfigSearchStops(givenStops, dirUrl(projectRoot), named);
        expect(stops?.map(toShortStop)).toEqual(expected);
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
