import { describe, expect, test } from 'vitest';

import * as urlIndex from './index.mjs';

describe('index', () => {
    test('exports', () => {
        expect(urlIndex).toMatchObject({
            urlBasename: expect.any(Function),
            encodePathChars: expect.any(Function),
            FileUrlBuilder: expect.any(Function),
            isFileURL: expect.any(Function),
            normalizeFilePathForUrl: expect.any(Function),
            toFileURL: expect.any(Function),
            basenameOfUrlPathname: expect.any(Function),
            isURL: expect.any(Function),
            isUrlLike: expect.any(Function),
            toURL: expect.any(Function),
            urlParent: expect.any(Function),
        });
    });
});
