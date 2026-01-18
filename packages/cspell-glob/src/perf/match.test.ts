import assert from 'node:assert';

import { describe } from 'vitest';

import { GlobMatcher } from '../GlobMatcher.ts';
import { loadFileList, loadPatterns } from './loadFileList.ts';

describe('cspell-glob GlobMatcher match', async (test) => {
    const fileList = await loadFileList();
    const patterns = await loadPatterns();
    const matchers: GlobMatcher[] = patterns.map(({ options, patterns }) => new GlobMatcher(patterns, options));

    test('verify files match', () => {
        for (const fileEntry of fileList) {
            const matcher = matchers[fileEntry.matcherId];
            assert(
                matcher.match(fileEntry.filename) === fileEntry.match,
                `Expected ${fileEntry.filename} to ${fileEntry.match ? 'match' : 'not match'}`,
            );
        }
    });
});
