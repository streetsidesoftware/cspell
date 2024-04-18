import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const rootDir = join(__dirname, '../../');
export const samplesDir = join(rootDir, 'Samples/');
export const globalSamplesDir = join(rootDir, '../Samples/');
export const globalTestFixturesDir = join(rootDir, '../../test-fixtures/');

export function resolveSample(samplePath: string): string {
    return resolve(samplesDir, samplePath);
}

export function resolveGlobalSample(samplePath: string): string {
    return resolve(globalSamplesDir, samplePath);
}

export function resolveGlobalDict(dictPath: string): string {
    return resolve(join(globalSamplesDir, 'dicts'), dictPath);
}

export function readSampleFile(samplePath: string): Promise<string> {
    return readFile(resolveSample(samplePath), 'utf8');
}
