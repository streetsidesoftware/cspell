import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

export const pathPackageRoot = path.join(__dirname, '../../');
export const pathRepoRoot = path.join(pathPackageRoot, '../../');
export const pathPackageSamples = path.join(pathPackageRoot, 'samples/');
export const pathPackageFixtures = path.join(pathPackageRoot, 'fixtures/');
export const pathRepoTestFixtures = path.join(pathRepoRoot, 'test-fixtures/');

export const pathPackageRootURL = pathToFileURL(pathPackageRoot);
export const pathRepoRootURL = pathToFileURL(pathRepoRoot);
export const pathPackageSamplesURL = pathToFileURL(pathPackageSamples);
export const pathPackageFixturesURL = pathToFileURL(pathPackageFixtures);
export const pathRepoTestFixturesURL = pathToFileURL(pathRepoTestFixtures);
