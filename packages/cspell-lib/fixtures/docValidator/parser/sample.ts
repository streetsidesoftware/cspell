import { promises as fs } from 'fs';
import { gunzipSync } from 'zlib';

const isGzRegExp: RegExp = /.*\.gz/i;

/**
 * Read a text file that is optionally gz compressed.
 * @param filename
 * @returns the content of the file (uncompressed if necessary)
 */
export async function loadFile(filename: string): Promise<string> {
    const rawBuffer = await fs.readFile(filename);
    const buffer = isGzRegExp.test(filename) ? gunzipSync(rawBuffer) : rawBuffer;
    return buffer.toString('utf-8');
}

export const messages = ['This is the first message.', 'This is the \x73econd message.'];

export const messagesWithErrors = ['This message has some \x73errors.'];
