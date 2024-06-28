import assert from 'node:assert';

import { describe, expect, test, vi } from 'vitest';

import { CFileResource, renameFileResource } from '../common/index.js';
import { toURL, urlBasename } from '../node/file/url.js';
import { makePathToURL, pathToSampleURL, pathToTempURL } from '../test/test.helper.js';
import { FSCapabilityFlags } from '../VFileSystem.js';
import type { VProviderFileSystem } from '../VirtualFS.js';
import { createVirtualFS, VFSErrorUnsupportedRequest } from '../VirtualFS.js';
import { createRedirectProvider } from './redirectProvider.js';

const samplesURL = pathToSampleURL();

const sc = expect.stringContaining;
const oc = expect.objectContaining;

describe('Validate RedirectProvider', () => {
    test('createRedirectProvider', () => {
        const provider = createRedirectProvider('test', new URL('file:///public/'), new URL('file:///private/'));
        expect(provider.name).to.equal('test');
    });

    test('createRedirectProvider missing redirect target', () => {
        const provider = createRedirectProvider('test', new URL('file:///public/'), new URL('virtual-fs://private/'));
        expect(provider.getFileSystem(new URL('file:///public/'), () => undefined)).to.equal(undefined);
    });

    test('createRedirectProvider missing redirect target', async () => {
        const provider = createRedirectProvider('test', new URL('virtual-fs:///public/'), new URL('file:///private/'));
        const vfs = createVirtualFS();
        vfs.registerFileSystemProvider(provider);
        const fs = vfs.getFS(new URL('virtual-fs:///public/'));
        await expect(fs.stat(new URL('virtual-fs:///private/'))).rejects.toThrowError(VFSErrorUnsupportedRequest);
    });

    test('createRedirectProvider.fs.dispose', async () => {
        const mockFS = createMockFS();
        const provider = createRedirectProvider('test', new URL('file:///public/'), new URL('file:///private/'));
        const fs = provider.getFileSystem(new URL('file:///public/'), () => mockFS);
        assert(fs);
        expect(() => fs.dispose()).not.toThrow();
    });

    test.each`
        filename                                                  | content
        ${import.meta.url}                                        | ${sc('This bit of text')}
        ${new URL('cities.txt', 'virtual-fs://samples/').href}    | ${sc('San Francisco\n')}
        ${new URL('cities.txt.gz', 'virtual-fs://samples/').href} | ${sc('San Francisco\n')}
    `('RedirectProvider.readFile $filename', async ({ filename, content }) => {
        const url = toURL(filename);
        const publicURL = new URL('virtual-fs://samples/');
        const vfs = createVFS(publicURL, samplesURL);
        const fs = vfs.fs;
        const baseFilename = urlBasename(url);
        const expected = { url, content, baseFilename };
        const result = await fs.readFile(url);
        const gz = filename.endsWith('.gz') || undefined;
        assert(result instanceof CFileResource);
        expect(result.url.href).toBe(expected.url.href);
        expect(result.getText()).toEqual(expected.content);
        expect(result.baseFilename).toEqual(expected.baseFilename);
        expect(!!result.gz).toEqual(!!gz);
    });

    test('RedirectProvider.stat', async () => {
        const publicURL = new URL('virtual-fs://samples/');
        const vfs = createVFS(publicURL, samplesURL);
        const fs = vfs.fs;

        const stat = await fs.stat(sURL('cities.txt'));
        const stat2 = await fs.stat({ url: new URL('cities.txt', publicURL) });
        expect(stat2).toEqual(stat);
    });

    test('RedirectProvider.getCapabilities', () => {
        const publicURL = new URL('virtual-fs://samples/');
        const vfs = createVFS(publicURL, samplesURL);
        const fs = vfs.fs;

        const cap = fs.getCapabilities(sURL('cities.txt'));
        const cap2 = fs.getCapabilities(new URL('cities.txt', publicURL));
        expect(cap2).toEqual(cap);
    });

    test('RedirectProvider.getCapabilities', () => {
        const publicURL = new URL('virtual-fs://samples/');
        const privateURL = sURL('./');
        const vfs = getVFS();
        const provider = createRedirectProvider('test', publicURL, privateURL, {
            capabilitiesMask: ~FSCapabilityFlags.ReadWriteDir,
        });
        vfs.registerFileSystemProvider(provider);
        const fs = vfs.fs;

        const cap = fs.getCapabilities(sURL('cities.txt'));
        const cap2 = fs.getCapabilities(new URL('cities.txt', publicURL));
        expect(cap2.readFile).toEqual(cap.readFile);
        expect(cap2.readDirectory).not.toEqual(cap.readDirectory);
    });

    test('RedirectProvider.stat non-matching public URL', async () => {
        const publicURL = new URL('virtual-fs://samples/');
        const vfs = createVFS(publicURL, samplesURL);
        const fs = vfs.fs;
        const pStat = fs.stat(new URL('cities.txt', 'virtual-fs://fixtures/'));
        await expect(pStat).rejects.toThrowError(VFSErrorUnsupportedRequest);
    });

    test('RedirectProvider.readDirectory', async () => {
        const publicURL = new URL('virtual-fs://samples/');
        const vfs = createVFS(publicURL, samplesURL);
        const fs = vfs.fs;

        const dir = await fs.readDirectory(sURL('./'));
        const dir2 = await fs.readDirectory(new URL('./', publicURL));
        expect(dir2.map((e) => e.name)).toEqual(dir.map((e) => e.name));
        expect(dir2.map((e) => e.fileType)).toEqual(dir.map((e) => e.fileType));
        expect(dir2.map((e) => e.isDirectory())).toEqual(dir.map((e) => e.isDirectory()));
        expect(dir2.map((e) => e.isFile())).toEqual(dir.map((e) => e.isFile()));
        expect(dir2.map((e) => e.isUnknown())).toEqual(dir.map((e) => e.isUnknown()));
        expect(dir2.map((e) => e.dir.href)).not.toEqual(dir.map((e) => e.dir.href));
    });

    test('RedirectProvider.writeFile', async () => {
        const publicURL = new URL('virtual-fs://samples/');
        const privateURL = pathToTempURL('./');
        const vfs = createVFS(publicURL, privateURL);
        const fs = vfs.fs;

        await makePathToURL(privateURL);

        const sourceFile = await fs.readFile(sURL('cities.txt'));
        const publicFile = renameFileResource(sourceFile, new URL('cities2.txt', publicURL));
        const privateFile = renameFileResource(sourceFile, new URL('cities2.txt', privateURL));

        const result = await fs.writeFile(publicFile);
        expect(result.url).toEqual(publicFile.url);

        const actualFile = await fs.readFile(privateFile.url);
        expect(actualFile).toEqual(oc({ url: privateFile.url, content: sourceFile.content }));

        const actualFile2 = await fs.readFile(publicFile.url);
        expect(actualFile2).toEqual(oc({ url: publicFile.url, content: sourceFile.content }));
    });

    test.each`
        publicHref              | privateHref | relPath
        ${'file:///fake-root/'} | ${sh('./')} | ${'cities.txt'}
    `(
        'RedirectProvider.stat public: $publicHref, private: $privateHref, $relPath',
        async ({ publicHref, privateHref, relPath }) => {
            const publicURL = new URL(publicHref);
            const privateURL = new URL(privateHref);
            const cleanVfs = createVirtualFS();
            const vfs = createVFS(publicURL, privateURL);
            const fs = vfs.fs;

            const privateFileURL = new URL(relPath, privateURL);
            const publicFileURL = new URL(relPath, publicURL);

            const stat = await cleanVfs.fs.stat(privateFileURL);
            const stat2 = await fs.stat(privateFileURL);
            expect(stat2).toEqual(stat);
            const stat3 = await fs.stat(publicFileURL);
            expect(stat3).toEqual(stat);
        },
    );
});

function getVFS() {
    return createVirtualFS();
}

function sh(pathname: string): string {
    return sURL(pathname).href;
}

function sURL(pathname: string): URL {
    return new URL(pathname, samplesURL);
}

function createVFS(publicURL: URL, pathnameOrURL: string | URL) {
    const privateURL = typeof pathnameOrURL === 'string' ? sURL(pathnameOrURL) : pathnameOrURL;
    const vfs = getVFS();
    const provider = createRedirectProvider('test', publicURL, privateURL);
    vfs.registerFileSystemProvider(provider);
    return vfs;
}

function createMockFS(): VProviderFileSystem {
    return {
        capabilities: 0,
        providerInfo: { name: 'mock' },
        stat: vi.fn(() => Promise.reject(new VFSErrorUnsupportedRequest('stat'))),
        readFile: vi.fn(() => Promise.reject(new VFSErrorUnsupportedRequest('readFile'))),
        readDirectory: vi.fn(() => Promise.reject(new VFSErrorUnsupportedRequest('readDirectory'))),
        writeFile: vi.fn(() => Promise.reject(new VFSErrorUnsupportedRequest('writeFile'))),
        dispose: vi.fn(() => undefined),
    };
}
