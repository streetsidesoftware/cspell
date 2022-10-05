import { opConcatMap, pipe } from '@cspell/cspell-pipe/sync';
import { CompileCommonAppOptions } from './AppOptions';
import { FeatureFlags, getSystemFeatureFlags, parseFlags } from './FeatureFlags';
import { compile } from './compiler/compile';
import { createCompileRequest } from './compiler/createCompileRequest';
import { globP } from './compiler/globP';

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
