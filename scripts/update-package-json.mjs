#!/usr/bin/env node

import fs from 'node:fs/promises';
import { globby } from 'globby';

const rootUrl = new URL('../', import.meta.url);

async function updatePackageJson(pkgFile) {
    const directory = pkgFile.split(/[/\\]/g).slice(-3, -1).join('/');
    console.log(directory);

    const pkg = JSON.parse(await fs.readFile(pkgFile, 'utf-8'));

    const repository = {
        type: 'git',
        url: 'git+https://github.com/streetsidesoftware/cspell.git',
        directory,
    };

    pkg.repository = repository;

    await fs.writeFile(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
}

async function run() {
    console.log('Updating package.json files...\n');

    const files = await globby('packages/*/package.json', { cwd: rootUrl, absolute: true });

    await Promise.all(files.map(updatePackageJson));
    console.log('\nDone.');
}

run();
