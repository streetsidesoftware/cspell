#!/usr/bin/env node

// See: https://github.com/microsoft/vscode-languageserver-node/blob/master/build/bin/linking.js

const path  = require('path');
const shell = require('shelljs');

const fs = require('fs');
const promisify = require('util').promisify;
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

/**
 * @param {string} module
 * @param {string} name
 * @param {string} source
 */
async function symlink(module, name, source) {
    const current = process.cwd();
    try {
        const nodeModules = path.join(module, 'node_modules');
        if (!await exists(nodeModules)) {
            await mkdir(nodeModules);
        }
        process.chdir(nodeModules);
        if (await exists(name)) {
            shell.rm('-rf' , name);
        }
        shell.ln('-s', source, name);
    } finally {
        process.chdir(current);
    }
}

/**
 *
 * @param {string} file
 * @returns {Object|undefined}
 */
async function readPackage(file) {
    if (!(await exists(file))) {
        return undefined;
    }

    const json = await readFile(file, 'utf8');
    return JSON.parse(json);
}

/**
 *
 * @param {string} dir
 * @returns {Object[]} returns the contents of package.json keyed by the directory
 */
async function readPackages(dir) {
    const packageDirs = await readdir(dir);

    const packages = [];
    for (const package of packageDirs) {
        const packageDir = path.join(dir, package);
        const p = await readPackage(path.join(packageDir, 'package.json'));
        if (p) {
            p._packageDir = packageDir;
            packages.push(p);
        }
    }

    return packages;
}

/**
 * @param {Object[]} packages
 * @returns {Map<string,string}
 */
function mapByPackageName(packages) {
    const map = new Map(
        packages
        .filter(p => !!p.name)
        .map(p => [p.name, p._packageDir])
    );
    return map;
}

function extractDependencies(package) {
    return Object.keys(package.dependencies || {}).concat(Object.keys(package.devDependencies || {}));
}

/**
 *
 * @param {Object[]} packages
 */
async function symLinkPackages(packages) {
    const mapByName = mapByPackageName(packages);

    for (const package of packages) {
        console.log('Linking ' + package.name)
        const deps = extractDependencies(package);
        for (dep of deps) {
            const location = mapByName.get(dep);
            if (location) {
                console.log('  SymLink ' + dep)
                await symlink(package._packageDir, dep, location)
            }
        }
    }
}

async function main() {
    const packagesRoot = path.resolve(process.argv[2] || 'packages');
    const packages = await readPackages(packagesRoot);
    symLinkPackages(packages);
}

main();
