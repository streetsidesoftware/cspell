import Path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { isStdinUrl, resolveStdinUrl } from './stdinUrl.js';

const filenameURL = new URL(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);
const dirUrl = new URL('./', import.meta.url);
const stdinUrl = dirUrl.href.replace(/^file:/, 'stdin:');

describe('stdinUrl', () => {
    test('isStdinUrl', () => {
        expect(isStdinUrl('stdin://')).toBe(true);
        expect(isStdinUrl('stdin:')).toBe(true);
        expect(isStdinUrl('stdin://foo')).toBe(true);
    });

    test.each`
        url                               | expected
        ${'stdin://'}                     | ${stdinUrl}
        ${'stdin:package.json'}           | ${new URL('package.json', stdinUrl).href}
        ${'stdin:./issue 7517/README.md'} | ${new URL('issue 7517/README.md', stdinUrl).href}
        ${'stdin:./package.json'}         | ${new URL('package.json', stdinUrl).href}
        ${'stdin:' + __filename}          | ${new URL(filenameURL.pathname, stdinUrl).href}
        ${'stdin://' + __filename}        | ${new URL(filenameURL.pathname, stdinUrl).href}
    `('resolveStdinUrl $url', ({ url, expected }) => {
        expect(resolveStdinUrl(url, __dirname)).toBe(expected);
        // check nested resolve
        expect(resolveStdinUrl(resolveStdinUrl(url, __dirname), dirUrl.href)).toBe(expected);
    });
});
