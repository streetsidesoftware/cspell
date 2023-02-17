import { dirname, join as pathJoin } from 'path';

import { doesContain, isRelativePath } from './fileUtils.js';

const isSupportedFile = /\.(m?js|d\.m?ts)$/;

const regExpImportExport = /(import|export).*? from ('|")(?<file>\..*?)\2;/g;

export interface ProcessResult {
    filename: string;
    content: string;
    skipped?: boolean;
    linesChanged?: number;
}

export function processFile(srcFilename: string, content: string, root: string): ProcessResult {
    if (!doesContain(root, srcFilename) || !isSupportedFile.test(srcFilename))
        return { filename: srcFilename, content, skipped: true };

    const exp = new RegExp(regExpImportExport);

    const currentDir = dirname(srcFilename);

    const segments: string[] = [];
    let linesChanged = 0;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = exp.exec(content))) {
        const { index } = match;
        if (index > lastIndex) {
            segments.push(content.slice(lastIndex, index));
        }
        lastIndex = exp.lastIndex;

        const line = match[0];
        const reference = match.groups?.['file'];

        if (reference && isRelativePath(reference) && doesContain(root, pathJoin(currentDir, reference))) {
            const newLine = line.replace(/\.js';/, ".mjs';");
            segments.push(newLine);
            linesChanged += linesChanged + (newLine === line ? 0 : 1);
            continue;
        }

        segments.push(line);
    }

    const filename = srcFilename.replace(/\.js$/, '.mjs').replace(/\.ts$/, '.mts');

    if (!linesChanged) return { filename, content };

    if (lastIndex < content.length) {
        segments.push(content.slice(lastIndex));
    }

    return { filename, content: segments.join(''), linesChanged };
}

export function isSupportedFileType(filename: string): boolean {
    return isSupportedFile.test(filename);
}
