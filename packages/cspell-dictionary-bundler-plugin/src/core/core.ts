import { fileURLToPath, pathToFileURL } from 'node:url';

import { createFilter, dataToEsm } from '@rollup/pluginutils';
import type { CSpellConfigFileReaderWriter } from 'cspell-config-lib';
import { createReaderWriter } from 'cspell-config-lib';
import { createUnplugin, type UnpluginInstance } from 'unplugin';

import { CSpellDictionaryBundler } from './bundler.ts';
import type { Options } from './options.ts';

export function createPlugin(): UnpluginInstance<Options | undefined, false> {
    return createUnplugin((rawOptions = {}) => {
        const options = resolveOptions(rawOptions);
        const filter = createFilter(options.include, options.exclude);

        let readerWriter: CSpellConfigFileReaderWriter | undefined = undefined;
        let bundler: CSpellDictionaryBundler | undefined = undefined;

        const name = '@cspell/dictionary-bundler-plugin';
        return {
            name,
            enforce: options.enforce,

            transform: {
                // filter: {
                //     id: { include: options.include, exclude: options.exclude },
                // },
                async handler(code, id) {
                    console.log(`Can transform ${id}? ${filter(id) ? 'yes' : 'no'}`);
                    if (!filter(id)) return undefined;
                    console.log(`Transforming ${id} with ${code.length} characters`);
                    readerWriter ??= createReaderWriter();
                    bundler ??= new CSpellDictionaryBundler(readerWriter);

                    const url = pathToFileURL(id);
                    const configFile = await bundler.bundle(url, code);
                    const inlineCode = dataToEsm(configFile.settings, {
                        // preferConst: options.preferConst,
                        // compact: options.compact,
                        namedExports: false,
                        // includeArbitraryNames: options.includeArbitraryNames,
                        // indent,
                    });

                    return {
                        code: inlineCode,
                        map: { mappings: '' },
                    };
                },
            },
            resolveId: {
                // filter: {
                //     id: { include: options.include, exclude: options.exclude },
                // },
                handler(id, importer) {
                    console.log(`Can Resolve ${id}? ${filter(id) ? 'yes' : 'no'} %o`, { id, importer });
                    if (id.includes('\0') || !filter(id)) return undefined;
                    const importedFromUrl = pathToFileURL(importer || process.cwd() + '/');
                    const resolvedId = fileURLToPath(import.meta.resolve(id, importedFromUrl));
                    console.log(`Resolving ${id}: %o`, import.meta.resolve(id));
                    return {
                        id: resolvedId,
                        external: false,
                        moduleSideEffects: false,
                    };
                },
            },
        };
    });
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type OptionsResolved = Overwrite<Required<Options>, Pick<Options, 'enforce' | 'exclude'>>;

export function resolveOptions(options: Options): OptionsResolved {
    return {
        include: options.include || [/.*cspell(?:[-]ext)?(\..*)?\.(?:jsonc?|ya?ml|toml)$/i],
        exclude: options.exclude || undefined,
        enforce: 'enforce' in options ? options.enforce : 'pre',
    };
}
