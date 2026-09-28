/*
 * Fix up packages/<dir>/package.json: `repository` and `homepage`, and for published packages `bugs`,
 * which lists the package's open issues by its label (see create-package-labels.mts).
 * Usage: node ./scripts/fix-package-json.mts [--dry-run]
 *   --dry-run  Report which files need fixing without writing them; exit 1 if any do.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import type { PackageInfo, PackageJson } from './lib/packages.mts';
import { readPackages, repoUrl, rootDir } from './lib/packages.mts';

const homepages: Record<string, string> = {
    cspell: 'https://cspell.org/',
};

function bugsUrl(label: string): string {
    return `${repoUrl}/issues?q=${encodeURIComponent(`is:issue state:open label:${label}`)}`;
}

/** Set `key`, keeping its place. A new key goes after `after` if that exists, otherwise at the end. */
function setField(json: PackageJson, key: string, value: unknown, after?: string): PackageJson {
    if (key in json || !after || !(after in json)) return { ...json, [key]: value };
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(json)) {
        result[k] = v;
        if (k === after) result[key] = value;
    }
    return result as PackageJson;
}

/** A string or `null` `bugs` becomes `{ url }`; an object keeps its other fields, such as `email`. */
function bugsWithUrl(bugs: unknown, url: string): Record<string, unknown> {
    return bugs && typeof bugs === 'object' ? { ...bugs, url } : { url };
}

function fixPackage(pkg: PackageInfo): PackageJson {
    let json = pkg.json;
    json = setField(json, 'repository', {
        type: 'git',
        url: `${repoUrl}.git`,
        directory: `packages/${pkg.dir}`,
    });
    json = setField(json, 'homepage', homepages[pkg.dir] ?? `${repoUrl}/tree/main/packages/${pkg.dir}#readme`);
    if (!json.private) {
        json = setField(json, 'bugs', bugsWithUrl(json.bugs, bugsUrl(pkg.label)), 'repository');
    }
    return json;
}

async function main(): Promise<void> {
    const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } });
    const dryRun = values['dry-run'];

    const packages = await readPackages();
    let needsFix = 0;
    for (const pkg of packages) {
        const fixed = fixPackage(pkg);
        if (JSON.stringify(fixed) === JSON.stringify(pkg.json)) continue;
        ++needsFix;
        const rel = path.relative(rootDir, pkg.file);
        if (dryRun) {
            console.error(`${rel} needs fixing.`);
            continue;
        }
        await fs.writeFile(pkg.file, JSON.stringify(fixed, undefined, 2) + '\n');
        console.log(`Fixed ${rel}`);
    }

    if (dryRun && needsFix) {
        console.error(`\n${needsFix} package.json file(s) need fixing. Run: node ./scripts/fix-package-json.mts`);
        process.exitCode = 1;
    } else if (!needsFix) {
        console.log(`All ${packages.length} package.json files are up to date.`);
    }
}

try {
    await main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
