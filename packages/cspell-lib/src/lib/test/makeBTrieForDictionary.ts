import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { generateBTrie } from '@cspell/cspell-tools';
import type { CSpellUserSettings } from '@cspell/cspell-types';
import { importResolveModuleName } from '@cspell/dynamic-import';

export function getModuleUrl(moduleName: string): URL {
    return importResolveModuleName(moduleName, [import.meta.url]);
}

export async function getDictionaryDefinitionsForModule(
    moduleName: string,
): Promise<Exclude<CSpellUserSettings['dictionaryDefinitions'], undefined>> {
    const moduleUrl = getModuleUrl(moduleName);

    const json = await readFile(moduleUrl, 'utf8');
    const config: CSpellUserSettings = JSON.parse(json);

    return config.dictionaryDefinitions || [];
}

export async function makeBTrieForDictionary(module: string): Promise<void> {
    const moduleUrl = getModuleUrl(module);
    const dictDefs = await getDictionaryDefinitionsForModule(module);
    const files: URL[] = dictDefs
        .map((def) => def.path)
        .filter((path): path is string => typeof path === 'string')
        .map((path) => {
            const url = new URL(path, moduleUrl);
            return url;
        });

    for (const file of files) {
        const bTriePath = fileURLToPath(file).replace(/\.(txt|dic|trie)(\.gz)?$/i, '.btrie.gz');
        const fileStat = await stat(bTriePath).catch(() => undefined);
        if (fileStat) continue;
        await generateBTrie([fileURLToPath(file)], { compress: true });
    }
}
