import * as path from 'node:path';

const fixturesDir = path.join(__dirname, '../../fixtures');

export function fixtures(pathOfFixture = ''): string {
    return path.resolve(fixturesDir, pathOfFixture);
}
