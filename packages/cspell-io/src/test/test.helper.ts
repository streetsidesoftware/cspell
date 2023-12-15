import { mkdir } from 'fs/promises';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { expect } from 'vitest';

const mkdirp = async (p: string) => {
    await mkdir(p, { recursive: true });
};

const pathPackageRoot = path.join(__dirname, '../../');
const pathSamples = path.join(pathPackageRoot, 'samples/');
const pathTemp = path.join(pathPackageRoot, 'temp/');

export function pathToSample(...parts: string[]): string {
    return resolve(pathSamples, ...parts);
}

export function pathToSampleURL(...parts: string[]): URL {
    return pathToFileURL(pathToSample(...parts));
}

export function pathToRoot(...parts: string[]): string {
    return resolve(pathPackageRoot, ...parts);
}

export function pathToRootURL(...parts: string[]): URL {
    return pathToFileURL(pathToRoot(...parts));
}

export function makePathToFile(file: string): Promise<void> {
    return mkdirp(path.dirname(file));
}

/**
 * Make the directories to the url. If the url ends with a `/` then it is treated as a directory.
 * @param url - a URL
 * @returns void
 */
export function makePathToURL(url: URL): Promise<void> {
    const filePath = fileURLToPath(url);
    return url.pathname.endsWith('/') ? mkdirp(filePath) : makePathToFile(filePath);
}

function resolve(...parts: string[]): string {
    const p = parts.join('/');
    const suffix = /[/\\]$/.test(p) ? path.sep : '';
    return path.normalize(path.resolve(...parts) + suffix);
}

export function testNameToDir(testName: string): string {
    return `test_${testName.replace(/\s/g, '-').replace(/[^\w.-]/gi, '_')}_test`;
}

/**
 * Calculate a filepath for a path to a temporary directory that will be unique to the current test.
 * Note: if a text is not currently running, then it is the path for the test file.
 * @returns full path to the requested temp file.
 */
export function pathToTemp(...parts: string[]): string {
    const testState = expect.getState();
    const callerFile = testState.testPath || '.';
    const testFile = path.relative(pathPackageRoot, callerFile);
    expect.getState();
    const testName = testState.currentTestName || '.';
    const testDirName = testNameToDir(testName);
    return resolve(pathTemp, testFile, testDirName, ...parts);
}

/**
 * Calculate a URL for a path to a temporary directory that will be unique to the current test.
 * Note: if a text is not currently running, then it is the path for the test file.
 * @returns a URL to the requested temp file.
 */
export function pathToTempURL(...parts: string[]): URL {
    return pathToFileURL(pathToTemp(...parts));
}
