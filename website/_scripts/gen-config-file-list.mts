import fs from 'node:fs/promises';

import { defaultConfigFilenames } from 'cspell-lib';

import { URL_SITE_COMPONENTS } from './lib/constants.mts';
import { relativeToSite } from './lib/utils.mts';

const configFileListJsonURL = new URL('config-filenames.json', URL_SITE_COMPONENTS);

export async function run(): Promise<void> {
    console.log(`Generating config file list component at ${relativeToSite(configFileListJsonURL)}`);
    await fs.writeFile(configFileListJsonURL, JSON.stringify(defaultConfigFilenames, undefined, 2), 'utf-8');
    console.log(`Generating config file list component at ${relativeToSite(configFileListJsonURL)} -- Done.`);
}

if (import.meta.main) {
    run();
}
