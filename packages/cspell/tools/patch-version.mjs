import { promises as fs } from 'node:fs';

const urlPackageJson = new URL('../package.json', import.meta.url);
const urlVersionFile = new URL('../src/app/pkgInfo.ts', import.meta.url);

async function readPackageJson() {
    const pkgJson = await fs.readFile(urlPackageJson, 'utf8');
    return JSON.parse(pkgJson);
}

async function writeVersionFile(pkgJson) {
    const fileContent = `\
// This file is generated by tools/patch-version.mjs

export { pkgDir } from './dirname.js';

export const name = '${pkgJson.name}';
export const version = '${pkgJson.version}';
export const engines = { node: '${pkgJson.engines.node}' };

export const npmPackage = { name, version, engines };
`;
    await fs.writeFile(urlVersionFile, fileContent);
}

async function run() {
    const pkgJson = await readPackageJson();
    await writeVersionFile(pkgJson);
}

await run();
