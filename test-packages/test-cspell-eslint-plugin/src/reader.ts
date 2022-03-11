import { promises as fs } from 'fs';

/*
 This is a basic block comment.
 */

/**
 * file reader
 * @param filename - name of file to read
 * @returns the contents of the file
 */
export function reader(filename: string): Promise<string> {
    // Single line comment.
    return fs.readFile(filename, 'utf-8');
}

export const reeder = reader;
