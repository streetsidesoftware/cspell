import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const rootDir: string = join(__dirname, '../../');
export const samplesDir: string = join(rootDir, 'Samples/');
export const globalSamplesDir: string = join(rootDir, '../Samples/');
export const globalTestFixturesDir: string = join(rootDir, '../../test-fixtures/');

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
