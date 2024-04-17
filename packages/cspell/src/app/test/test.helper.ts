import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const pathPackageRoot = join(__dirname, '../../..');
export const urlPackageRoot = pathToFileURL(pathPackageRoot).toString();

export const pathFixtures = join(pathPackageRoot, 'fixtures');
export const pathSamples = join(pathPackageRoot, 'samples');
