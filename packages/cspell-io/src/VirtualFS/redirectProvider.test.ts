import assert from 'node:assert';

import { describe, expect, test, vi } from 'vitest';

import { CFileResource, renameFileResource } from '../common/index.js';
import { toURL, urlBasename } from '../node/file/url.js';
import { makePathToURL, pathToSampleURL, pathToTempURL } from '../test/test.helper.js';
import { createVirtualFS } from './CVirtualFS.js';
import { VFSErrorUnsupportedRequest } from './errors.js';
import { createRedirectProvider } from './redirectProvider.js';
import { FSCapabilityFlags } from './VFileSystem.js';
import type { VProviderFileSystem } from './VirtualFS.js';

const samplesURL = pathToSampleURL();

const sc = (m: string) => expect.stringContaining(m);
const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

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
        {
            using fs = provider.getFileSystem(new URL('file:///public/'), () => mockFS);
            expect(fs?.dispose).toBeDefined();
        }
        expect(mockFS.dispose).toHaveBeenCalled();
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

    // cspell:ignore Fetc Cetc
    describe('requests stay under the private root', () => {
        const publicRoot = new URL('file:///public/');
        const privateRoot = new URL('file:///srv/app/uploads/');

        test.each`
            href
            ${'file:///public//etc/passwd'}
            ${'file:///public///etc/passwd'}
            ${'file:///public/%2Fetc/passwd'}
            ${'file:///public/%2fetc/passwd'}
            ${'file:///public/%5Cetc/passwd'}
        `('reject $href', async ({ href }) => {
            await expectRejectedForAllOperations(publicRoot, privateRoot, new URL(href));
        });

        test.each`
            href
            ${'virtual-fs://host/public/\\etc/passwd'}
            ${'virtual-fs://host/public/a\\..\\..\\..\\..\\etc/passwd'}
            ${'virtual-fs://host/public/%5Cetc/passwd'}
        `('reject $href with a non-file public root', async ({ href }) => {
            await expectRejectedForAllOperations(new URL('virtual-fs://host/public/'), privateRoot, new URL(href));
        });

        test.each`
            href
            ${'custom:pub/../etc/passwd'}
            ${'custom:pub/a/../../../etc/passwd'}
        `('reject $href with an opaque public root', async ({ href }) => {
            // `..` in an opaque path is not resolved by the URL parser.
            await expectRejectedForAllOperations(new URL('custom:pub/'), privateRoot, new URL(href));
        });

        test('`..` does not reach the private file system', async () => {
            // The URL parser resolves `..` before the request is routed, so the request falls outside the public root.
            await expectRejectedForAllOperations(publicRoot, privateRoot, new URL('file:///public/%2e%2e/etc/passwd'));
            await expectRejectedForAllOperations(publicRoot, privateRoot, new URL('file:///public/a/../../etc/passwd'));
        });

        test.each`
            href                                   | expected
            ${'file:///public/file.txt'}           | ${'file:///srv/app/uploads/file.txt'}
            ${'file:///public/etc/passwd'}         | ${'file:///srv/app/uploads/etc/passwd'}
            ${'file:///public/a:b.txt'}            | ${'file:///srv/app/uploads/a:b.txt'}
            ${'file:///public/C|/etc/passwd'}      | ${'file:///srv/app/uploads/C|/etc/passwd'}
            ${'file:///public/c:/windows/'}        | ${'file:///srv/app/uploads/c:/windows/'}
            ${'file:///public/http:evil'}          | ${'file:///srv/app/uploads/http:evil'}
            ${'file:///public/data:text/plain,hi'} | ${'file:///srv/app/uploads/data:text/plain,hi'}
            ${'file:///public/dir/a%2Fb.txt'}      | ${'file:///srv/app/uploads/dir/a%2Fb.txt'}
            ${'file:///public/dir/'}               | ${'file:///srv/app/uploads/dir/'}
        `('map $href to $expected', async ({ href, expected }) => {
            const mockFS = createMockFS();
            const fs = getRedirectFS(publicRoot, privateRoot, mockFS);
            await expect(fs.stat(new URL(href))).rejects.toThrowError(VFSErrorUnsupportedRequest);
            expect(mockFS.stat).toHaveBeenCalledWith(new URL(expected));
        });

        test('reject a result from the private file system outside the private root', async () => {
            const mockFS = createMockFS();
            vi.mocked(mockFS.readFile).mockImplementation(async () => ({
                url: new URL('file:///etc/passwd'),
                content: 'root',
            }));
            vi.mocked(mockFS.readDirectory).mockImplementation(async () => [
                { name: 'passwd', dir: new URL('file:///etc/'), fileType: 1 },
            ]);
            const fs = getRedirectFS(publicRoot, privateRoot, mockFS);
            await expect(fs.readFile(new URL('file:///public/file.txt'))).rejects.toThrowError(
                VFSErrorUnsupportedRequest,
            );
            await expect(fs.readDirectory(new URL('file:///public/'))).rejects.toThrowError(VFSErrorUnsupportedRequest);
        });

        async function expectRejectedForAllOperations(publicRoot: URL, privateRoot: URL, url: URL) {
            const mockFS = createMockFS();
            const fs = getRedirectFS(publicRoot, privateRoot, mockFS);
            await expect(fs.stat(url)).rejects.toThrowError(VFSErrorUnsupportedRequest);
            await expect(fs.stat({ url })).rejects.toThrowError(VFSErrorUnsupportedRequest);
            await expect(fs.readFile(url)).rejects.toThrowError(VFSErrorUnsupportedRequest);
            await expect(fs.readDirectory(url)).rejects.toThrowError(VFSErrorUnsupportedRequest);
            await expect(fs.writeFile({ url, content: 'x' })).rejects.toThrowError(VFSErrorUnsupportedRequest);
            expect(mockFS.stat).not.toHaveBeenCalled();
            expect(mockFS.readFile).not.toHaveBeenCalled();
            expect(mockFS.readDirectory).not.toHaveBeenCalled();
            expect(mockFS.writeFile).not.toHaveBeenCalled();
        }

        function getRedirectFS(publicRoot: URL, privateRoot: URL, privateFS: VProviderFileSystem) {
            const provider = createRedirectProvider('test', publicRoot, privateRoot);
            const fs = provider.getFileSystem(publicRoot, (url) => (url === privateRoot ? privateFS : undefined));
            assert(fs);
            return fs;
        }
    });
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
    const dispose = vi.fn();
    return {
        capabilities: 0,
        providerInfo: { name: 'mock' },
        stat: vi.fn(() => Promise.reject(new VFSErrorUnsupportedRequest('stat'))),
        readFile: vi.fn(() => Promise.reject(new VFSErrorUnsupportedRequest('readFile'))),
        readDirectory: vi.fn(() => Promise.reject(new VFSErrorUnsupportedRequest('readDirectory'))),
        writeFile: vi.fn(() => Promise.reject(new VFSErrorUnsupportedRequest('writeFile'))),
        dispose,
        [Symbol.dispose]: dispose,
    };
}
