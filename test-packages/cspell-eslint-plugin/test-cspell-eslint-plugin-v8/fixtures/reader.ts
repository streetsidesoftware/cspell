import { promises as fs } from 'fs';

/*
 This is a basic block comment.
 */

/**
 * file reader
 * @param filename - name of file to read
 * @returns the contents of the file
 */
export function reader(filename: string, options?: Options): Promise<string> {
    // Single line comment.
    return fs.readFile(filename, options?.['encoding'] || 'utf-8');
}

export const reeder = reader;

export interface Options {
    'read-write': boolean;
    protected: boolean;
    encoding?: 'utf-8';
}
