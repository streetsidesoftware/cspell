import * as path from 'path';
import { mkdirp } from 'fs-extra';

const pathPackageRoot = path.join(__dirname, '../..');
const pathSamples = path.join(pathPackageRoot, 'samples');
const pathTemp = path.join(pathPackageRoot, 'temp');

export function pathToSample(...parts: string[]): string {
    return path.resolve(pathSamples, ...parts);
}

export function pathToRoot(...parts: string[]): string {
    return path.resolve(pathPackageRoot, ...parts);
}

export function makePathToFile(file: string): Promise<void> {
    return mkdirp(path.dirname(file));
}

export function testNameToDir(testName: string): string {
    return `test_${testName.replace(/\s/g, '-').replace(/[^\w.-]/gi, '_')}_test`;
}

/**
 * Calculate a Uri for a path to a temporary directory that will be unique to the current test.
 * Note: if a text is not currently running, then it is the path for the test file.
 * @param baseFilename - name of file / directory wanted
 * @param testFilename - optional full path to a test file.
 * @returns full path to the requested temp file.
 */
export function pathToTemp(...parts: string[]): string {
    const testState = expect.getState();
    const callerFile = testState.testPath || '.';
    const testFile = path.relative(pathPackageRoot, callerFile);
    expect.getState();
    const testName = testState.currentTestName || '.';
    const testDirName = testNameToDir(testName);
    return path.resolve(pathTemp, testFile, testDirName, ...parts);
}
