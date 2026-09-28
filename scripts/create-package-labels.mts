/*
 * Create a GitHub issue label for each published package that doesn't have one yet.
 * The label is the package's directory under packages/ (see fix-package-json.mts, which links `bugs` to it).
 * Usage: node ./scripts/create-package-labels.mts
 * Needs `gh`, authenticated.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { readPackages } from './lib/packages.mts';

const run = promisify(execFile);
const labelColor = 'c5def5';

async function main(): Promise<void> {
    const { stdout } = await run('gh', ['label', 'list', '--limit', '1000', '--json', 'name']);
    // GitHub label names are unique regardless of case.
    const existing = new Set((JSON.parse(stdout) as { name: string }[]).map((l) => l.name.toLowerCase()));

    const labels = new Map<string, string>();
    for (const pkg of await readPackages()) {
        if (!pkg.json.private) labels.set(pkg.label, pkg.json.name);
    }

    let created = 0;
    for (const [label, name] of labels) {
        if (existing.has(label.toLowerCase())) continue;
        await run('gh', ['label', 'create', label, '--color', labelColor, '--description', `Issues with ${name}`]);
        console.log(`Created label ${label}`);
        ++created;
    }
    console.log(created ? `Created ${created} label(s).` : `All ${labels.size} package labels exist.`);
}

try {
    await main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
