import fs from 'node:fs/promises';
import path from 'node:path';

// eslint-disable-next-line n/no-unsupported-features/node-builtins
export const rootDir: string = path.join(import.meta.dirname, '../..');
export const repoUrl = 'https://github.com/streetsidesoftware/cspell';

/** Packages whose issues share another package's label. */
const labelAliases: Record<string, string> = {
    'cspell-tools-alias': 'cspell-tools',
};

export interface PackageJson {
    name: string;
    private?: boolean;
    [key: string]: unknown;
}

export interface PackageInfo {
    /** The package's directory under packages/, for example `cspell-lib`. */
    dir: string;
    file: string;
    /** The file's text, as read. */
    text: string;
    json: PackageJson;
    /** The GitHub issue label: the directory name, or the package it's an alias of. */
    label: string;
}

/** Every packages/<dir>/package.json. Directories without one, such as leftovers holding only `node_modules`, are skipped. */
export async function readPackages(): Promise<PackageInfo[]> {
    const packagesDir = path.join(rootDir, 'packages');
    const dirs = (await fs.readdir(packagesDir, { withFileTypes: true })).filter((d) => d.isDirectory());
    const packages: PackageInfo[] = [];
    for (const { name: dir } of dirs) {
        const file = path.join(packagesDir, dir, 'package.json');
        let text: string;
        try {
            text = await fs.readFile(file, 'utf8');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
            throw error;
        }
        let json: PackageJson;
        try {
            json = JSON.parse(text) as PackageJson;
        } catch (error) {
            throw new Error(`${path.relative(rootDir, file)}: ${error instanceof Error ? error.message : error}`, {
                cause: error,
            });
        }
        packages.push({ dir, file, text, json, label: labelAliases[dir] ?? dir });
    }
    return packages.sort((a, b) => a.dir.localeCompare(b.dir));
}
