import * as path from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
export const pathPackageRoot: string = path.join(__dirname, '../../');
export const pathRepoRoot: string = path.join(pathPackageRoot, '../../');
export const pathPackageSamples: string = path.join(pathPackageRoot, 'samples/');
export const pathPackageFixtures: string = path.join(pathPackageRoot, 'fixtures/');
export const pathRepoTestFixtures: string = path.join(pathRepoRoot, 'test-fixtures/');

export const pathPackageRootURL: URL = pathToFileURL(pathPackageRoot);
export const pathRepoRootURL: URL = pathToFileURL(pathRepoRoot);
export const pathPackageSamplesURL: URL = pathToFileURL(pathPackageSamples);
export const pathPackageFixturesURL: URL = pathToFileURL(pathPackageFixtures);
export const pathRepoTestFixturesURL: URL = pathToFileURL(pathRepoTestFixtures);
