import { readFileSync } from 'node:fs';
import Path from 'node:path';

import { pathPackageSamples } from './test.locations.cjs';

export function readSampleFileSync(filename: string): string {
    return readFileSync(Path.join(pathPackageSamples, filename), 'utf8');
}
