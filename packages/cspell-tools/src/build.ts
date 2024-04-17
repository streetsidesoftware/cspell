import * as path from 'node:path';

import { cosmiconfig } from 'cosmiconfig';

import { compile } from './compiler/index.js';
import type { CompileRequest, Target } from './config/index.js';
import { normalizeConfig } from './config/index.js';

export interface BuildOptions {
    /** Optional path to config file */
    config?: string | undefined;

    /** Used to resolve relative paths in the config. */
    root?: string | undefined;

    /** Current working directory */
    cwd?: string | undefined;

    /** Conditional build based upon the targets matching the `checksum.txt` file. */
    conditional?: boolean;
}

const moduleName = 'cspell-tools';
const searchPlaces = [
    `${moduleName}.config.json`,
    `${moduleName}.config.yaml`,
    `${moduleName}.config.yml`,
    'package.json',
];

export async function build(targets: string[] | undefined, options: BuildOptions) {
    const allowedTargets = new Set(targets || []);

    function filter(target: Target): boolean {
        return !allowedTargets.size || allowedTargets.has(target.name);
    }

    const searchDir = path.resolve(options.root || options.cwd || '.');

    const explorer = cosmiconfig(moduleName, {
        searchPlaces,
        stopDir: searchDir,
        transform: normalizeConfig,
    });

    const config = await (options.config ? explorer.load(options.config) : explorer.search(searchDir));

    if (!config?.config) {
        console.error('root: %s', options.root);
        throw 'cspell-tools.config not found.';
    }

    const configDir = path.dirname(config.filepath);
    const buildInfo: CompileRequest = normalizeRequest(
        config.config,
        path.resolve(configDir, options.root || configDir),
    );
    await compile(buildInfo, { filter, cwd: options.cwd, conditionalBuild: options.conditional || false });
}

function normalizeRequest(buildInfo: CompileRequest, root: string): CompileRequest {
    const { rootDir = root, targets = [], checksumFile } = buildInfo;
    return { rootDir: path.resolve(rootDir), targets, checksumFile };
}
