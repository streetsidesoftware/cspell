import { opConcatMap, pipe } from '@cspell/cspell-pipe/sync';

import type { CompileCommonAppOptions } from './AppOptions.js';
import { compile } from './compiler/compile.js';
import { createCompileRequest } from './compiler/createCompileRequest.js';
import type { FeatureFlags } from './FeatureFlags/index.js';
import { getSystemFeatureFlags, parseFlags } from './FeatureFlags/index.js';
import { globP } from './util/globP.js';

getSystemFeatureFlags().register('compound', 'Enable compound dictionary sources.');

export async function processCompileAction(
    src: string[],
    options: CompileCommonAppOptions,
    featureFlags: FeatureFlags | undefined
): Promise<void> {
    const ff = featureFlags || getSystemFeatureFlags();
    parseFlags(ff, options.experimental);
    return useCompile(src, options);
}

async function useCompile(src: string[], options: CompileCommonAppOptions): Promise<void> {
    console.log(
        'Compile:\n output: %s\n compress: %s\n files:\n  %s \n\n',
        options.output || 'default',
        options.compress ? 'true' : 'false',
        src.join('\n  ')
    );

    const globResults = await Promise.all(src.map((s) => globP(s)));
    const sources = [
        ...pipe(
            globResults,
            opConcatMap((a) => a)
        ),
    ];

    return compile(createCompileRequest(sources, options));
}
