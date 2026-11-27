import { readFileSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import Path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pathPackageRoot, pathPackageSamples } from './test.locations.js';

const pathTemp = Path.join(pathPackageRoot, 'temp');

export function readSampleFileSync(filename: string): string {
    return readFileSync(Path.join(pathPackageSamples, filename), 'utf8');
}

/**
 * Make an empty folder for the files a test file writes: `temp/<path of the test file>` in the package.
 * Files left by an earlier run are removed.
 * @param testFileUrl - the test file's `import.meta.url`.
 * @param parts - a folder inside it, for a test file that needs more than one.
 */
export async function createTempFolder(testFileUrl: string, ...parts: string[]): Promise<string> {
    const folder = Path.join(pathTemp, Path.relative(pathPackageRoot, fileURLToPath(testFileUrl)), ...parts);
    await rm(folder, { recursive: true, force: true });
    await mkdir(folder, { recursive: true });
    return folder;
}
