import * as path from 'path';
import * as shell from 'shelljs';

const packageRoot = path.join(__dirname, '../..');
const repoRoot = path.join(packageRoot, '../..');
const tempDirBase = path.join(packageRoot, 'temp');

export interface TestHelper {
    readonly packageRoot: string;
    readonly repoRoot: string;
    readonly tempDir: string;

    clearTempDir(): void;
    /**
     * Resolves the parts to be an absolute path in the temp directory
     * for a given test.
     * @param parts
     */
    resolveTemp(...parts: string[]): string;

    createTempDir(...parts: string[]): void;

    /**
     * Make the temp directory
     * @param parts
     */
    mkdir(...parts: string[]): void;

    /**
     * copy files
     * same as shell.cp
     * @param from
     * @param to
     */
    cp(from: string, to: string): void;

    cd(dir: string): void;

    cdToTempDir(): void;
}

export function createTestHelper(testFilename: string): TestHelper {
    return new TestHelperImpl(testFilename);
}

class TestHelperImpl implements TestHelper {
    readonly packageRoot = packageRoot;
    readonly repoRoot = repoRoot;
    readonly tempDir: string;

    constructor(testFilename: string) {
        this.tempDir = path.join(tempDirBase, path.relative(packageRoot, testFilename));
    }

    clearTempDir(): void {
        shell.rm('-rf', this.resolveTemp());
    }

    resolveTemp(...parts: string[]): string {
        const testName = (expect.getState().currentTestName || '').replace(/[^\w_.-]/g, '_');
        return path.resolve(this.tempDir, testName, ...parts);
    }

    mkdir(...parts: string[]): void {
        const pTemp = this.resolveTemp(...parts);
        shell.mkdir('-p', pTemp);
    }

    cp(from: string, to: string): void {
        shell.cp(this.resolveTemp(from), this.resolveTemp(to));
    }

    cd(dir: string): void {
        shell.cd(this.resolveTemp(dir));
    }

    cdToTempDir(): void {
        this.createTempDir();
        this.cd('.');
    }

    readonly createTempDir = this.mkdir;
}
