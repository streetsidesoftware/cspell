import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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
        const consoleLog = options.debug ? console.log.bind(console) : () => {};

        let readerWriter: CSpellConfigFileReaderWriter | undefined = undefined;
        let bundler: CSpellDictionaryBundler | undefined = undefined;

        const name = '@cspell/dictionary-bundler-plugin';
        return {
            name,
            enforce: options.enforce,

            transform: {
                filter: {
                    id: { include: options.include, exclude: options.exclude },
                },
                async handler(code, id) {
                    consoleLog(`Can transform ${id}? ${filter(id) ? 'yes' : 'no'}`);
                    if (!filter(id)) return undefined;
                    consoleLog(`Transforming ${id} with ${code.length} characters`);
                    readerWriter ??= createReaderWriter();
                    bundler ??= new CSpellDictionaryBundler(readerWriter, options);

                    const url = pathToFileURL(id);
                    const configFile = await bundler.bundle(url, code);
                    const inlineCode = dataToEsm(configFile.settings, {
                        // preferConst: options.preferConst,
                        // compact: options.compact,
                        namedExports: true,
                        // preferConst: true,
                        // includeArbitraryNames: options.includeArbitraryNames,
                        // indent,
                    });

                    return {
                        // code: inlineCode,
                        code: inlineCode,
                        map: undefined,
                    };
                },
            },
            resolveId: {
                filter: {
                    id: { include: options.include, exclude: options.exclude },
                },
                handler(id, importer) {
                    consoleLog(`Can Resolve ${id}? ${filter(id) ? 'yes' : 'no'} %o`, { id, importer });
                    if (id.includes('\0') || !filter(id)) return undefined;
                    const resolvedId = resolveId(id, importer);
                    if (!resolvedId) return undefined;
                    consoleLog(`Resolving ${id}: %o`, {
                        resolvedId,
                    });
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

function resolveId(id: string, importer?: string): string | undefined {
    if (id.includes('\0')) return undefined;
    const dir = (importer ? path.dirname(importer) : process.cwd()) + '/';
    if (id.startsWith('./') || id.startsWith('../')) {
        return path.resolve(dir, id);
    }
    const require = createRequire(pathToFileURL(dir));
    try {
        return require.resolve(id, { paths: [dir] });
    } catch {
        return undefined;
    }
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type OptionsResolved = Overwrite<Required<Options>, Pick<Options, 'enforce' | 'exclude'>>;

export function resolveOptions(options: Options): OptionsResolved {
    return {
        include: options.include || [/.*cspell(?:[-]ext)?(\..*)?\.(?:jsonc?|ya?ml|toml)$/i],
        exclude: options.exclude || undefined,
        enforce: 'enforce' in options ? options.enforce : 'pre',
        convertToBTrie: options.convertToBTrie ?? true,
        minConvertSize: options.minConvertSize ?? 200,
        compress: options.compress ?? true,
        debug: !!options.debug,
    };
}
