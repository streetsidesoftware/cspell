import { suite } from 'perf-insight';

import { GlobMatcher } from '../GlobMatcher.ts';
import { loadFileList, loadPatterns } from './loadFileList.ts';

suite('cspell-glob GlobMatcher match', async (test) => {
    const fileList = await loadFileList();
    const patterns = await loadPatterns();
    const matchers: GlobMatcher[] = patterns.map(({ options, patterns }) => new GlobMatcher(patterns, options));

    test('match', () => {
        for (const fileEntry of fileList) {
            const matcher = matchers[fileEntry.matcherId];
            matcher.match(fileEntry.filename);
        }
    });
});

suite('cspell-glob GlobMatcher create', async (test) => {
    const patterns = await loadPatterns();

    test('create GlobMatcher', () => {
        patterns.map(({ options, patterns }) => new GlobMatcher(patterns, options));
    });
});
