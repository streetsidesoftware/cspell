import { cosmiconfig } from 'cosmiconfig';
import { compile } from './compiler';
import { normalizeConfig } from './config';

export interface BuildOptions {
    /** Optional path to config file */
    config?: string;
}

const moduleName = 'cspell-tools';

const explorer = cosmiconfig(moduleName, {
    searchPlaces: [
        `.${moduleName}.config.json`,
        `.${moduleName}.config.yaml`,
        `.${moduleName}.config.yml`,
        'package.json',
    ],
    stopDir: '.',
    transform: normalizeConfig,
});

export async function build(targets: string[] | undefined, options: BuildOptions) {
    console.log('build targets: %o, options: %o', targets, options);

    const config = await (options.config ? explorer.load(options.config) : explorer.search());

    if (!config?.config) {
        console.error('cspell-tools.config not found.');
        return;
    }

    await compile(config.config);

    console.log('Config: %o', config);
}
