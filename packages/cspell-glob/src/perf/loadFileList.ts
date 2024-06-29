import { promises as fs } from 'node:fs';
import Path from 'node:path';

import { GlobMatchOptions } from '../GlobMatcher.js';
import { GlobPatternWithOptionalRoot } from '../GlobMatcherTypes.js';

const fixturesDataUrl = new URL('../../../../test-fixtures/perf/cspell-glob/data/', import.meta.url);

const cwd = process.cwd();

interface TestPattern {
    options: GlobMatchOptions;
    patterns: GlobPatternWithOptionalRoot[];
}

export interface FileEntry {
    filename: string;
    matcherId: number;
    match: boolean;
}

export async function loadFileList(): Promise<FileEntry[]> {
    const fileList = (await fs.readFile(new URL('file-list.txt', fixturesDataUrl), 'utf8'))
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => a)
        .map((file) => Path.resolve(cwd, file))
        .map((file) => file.split(';'))
        .map(([filename, matcherId, match]) => ({
            filename,
            matcherId: Number.parseInt(matcherId, 10),
            match: match === 'true',
        }));

    return fileList;
}

export async function loadPatterns(): Promise<TestPattern[]> {
    const raw = await fs.readFile(new URL('patterns.jsonc', fixturesDataUrl), 'utf8');
    const patterns: TestPattern[] = JSON.parse(raw);

    return patterns.map(({ options, patterns }) => ({
        options: {
            ...options,
            cwd: Path.resolve(cwd, options.cwd || '.'),
            root: Path.resolve(cwd, options.root || '.'),
        },
        patterns: patterns.map((pattern) => ({
            ...pattern,
            root: Path.resolve(cwd, pattern.root || '.'),
            isGlobalPattern: pattern.root === undefined,
        })),
    }));
}
