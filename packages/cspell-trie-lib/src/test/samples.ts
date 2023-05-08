import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const rootDir = join(__dirname, '../..');
export const samplesDir = join(rootDir, 'Samples');
export const globalSamplesDir = join(rootDir, '../Samples');

export function resolveSample(samplePath: string): string {
    return resolve(samplesDir, samplePath);
}

export function resolveGlobalSample(samplePath: string): string {
    return resolve(globalSamplesDir, samplePath);
}

export function resolveGlobalDict(dictPath: string): string {
    return resolve(join(globalSamplesDir, 'dicts'), dictPath);
}
