import * as path from 'path';
import * as shell from 'shelljs';

const packageRoot = path.join(__dirname, '../..');
const repoRoot = path.join(packageRoot, '../..');
const tempDirBase = path.join(packageRoot, 'temp');

export interface TestHelper {
    readonly packageRoot: string;
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

    resolveFixture(...parts: string[]): string;

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

    packageTemp(...parts: string[]): string;
}

export function createTestHelper(testFilename: string): TestHelper {
    return new TestHelperImpl(testFilename);
}

class TestHelperImpl implements TestHelper {
    readonly packageRoot = packageRoot;
    readonly repoRoot = repoRoot;
    readonly tempDir: string;
    readonly fixtureDir: string;

    constructor(testFilename: string) {
        this.tempDir = path.join(tempDirBase, path.relative(packageRoot, testFilename));
        this.fixtureDir = path.join(packageRoot, 'fixtures');
    }

    /**
     * delete the contents of the temp directory for the current test.
     */
    clearTempDir(): void {
        shell.rm('-rf', this.resolveTemp());
    }

    /**
     * resolve a path relative to the
     * @param parts
     * @returns
     */
    resolveTemp(...parts: string[]): string {
        const testName = (expect.getState().currentTestName || '').replace(/[^\w_.-]/g, '_');
        return path.resolve(this.tempDir, testName, ...parts);
    }

    /**
     * make a directory. It is ok to make the same directory multiple times.
     * @param parts
     */
    mkdir(...parts: string[]): void {
        const pTemp = this.resolveTemp(...parts);
        shell.mkdir('-p', pTemp);
    }

    /**
     * Copy files from src to dest
     * @param src - glob
     * @param dest - directory or file
     */
    cp(src: string, dest: string): void {
        shell.cp(this.resolveTemp(src), this.resolveTemp(dest));
    }

    /**
     * Change the current directory
     * @param dir
     */
    cd(dir: string): void {
        shell.cd(this.resolveTemp(dir));
    }

    /**
     * Change dir to temp directory unique to the current test.
     */
    cdToTempDir(): void {
        this.createTempDir();
        this.cd('.');
    }

    /**
     * resolve a path to the fixtures.
     * @param parts
     * @returns
     */
    resolveFixture(...parts: string[]): string {
        return path.resolve(this.fixtureDir, ...parts);
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
}
