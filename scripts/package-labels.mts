/*
 * Keep a GitHub label per published package, and each package's `bugs.url` pointing to its open issues.
 * The label is the package's directory under packages/.
 * Usage: node ./scripts/package-labels.mts [--check | --fix | --create-labels]
 *   --check          Report packages whose `bugs.url` is out of date (default).
 *   --fix            Rewrite `bugs.url` in each package.json.
 *   --create-labels  Create missing labels on GitHub. Needs `gh`, authenticated.
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs, promisify } from 'node:util';

const run = promisify(execFile);

// eslint-disable-next-line n/no-unsupported-features/node-builtins
const rootDir = path.join(import.meta.dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const repoUrl = 'https://github.com/streetsidesoftware/cspell';
const labelColor = 'c5def5';

/** Packages whose issues share another package's label. */
const labelAliases: Record<string, string> = {
    'cspell-tools-alias': 'cspell-tools',
};

interface PackageJson {
    name: string;
    private?: boolean;
    bugs?: { url?: string };
    [key: string]: unknown;
}

interface PackageInfo {
    file: string;
    json: PackageJson;
    label: string;
}

function bugsUrl(label: string): string {
    return `${repoUrl}/issues?q=${encodeURIComponent(`is:issue state:open label:${label}`)}`;
}

async function readPackages(): Promise<PackageInfo[]> {
    const dirs = (await fs.readdir(packagesDir, { withFileTypes: true })).filter((d) => d.isDirectory());
    const packages: PackageInfo[] = [];
    for (const dir of dirs) {
        const file = path.join(packagesDir, dir.name, 'package.json');
        const json = JSON.parse(await fs.readFile(file, 'utf8')) as PackageJson;
        if (json.private) continue;
        packages.push({ file, json, label: labelAliases[dir.name] ?? dir.name });
    }
    return packages.sort((a, b) => a.label.localeCompare(b.label));
}

/** Set `bugs`, keeping its place, or adding it after `repository` (or at the end). */
function withBugs(json: PackageJson, url: string): PackageJson {
    if ('bugs' in json) return { ...json, bugs: { ...json.bugs, url } };
    const result: PackageJson = { name: json.name };
    for (const [key, value] of Object.entries(json)) {
        result[key] = value;
        if (key === 'repository') result.bugs = { url };
    }
    if (!result.bugs) result.bugs = { url };
    return result;
}

async function checkOrFix(packages: PackageInfo[], fix: boolean): Promise<number> {
    let outOfDate = 0;
    for (const pkg of packages) {
        const expected = bugsUrl(pkg.label);
        if (pkg.json.bugs?.url === expected) continue;
        ++outOfDate;
        const rel = path.relative(rootDir, pkg.file);
        if (fix) {
            await fs.writeFile(pkg.file, JSON.stringify(withBugs(pkg.json, expected), undefined, 2) + '\n');
            console.log(`Fixed ${rel}`);
        } else {
            console.error(`${rel}: bugs.url should be ${expected}`);
        }
    }
    return outOfDate;
}

async function createLabels(packages: PackageInfo[]): Promise<void> {
    const { stdout } = await run('gh', ['label', 'list', '--limit', '1000', '--json', 'name']);
    const existing = new Set((JSON.parse(stdout) as { name: string }[]).map((l) => l.name));
    const byLabel = new Map(packages.map((p) => [p.label, p.json.name]));
    for (const [label, name] of byLabel) {
        if (existing.has(label)) continue;
        await run('gh', ['label', 'create', label, '--color', labelColor, '--description', `Issues with ${name}`]);
        console.log(`Created label ${label}`);
    }
}

async function main(): Promise<void> {
    const { values } = parseArgs({
        options: {
            check: { type: 'boolean', default: false },
            fix: { type: 'boolean', default: false },
            'create-labels': { type: 'boolean', default: false },
        },
    });
    const packages = await readPackages();

    if (values['create-labels']) {
        await createLabels(packages);
        return;
    }

    const outOfDate = await checkOrFix(packages, values.fix);
    if (outOfDate && !values.fix) {
        console.error(`\n${outOfDate} package(s) out of date. Run: node ./scripts/package-labels.mts --fix`);
        process.exitCode = 1;
    } else if (!outOfDate) {
        console.log(`All ${packages.length} published packages link to their open issues.`);
    }
}

try {
    await main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
