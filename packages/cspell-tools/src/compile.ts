import { writeFile } from 'node:fs/promises';

import { opConcatMap, pipe } from '@cspell/cspell-pipe/sync';
import YAML from 'yaml';

import type { CompileCommonAppOptions } from './AppOptions.js';
import { compile } from './compiler/compile.js';
import { createCompileRequest } from './compiler/createCompileRequest.js';
import { configFileSchemaURL, type RunConfig } from './config/config.js';
import type { FeatureFlags } from './FeatureFlags/index.js';
import { getSystemFeatureFlags, parseFlags } from './FeatureFlags/index.js';
import { globP } from './util/globP.js';

getSystemFeatureFlags().register('compound', 'Enable compound dictionary sources.');

const defaultConfigFile = 'cspell-tools.config.yaml';

export const configFileHeader = `# yaml-language-server: $schema=${configFileSchemaURL}\n\n`;

export async function processCompileAction(
    src: string[],
    options: CompileCommonAppOptions,
    featureFlags: FeatureFlags | undefined,
): Promise<void> {
    const ff = featureFlags || getSystemFeatureFlags();
    parseFlags(ff, options.experimental || []);
    return useCompile(src, options);
}

async function useCompile(src: string[], options: CompileCommonAppOptions): Promise<void> {
    console.log(
        'Compile:\n output: %s\n compress: %s\n files:\n  %s',
        options.output || 'default',
        options.compress ? 'true' : 'false',
        src.join('\n  '),
    );
    if (options.listFile && options.listFile.length) {
        console.log(' list files:\n  %s', options.listFile.join('\n  '));
    }
    console.log('\n\n');

    const globResults = await Promise.all(src.map((s) => globP(s)));
    const sources = [
        ...pipe(
            globResults,
            opConcatMap((a) => a),
        ),
    ];

    const request = createCompileRequest(sources, options);
    return options.init ? initConfig(request) : compile(request);
}

async function initConfig(runConfig: RunConfig): Promise<void> {
    const { $schema = configFileSchemaURL, ...cfg } = runConfig;
    const config = { $schema, ...cfg };
    const content = configFileHeader + YAML.stringify(config, null, 2);
    console.log('Writing config file: %s', defaultConfigFile);
    await writeFile(defaultConfigFile, content);

    console.log(`Init complete.
To build, use:
  cspell-tools-cli build
`);
}
