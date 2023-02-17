import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = join(__dirname, '..');
const fixtureDir = join(root, 'fixtures');

export function resolveFixture(...parts: string[]): string {
    return resolve(fixtureDir, ...parts);
}
