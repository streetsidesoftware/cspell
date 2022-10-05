import { cosmiconfig } from 'cosmiconfig';
import { compile } from './compiler';
import { normalizeConfig } from './config';
import * as path from 'path';

export interface BuildOptions {
    /** Optional path to config file */
    config?: string;

    root?: string;
}

const moduleName = 'cspell-tools';
const searchPlaces = [
    `${moduleName}.config.json`,
    `${moduleName}.config.yaml`,
    `${moduleName}.config.yml`,
    'package.json',
];

export async function build(targets: string[] | undefined, options: BuildOptions) {
    if (options.root) {
        process.chdir(path.resolve(options.root));
    }
    const explorer = cosmiconfig(moduleName, {
        searchPlaces,
        stopDir: path.resolve('.'),
        transform: normalizeConfig,
    });

    const config = await (options.config ? explorer.load(options.config) : explorer.search('.'));

    if (!config?.config) {
        console.error('root: %s', options.root);
        throw 'cspell-tools.config not found.';
    }

    await compile(config.config);
}
