import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import Path from 'node:path';
import { pathToFileURL } from 'node:url';

import { suite } from 'perf-insight';

import { FileUrlBuilder } from '../index.mjs';
import { urlToUrlRelative } from '../url.mjs';

const fixturesDataUrl = new URL('../../../../test-fixtures/perf/cspell-glob/data/', import.meta.url);

const cwd = process.cwd();

suite('cspell-url.FileUrlBuilder.relative', async (test) => {
    const fileList = await loadFileList();
    const fileUrlList = fileList.map((file) => pathToFileURL(file.filename));
    const builder = new FileUrlBuilder({ path: Path });

    verifyRelative(fileUrlList);

    test('FileUrlBuilder.relative', () => {
        const cwdUrl = builder.cwd;

        for (const file of fileUrlList) {
            builder.relative(cwdUrl, file);
        }
    });

    test('urlToUrlRelative', () => {
        const cwdUrl = builder.cwd;

        for (const file of fileUrlList) {
            urlToUrlRelative(cwdUrl, file);
        }
    });

    test('Path.relative', () => {
        const cwdUrl = builder.cwd;
        const relative = Path.posix.relative;

        for (const file of fileUrlList) {
            relative(cwdUrl.pathname, file.pathname);
        }
    });
});

function verifyRelative(urls: URL[]) {
    const builder = new FileUrlBuilder({ path: Path });
    const cwdUrl = builder.cwd;

    for (const url of urls) {
        const relBuilder = builder.relative(cwdUrl, url);
        const relPath = decodeURIComponent(Path.posix.relative(cwdUrl.pathname, url.pathname));
        const relUrl = urlToUrlRelative(cwdUrl, url);
        assert.deepStrictEqual(relBuilder, relPath, 'Builder vs Path');
        assert.deepStrictEqual(relBuilder, relUrl, 'Builder vs URL');
    }
}

interface FileEntry {
    filename: string;
    matcherId: number;
    match: boolean;
}

async function loadFileList(): Promise<FileEntry[]> {
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
