import { promises as fs } from 'fs';

export class GitIgnoreFile {
    constructor(readonly content: string, readonly filename: string) {}
}

export async function loadGitIgnoreFile(file: string): Promise<GitIgnoreFile> {
    const content = await fs.readFile(file, 'utf8');
    return new GitIgnoreFile(content, file);
}
