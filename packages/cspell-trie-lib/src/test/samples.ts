import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const dirUrl: URL = new URL('.', import.meta.url);
export const pkgRootUrl: URL = new URL('../../', dirUrl);
export const repoRootUrl: URL = new URL('../../', pkgRootUrl);
export const pkgSamplesUrl: URL = new URL('Samples/', pkgRootUrl);
export const globalSamplesPkgUrl: URL = new URL('../../fixtures/Samples/', pkgRootUrl);

export const rootDir: string = fileURLToPath(pkgRootUrl);
export const samplesDir: string = fileURLToPath(pkgSamplesUrl);
export const fixturesDir: string = fileURLToPath(new URL('fixtures/', pkgRootUrl));
export const globalSamplesDir: string = fileURLToPath(globalSamplesPkgUrl);
export const globalTestFixturesDir: string = fileURLToPath(new URL('../../test-fixtures/', pkgRootUrl));

export function resolveSample(...filePath: [string, ...string[]]): string {
    return resolve(samplesDir, ...filePath);
}

export function resolveGlobalSample(...filePath: [string, ...string[]]): string {
    return resolve(globalSamplesDir, ...filePath);
}

export function resolveFixture(...filePath: [string, ...string[]]): string {
    return resolve(fixturesDir, ...filePath);
}

export function resolveGlobalDict(dictPath: string): string {
    return resolve(join(globalSamplesDir, 'dicts'), dictPath);
}

export function readSampleFile(...filePath: [string, ...string[]]): Promise<string> {
    return readFile(resolveSample(...filePath), 'utf8');
}

export function readFixtureFile(...filePath: [string, ...string[]]): Promise<string> {
    return readFile(resolveFixture(...filePath), 'utf8');
}
