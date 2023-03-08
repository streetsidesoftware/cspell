import * as path from 'path';

export const pathPackageRoot = path.join(__dirname, '../..');
export const pathRepoRoot = path.join(pathPackageRoot, '../..');
export const pathPackageSamples = path.join(pathPackageRoot, 'samples');
export const pathPackageFixtures = path.join(pathPackageRoot, 'fixtures');
export const pathRepoTestFixtures = path.join(pathRepoRoot, 'test-fixtures');
