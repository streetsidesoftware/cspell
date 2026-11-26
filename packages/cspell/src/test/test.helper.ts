import { mkdir, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const pathPackageRoot: string = join(__dirname, '../..');
export const urlPackageRoot: string = pathToFileURL(pathPackageRoot).toString();

export const pathFixtures: string = join(pathPackageRoot, 'fixtures');
export const pathSamples: string = join(pathPackageRoot, 'samples');

const pathTemp = join(pathPackageRoot, 'temp');

/**
 * Make an empty folder for the files a test file writes: `temp/<path of the test file>` in the package.
 * Files left by an earlier run are removed.
 * @param testFileUrl - the test file's `import.meta.url`.
 * @param parts - a folder inside it, for a test file that needs more than one.
 */
export async function createTempFolder(testFileUrl: string, ...parts: string[]): Promise<string> {
    const folder = join(pathTemp, relative(pathPackageRoot, fileURLToPath(testFileUrl)), ...parts);
    await rm(folder, { recursive: true, force: true });
    await mkdir(folder, { recursive: true });
    return folder;
}
