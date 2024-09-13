#!/usr/bin/env node

import fs from 'node:fs/promises';

import { globby } from 'globby';

const rootUrl = new URL('../', import.meta.url);

const homepages = {
    'packages/cspell': 'https://cspell.org/',
};

async function updatePackageJson(pkgFile) {
    const directory = pkgFile.split(/[/\\]/g).slice(-3, -1).join('/');
    console.log(directory);

    const pkg = JSON.parse(await fs.readFile(pkgFile, 'utf8'));

    const repository = {
        type: 'git',
        url: 'https://github.com/streetsidesoftware/cspell.git',
        directory,
    };

    pkg.repository = repository;
    pkg.homepage =
        homepages[directory] || 'https://github.com/streetsidesoftware/cspell/tree/main/' + directory + '#readme';

    await fs.writeFile(pkgFile, JSON.stringify(pkg, undefined, 2) + '\n');
}

async function run() {
    console.log('Updating package.json files...\n');

    const files = await globby('packages/*/package.json', { cwd: rootUrl, absolute: true });

    await Promise.all(files.map(updatePackageJson));
    console.log('\nDone.');
}

run();
