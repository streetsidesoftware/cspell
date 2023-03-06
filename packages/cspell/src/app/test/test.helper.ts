import { join } from 'path';
import { pathToFileURL } from 'url';

export const pathPackageRoot = join(__dirname, '../../..');
export const urlPackageRoot = pathToFileURL(pathPackageRoot).toString();

export const pathFixtures = join(pathPackageRoot, 'fixtures');
export const pathSamples = join(pathPackageRoot, 'samples');
