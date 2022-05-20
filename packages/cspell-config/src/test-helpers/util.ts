import * as path from 'path';
import { promises as fs } from 'fs';

export function json(obj: unknown, indent: string | number = 2): string {
    return JSON.stringify(obj, null, indent) + '\n';
}

export function tempPath(file: string): string {
    const testState = expect.getState();
    return path.join(__dirname, '../../temp', testState.currentTestName, file);
}

export async function createPathForFile(file: string): Promise<void> {
    await fs.mkdir(path.dirname(file), { recursive: true });
}

export async function copyFile(fromFile: string, toFile: string): Promise<void> {
    await createPathForFile(toFile);
    return fs.copyFile(fromFile, toFile);
}
