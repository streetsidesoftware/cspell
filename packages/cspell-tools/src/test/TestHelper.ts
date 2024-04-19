import assert from 'node:assert';
import { mkdirSync, promises as fs, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from 'vitest';

const _dirname = test_dirname(import.meta.url);

const packageRoot = path.join(_dirname, '../..');
const repoRoot = path.join(packageRoot, '../..');
const tempDirBase = path.join(packageRoot, 'temp');
const repoSamples = path.join(repoRoot, 'packages/Samples');

export interface TestHelper {
    /** path to `.../cspell/package/cspell-tools/` */
    readonly packageRoot: string;
    /** path to `...cspell/` */
    readonly repoRoot: string;
    readonly tempDir: string;

    /**
     * delete the contents of the temp directory for the current test.
     */
    clearTempDir(): void;
    /**
     * Resolves the parts to be an absolute path in the temp directory
     * for a given test.
     * @param parts
     */
    resolveTemp(...parts: string[]): string;

    createTempDir(...parts: string[]): void;

    /**
     * Resolves a fixture path to an absolute path
     * @param parts - relative path to fixture
     */
    resolveFixture(...parts: string[]): string;

    /**
     * Resolves a path to an absolute path in Samples
     * @param parts - relative path to sample
     */
    resolveSample(...parts: string[]): string;

    /**
     * Make the temp directory
     * @param parts
     */
    mkdir(...parts: string[]): void;

    /**
     * copy file
     * @param from
     * @param to
     */
    cpFileSync(from: string, to: string): void;

    packageTemp(...parts: string[]): string;

    /**
     * Signal the start of a test.
     * Use to make test.each unique.
     * @param name
     */
    beginTest(name?: string): void;

    getCurrentTestName(): string;

    fileExists(path: string): Promise<boolean>;
}

export function createTestHelper(testFilenameUrl: string): TestHelper {
    testFilenameUrl && assert(testFilenameUrl.startsWith('file:'));
    const testFilename = testFilenameUrl && test_filename(testFilenameUrl);
    return new TestHelperImpl(testFilename || expect.getState().testPath || 'test');
}

const fixtureDir = path.join(packageRoot, 'fixtures');

class TestHelperImpl implements TestHelper {
    readonly packageRoot = packageRoot;
    readonly repoRoot = repoRoot;
    readonly tempDir: string;
    readonly fixtureDir: string;

    private testCounter = new Map<string, number>();

    constructor(testFilename: string) {
        this.tempDir = path.join(tempDirBase, path.relative(packageRoot, testFilename));
        this.fixtureDir = fixtureDir;
    }

    beginTest(): void {
        const currentTestName = this.getRawTestName();
        const prev = this.testCounter.get(currentTestName) || 0;
        this.testCounter.set(currentTestName, prev + 1);
    }

    private getRawTestName(): string {
        return expect.getState().currentTestName || '';
    }

    getCurrentTestName(): string {
        const currentTestName = this.getRawTestName();
        const counter = this.testCounter.get(currentTestName);
        return `${currentTestName}${counter ? ' ' + counter : ''}`;
    }

    /**
     * delete the contents of the temp directory for the current test.
     */
    clearTempDir(): void {
        rmSync(this.resolveTemp(), { force: true, recursive: true });
    }

    /**
     * resolve a path relative to the
     * @param parts
     * @returns
     */
    resolveTemp(...parts: string[]): string {
        const currentTestName = this.getCurrentTestName();
        const testName = currentTestName.replaceAll(/[^\w_.-]/g, '_');
        return path.resolve(this.tempDir, testName, ...parts);
    }

    /**
     * make a directory. It is ok to make the same directory multiple times.
     * @param parts
     */
    mkdir(...parts: string[]): void {
        const pTemp = this.resolveTemp(...parts);
        mkdirSync(pTemp, { recursive: true });
    }

    /**
     * Copy files from src to dest
     * @param src - glob
     * @param dest - directory or file
     */
    cpFileSync(src: string, dest: string): void {
        const srcT = this.resolveTemp(src);
        const dstT = this.resolveTemp(dest);
        cpFileSync(srcT, dstT);
    }

    /**
     * resolve a path to the fixtures.
     * @param parts
     * @returns
     */
    resolveFixture(...parts: string[]): string {
        return path.resolve(this.fixtureDir, ...parts);
    }

    resolveSample(...parts: string[]): string {
        return path.resolve(repoSamples, ...parts);
    }

    /**
     * calc a path relative to the package temp directory.
     * @param parts - optional path segments
     * @returns
     */
    packageTemp(...parts: string[]): string {
        return path.resolve(tempDirBase, ...parts);
    }

    readonly createTempDir = this.mkdir;

    async fileExists(path: string): Promise<boolean> {
        try {
            await fs.stat(path);
            return true;
        } catch {
            return false;
        }
    }
}

export function resolvePathToFixture(...segments: string[]): string {
    return path.resolve(fixtureDir, ...segments);
}

export function test_dirname(importMetaUrl: string): string {
    return fileURLToPath(new URL('.', importMetaUrl));
}

export function test_filename(importMetaUrl: string): string {
    return fileURLToPath(importMetaUrl);
}

function cpFileSync(srcFile: string, dst: string) {
    const statDst = statSync(dst, { throwIfNoEntry: false });
    if (statDst && statDst.isDirectory()) {
        dst = path.join(dst, path.basename(srcFile));
    }
    const buf = readFileSync(srcFile);
    writeFileSync(dst, buf);
}
