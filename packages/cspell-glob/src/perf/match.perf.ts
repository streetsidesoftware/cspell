import { promises as fs } from 'node:fs';
import Path from 'node:path';

import { suite } from 'perf-insight';

import { GlobMatcher, GlobMatchOptions } from '../GlobMatcher.js';
import { GlobPatternWithOptionalRoot } from '../GlobMatcherTypes.js';

const fixturesDataUrl = new URL('../../../../test-fixtures/perf/cspell-glob/data/', import.meta.url);

const cwd = process.cwd();

interface TestPattern {
    options: GlobMatchOptions;
    patterns: GlobPatternWithOptionalRoot[];
}

suite('cspell-glob GlobMatcher match', async (test) => {
    const fileList = await loadFileList();
    const patterns = await loadPatterns();
    const matchers: GlobMatcher[] = patterns.map(({ options, patterns }) => new GlobMatcher(patterns, options));

    test('match', () => {
        for (const matcher of matchers) {
            for (const file of fileList) {
                matcher.match(file);
            }
        }
    });
});

suite('cspell-glob GlobMatcher create', async (test) => {
    const patterns = await loadPatterns();

    test('create GlobMatcher', () => {
        patterns.map(({ options, patterns }) => new GlobMatcher(patterns, options));
    });
});

async function loadFileList() {
    const fileList = (await fs.readFile(new URL('file-list.txt', fixturesDataUrl), 'utf8'))
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => a)
        .map((file) => Path.relative(cwd, file));

    return fileList;
}

async function loadPatterns(): Promise<TestPattern[]> {
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
