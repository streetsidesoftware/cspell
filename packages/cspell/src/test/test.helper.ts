import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const pathPackageRoot: string = join(__dirname, '../..');
export const urlPackageRoot: string = pathToFileURL(pathPackageRoot).toString();

export const pathFixtures: string = join(pathPackageRoot, 'fixtures');
export const pathSamples: string = join(pathPackageRoot, 'samples');
