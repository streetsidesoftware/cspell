import * as fs from 'fs-extra';
import * as zlib from 'zlib';

export function readTextFile(filename: string): Promise<string> {
    const content = fs
        .readFile(filename)
        .then((buffer) => (/\.gz$/.test(filename) ? zlib.gunzipSync(buffer) : buffer))
        .then((buffer) => buffer.toString('utf8'));
    return content;
}

export async function readTextFileLines(filename: string): Promise<string[]> {
    const content = await readTextFile(filename);
    return content.split('\n');
}
